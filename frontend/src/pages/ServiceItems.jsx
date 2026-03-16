import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE, authHeader } from '../auth.js';

export default function ServiceItems() {
  const { id } = useParams();
  const serviceId = Number(id);

  const [service, setService] = useState(null);
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [amount, setAmount] = useState('');
  const [itemFile, setItemFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editName, setEditName] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editFile, setEditFile] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const canSubmit = useMemo(
    () => name.trim().length > 0 && quantity.trim().length > 0 && amount.trim().length > 0 && !!itemFile,
    [name, quantity, amount, itemFile],
  );

  const load = async () => {
    if (!serviceId) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const [serviceResp, itemsResp] = await Promise.all([
        axios.get(`${API_BASE}/api/services/${serviceId}`),
        axios.get(`${API_BASE}/api/services/${serviceId}/items`, { headers: authHeader() }),
      ]);
      setService(serviceResp.data);
      setItems(itemsResp.data || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load service items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [serviceId]);

  const add = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', itemFile);
      const uploadResp = await axios.post(
        `${API_BASE}/api/services/${serviceId}/items/upload-image`,
        formData,
        {
          headers: {
            ...authHeader(),
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      const photoUrl = uploadResp.data?.url;
      if (!photoUrl) {
        setError('Failed to upload item image');
        return;
      }

      const amt = amount.trim();
      const resp = await axios.post(
        `${API_BASE}/api/services/${serviceId}/items`,
        {
          name: name.trim(),
          quantity: quantity.trim(),
          amount: amt ? Number(amt) : undefined,
          photo_url: photoUrl,
        },
        { headers: authHeader() },
      );
      setItems((prev) => [resp.data, ...prev]);
      setName('');
      setQuantity('');
      setAmount('');
      setItemFile(null);
      setSuccess('Item added');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add item');
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };

  const remove = async (itemId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Delete this item?')) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.delete(`${API_BASE}/api/services/${serviceId}/items/${itemId}`, { headers: authHeader() });
      setItems((prev) => prev.filter((x) => x.id !== itemId));
      setSuccess('Item deleted');
      if (editingItem?.id === itemId) setEditingItem(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete item');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (it) => {
    setEditingItem(it);
    setEditName(it.name || '');
    setEditQuantity(it.quantity || '');
    setEditAmount(it.amount != null ? String(it.amount) : '');
    setEditFile(null);
    setError('');
    setSuccess('');
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditName('');
    setEditQuantity('');
    setEditAmount('');
    setEditFile(null);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    const name = editName.trim();
    const qty = editQuantity.trim();
    const amt = editAmount.trim();
    if (!name || !qty || !amt) {
      setError('Name, quantity and price per item are required');
      return;
    }
    setSavingEdit(true);
    setError('');
    setSuccess('');
    try {
      let photoUrl = editingItem.photo_url || '';
      if (editFile) {
        const formData = new FormData();
        formData.append('file', editFile);
        const uploadResp = await axios.post(
          `${API_BASE}/api/services/${serviceId}/items/upload-image`,
          formData,
          { headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' } },
        );
        photoUrl = uploadResp.data?.url || photoUrl;
      }
      const resp = await axios.put(
        `${API_BASE}/api/services/${serviceId}/items/${editingItem.id}`,
        { name, quantity: qty, amount: Number(amt), photo_url: photoUrl },
        { headers: authHeader() },
      );
      setItems((prev) => prev.map((x) => (x.id === editingItem.id ? resp.data : x)));
      setSuccess('Item updated');
      cancelEdit();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update item');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="bg-background-light">
      <div className="max-w-5xl mx-auto px-4 py-3 md:py-4">
        <div className="mb-3">
          <div className="min-w-0">
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 truncate">
              {service?.name || `Service #${serviceId}`}
            </h2>
            <p className="text-sm text-slate-500 mt-1 mb-0">
              Add the things you provide in this service (e.g., bucket, bhagona, spoon).
            </p>
          </div>
        </div>

        {(error || success) && (
          <div className="mb-4 space-y-2">
            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </div>
            )}
          </div>
        )}

        <div className="rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="text-base font-extrabold tracking-tight text-slate-900">Add item</h3>
          </div>
          <div className="p-4">
            <form onSubmit={add} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div className="md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                  Item name *
                </label>
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary/40"
                  placeholder="e.g., Bucket"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                  Quantity *
                </label>
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary/40"
                  placeholder="e.g., 10"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                  Price per item (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary/40"
                  placeholder="e.g., 50"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="md:col-span-4">
                <label className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                  Item image *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2 block w-full text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary/90"
                  onChange={(e) => setItemFile(e.target.files?.[0] || null)}
                  disabled={loading || uploading}
                  required
                />
              </div>
              <div className="md:col-span-3 flex gap-3">
                <button
                  type="submit"
                  disabled={!canSubmit || loading || uploading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary text-white px-5 py-2.5 text-sm font-extrabold shadow-md shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {loading || uploading ? 'Saving...' : 'Add item'}
                </button>
                <button
                  type="button"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  onClick={load}
                >
                  Refresh
                </button>
              </div>
            </form>
          </div>
        </div>

        {editingItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-3 sm:px-4"
            onClick={cancelEdit}
          >
            <div
              className="w-full max-w-md rounded-3xl bg-white border border-slate-100 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
                <div>
                  <h3 className="text-base font-extrabold tracking-tight text-slate-900">Update item</h3>
                  <p className="text-xs text-slate-500 mb-0">Editing: {editingItem.name}</p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  onClick={cancelEdit}
                  disabled={savingEdit}
                  aria-label="Close"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
              <div className="p-5">
                <form onSubmit={saveEdit} className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Item name *</label>
                    <input
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary/40"
                      placeholder="e.g., Bucket"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Quantity *</label>
                    <input
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary/40"
                      placeholder="e.g., 10"
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Price per item (₹) *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary/40"
                      placeholder="e.g., 50"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Change image (optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="mt-2 block w-full text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary/90"
                      onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                      disabled={savingEdit}
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={savingEdit}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary text-white px-5 py-2.5 text-sm font-extrabold shadow-md shadow-primary/30 hover:shadow-primary/50 disabled:opacity-60"
                    >
                      {savingEdit ? 'Saving...' : 'Update item'}
                    </button>
                    <button
                      type="button"
                      disabled={savingEdit}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                      onClick={cancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-extrabold tracking-tight text-slate-900">Items</h3>
            <span className="text-xs font-extrabold text-slate-700 bg-slate-100 border border-slate-200 rounded-full px-3 py-1">
              {items.length}
            </span>
          </div>
          <div className="p-4">
            {items.length === 0 ? (
              <div className="text-center text-sm text-slate-500 py-8">
                No items added yet.
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((it) => (
                  <div
                    key={it.id}
                    role="button"
                    tabIndex={0}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-2.5 hover:bg-slate-50/40 transition-colors cursor-pointer"
                    onClick={() => openEdit(it)}
                    onKeyDown={(e) => e.key === 'Enter' && openEdit(it)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        {it.photo_url ? (
                          <img
                            src={it.photo_url}
                            alt={it.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-slate-900 truncate mb-0">{it.name}</p>
                        <p className="text-xs text-slate-500 truncate mb-0">
                          Qty: {it.quantity || '—'}
                          {typeof it.amount === 'number' ? ` • Price per item: ₹${it.amount}` : ''}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
                      onClick={(e) => remove(it.id, e)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

