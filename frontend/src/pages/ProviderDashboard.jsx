import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE, authHeader } from '../auth.js';

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    photo_url: '',
    photo_urls: [],
    location: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [servicesResp, bookingsResp] = await Promise.all([
        axios.get(`${API_BASE}/api/services/my`, { headers: authHeader() }),
        axios.get(`${API_BASE}/api/bookings/my`, { headers: authHeader() }),
      ]);
      setServices(servicesResp.data);
      setBookings(bookingsResp.data);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      price: '',
      photo_url: '',
      photo_urls: [],
      location: '',
    });
    setEditingId(null);
    setError('');
    setSuccess('');
  };

  const openForm = () => {
    setShowForm(true);
  };

  const create = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const trimmedGallery = (form.photo_urls || []).map((u) => u.trim()).filter(Boolean);
      if (trimmedGallery.length === 0 && !form.photo_url.trim()) {
        setError('Please upload at least one image.');
        setLoading(false);
        return;
      }

      const payload = {
        ...form,
        price: form.price !== '' && form.price != null ? Number(form.price) : null,
        photo_url: form.photo_url.trim() || trimmedGallery[0] || '',
        photo_urls: trimmedGallery.length > 0 ? trimmedGallery : undefined,
      };
      await axios.post(`${API_BASE}/api/services/`, payload, { headers: authHeader() });
      setSuccess('Service created successfully!');
      resetForm();
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (service) => {
    const gallery = Array.isArray(service.photo_urls) && service.photo_urls.length > 0 ? service.photo_urls : [];
    setForm({
      name: service.name,
      description: service.description || '',
      price: service.price != null ? String(service.price) : '',
      photo_url: service.photo_url || (gallery[0] || ''),
      photo_urls: gallery.length > 0 ? gallery : (service.photo_url ? [service.photo_url] : []),
      location: service.location,
    });
    setEditingId(service.id);
    setError('');
    setSuccess('');
    openForm();
  };

  const update = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const trimmedGallery = (form.photo_urls || []).map((u) => u.trim()).filter(Boolean);
      if (trimmedGallery.length === 0 && !form.photo_url.trim()) {
        setError('Please upload at least one image.');
        setLoading(false);
        return;
      }

      const payload = {
        ...form,
        price: form.price !== '' && form.price != null ? Number(form.price) : null,
        photo_url: form.photo_url.trim() || trimmedGallery[0] || '',
        photo_urls: trimmedGallery.length > 0 ? trimmedGallery : undefined,
      };
      await axios.put(`${API_BASE}/api/services/${editingId}`, payload, { headers: authHeader() });
      setSuccess('Service updated successfully!');
      resetForm();
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update service');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setError('');
    setSuccess('');
    setUploadingImages(true);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));

      const resp = await axios.post(`${API_BASE}/api/services/upload-images`, formData, {
        headers: {
          ...authHeader(),
          'Content-Type': 'multipart/form-data',
        },
      });

      const urls = resp.data?.urls || [];
      if (!urls.length) {
        setError('Failed to upload images. Please try again.');
        return;
      }

      setForm((prev) => {
        const combined = [...(prev.photo_urls || []), ...urls];
        return {
          ...prev,
          photo_urls: combined,
          photo_url: prev.photo_url || combined[0] || '',
        };
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload images');
    } finally {
      setUploadingImages(false);
      event.target.value = '';
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    
    setLoading(true);
    try {
      await axios.delete(`${API_BASE}/api/services/${id}`, { headers: authHeader() });
      setSuccess('Service deleted successfully!');
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete service');
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    resetForm();
    setShowForm(false);
  };

  const currency = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
      Number.isFinite(Number(n)) ? Number(n) : 0
    );

  const serviceById = useMemo(() => {
    const map = new Map();
    for (const s of services) map.set(s.id, s);
    return map;
  }, [services]);

  const stats = useMemo(() => {
    const totalBookings = bookings.length;
    const activeBookings = bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed').length;
    const revenue = bookings
      .filter((b) => b.status === 'confirmed')
      .reduce((sum, b) => {
        const svc = serviceById.get(b.service_id);
        const price = svc?.price ?? 0;
        return sum + Number(price) * Number(b.quantity ?? 1);
      }, 0);
    return {
      revenue,
      activeBookings,
      totalBookings,
      avgRating: 4.8,
    };
  }, [bookings, serviceById]);

  const recentBookings = useMemo(() => bookings.slice(0, 3), [bookings]);

  return (
    <div className="bg-background-light">
      <div className="max-w-6xl mx-auto px-4 py-4 md:py-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900">
              Vendor Dashboard
            </h2>
            <p className="text-sm text-slate-500">Track performance, manage services, and review bookings.</p>
          </div>
        </div>

        {(error || success) && (
          <div className="mb-6 space-y-3">
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

        {/* Performance Summary */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] font-extrabold uppercase tracking-[0.26em] text-slate-600">
              Performance Summary
            </h3>
            <span className="text-[11px] text-slate-500">Last 30 days</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Total Revenue
                </p>
                <span className="material-symbols-outlined text-primary/70 text-base">payments</span>
              </div>
              <div className="mt-2 text-xl font-black tracking-tight text-slate-900">
                {currency(stats.revenue)}
              </div>
              <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                +12%
              </div>
            </div>
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Active Bookings
                </p>
                <span className="material-symbols-outlined text-primary/70 text-base">calendar_month</span>
              </div>
              <div className="mt-2 text-xl font-black tracking-tight text-slate-900">
                {stats.activeBookings}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                {stats.totalBookings} total
              </div>
            </div>
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Avg. Rating
                </p>
                <span className="material-symbols-outlined text-primary/70 text-base">star</span>
              </div>
              <div className="mt-2 text-xl font-black tracking-tight text-slate-900">
                {stats.avgRating}
              </div>
              <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                <span className="material-symbols-outlined text-[14px]">north_east</span>
                +0.2%
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Manage Services */}
          <section className="lg:col-span-3">
            <div className="rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between gap-4 border-b border-slate-100">
                <div className="space-y-0.5">
                  <h3 className="text-base font-extrabold tracking-tight text-slate-900">Manage Services</h3>
                  <p className="text-xs text-slate-500">{services.length} services</p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-white px-4 py-2 text-sm font-bold shadow-md shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all"
                  onClick={openForm}
                  disabled={loading}
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  Add New
                </button>
              </div>

              <div className="p-5">
                {loading && (
                  <div className="text-center text-sm text-slate-500 py-8">Loading...</div>
                )}

                {!loading && services.length === 0 && (
                  <div className="text-center py-10">
                    <div className="mx-auto size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                      <span className="material-symbols-outlined">inventory_2</span>
                    </div>
                    <p className="font-bold text-slate-900">No services yet</p>
                    <p className="text-sm text-slate-500 mt-1">Click “Add New” to create your first service.</p>
                  </div>
                )}

                {!loading && services.length > 0 && (
                  <div className="space-y-3">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className="rounded-2xl border border-slate-100 bg-white hover:bg-slate-50/40 transition-colors p-3 cursor-pointer"
                        onClick={() => navigate(`/dashboard/services/${service.id}/items`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            {service.photo_url ? (
                              <img
                                src={service.photo_url}
                                alt={service.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : null}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="font-extrabold text-slate-900 truncate">{service.name}</p>
                                <p className="text-xs text-slate-500 truncate">
                                  {service.location}{service.description ? ` • ${service.description}` : ''}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs font-extrabold text-slate-700 bg-slate-100 border border-slate-200 rounded-full px-3 py-1">
                                  {service.price != null && service.price !== '' ? currency(service.price) : 'From items'}
                                </span>
                                <button
                                  type="button"
                                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                                  onClick={(e) => { e.stopPropagation(); startEdit(service); }}
                                  disabled={loading}
                                >
                                  <span className="material-symbols-outlined text-sm">edit</span>
                                </button>
                                <button
                                  type="button"
                                  className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
                                  onClick={(e) => { e.stopPropagation(); remove(service.id); }}
                                  disabled={loading}
                                >
                                  <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Recent Bookings */}
          <aside className="lg:col-span-2">
            <div className="rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between gap-4 border-b border-slate-100">
                <div className="space-y-0.5">
                  <h3 className="text-base font-extrabold tracking-tight text-slate-900">Recent Bookings</h3>
                  <p className="text-xs text-slate-500">Latest requests from customers</p>
                </div>
                <span className="text-xs font-extrabold text-primary bg-primary/10 rounded-full px-3 py-1">
                  {bookings.length}
                </span>
              </div>

              <div className="p-5">
                {loading && <div className="text-center text-sm text-slate-500 py-6">Loading...</div>}

                {!loading && bookings.length === 0 && (
                  <div className="text-center py-10">
                    <div className="mx-auto size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                      <span className="material-symbols-outlined">receipt_long</span>
                    </div>
                    <p className="font-bold text-slate-900">No bookings yet</p>
                    <p className="text-sm text-slate-500 mt-1">Once customers book, they’ll appear here.</p>
                  </div>
                )}

                {!loading && bookings.length > 0 && (
                  <div className="space-y-3">
                    {recentBookings.map((b) => {
                      const svc = serviceById.get(b.service_id);
                      const statusTone =
                        b.status === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : b.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200';
                      return (
                        <div key={b.id} className="rounded-2xl border border-slate-100 bg-white p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-extrabold text-slate-900 truncate">
                                {svc?.name || `Service #${b.service_id}`}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                <span className="inline-flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px]">event</span>
                                  {String(b.event_date)}
                                </span>
                                <span className="mx-2 text-slate-300">•</span>
                                Qty: {b.quantity}
                              </p>
                            </div>
                            <span className={`shrink-0 text-[11px] font-extrabold uppercase tracking-[0.2em] border rounded-full px-3 py-1 ${statusTone}`}>
                              {b.status}
                            </span>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="text-xs text-slate-500">
                              Booking #{b.id}
                            </div>
                            <div className="text-sm font-black text-slate-900">
                              {svc?.price != null ? currency(Number(svc.price) * Number(b.quantity ?? 1)) : 'From items'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div className="pt-2">
                      <p className="text-[11px] text-slate-500">
                        Tip: booking details are visible in your bookings list endpoint (`/api/bookings/my`).
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Add/Edit Service Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-3 sm:px-4"
          onClick={cancelEdit}
        >
          <div
            className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white border border-slate-100 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
              <div className="space-y-0.5">
                <h3 className="text-base font-extrabold tracking-tight text-slate-900">
                  {editingId ? 'Edit Service' : 'Add New Service'}
                </h3>
                <p className="text-xs text-slate-500">Fill the details below and save.</p>
              </div>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                onClick={cancelEdit}
                disabled={loading}
                aria-label="Close"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="p-5">
              <form onSubmit={editingId ? update : create} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                    Service Name *
                  </label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary/40"
                    placeholder="e.g., Grand Plaza Ballroom"
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                    Description
                  </label>
                  <textarea
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary/40"
                    placeholder="Premium menu options, decor theme, packages..."
                    name="description"
                    value={form.description}
                    onChange={onChange}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                    Location *
                  </label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary/40"
                    placeholder="e.g., Mumbai, Delhi"
                    name="location"
                    value={form.location}
                    onChange={onChange}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                    Service Images * (upload from your device)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="mt-2 block w-full text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary/90"
                    onChange={handleImageUpload}
                    disabled={uploadingImages || loading}
                  />
                  {uploadingImages && (
                    <p className="mt-1 text-[11px] text-slate-500">Uploading images...</p>
                  )}
                  {form.photo_urls && form.photo_urls.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {form.photo_urls.map((url, idx) => (
                        <div key={url + idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
                          <img
                            src={url}
                            alt={`Service image ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          <button
                            type="button"
                            className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-white/90 border border-slate-300 text-[10px] text-slate-700 shadow-sm"
                            onClick={() => {
                              setForm((prev) => {
                                const next = [...(prev.photo_urls || [])];
                                next.splice(idx, 1);
                                const nextPrimary = next[0] || '';
                                return {
                                  ...prev,
                                  photo_urls: next,
                                  photo_url: nextPrimary,
                                };
                              });
                            }}
                          >
                            <span className="material-symbols-outlined text-[14px]">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="mt-1 text-[11px] text-slate-500">
                    Upload at least one clear image of your service. The first image will be shown as the cover photo.
                  </p>
                </div>

                <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary text-white px-5 py-3 text-sm font-extrabold shadow-md shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0"
                    type="submit"
                    disabled={loading}
                  >
                    <span className="material-symbols-outlined text-base">
                      {editingId ? 'save' : 'add_circle'}
                    </span>
                    {loading ? 'Saving...' : (editingId ? 'Update Service' : 'Add Service')}
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={cancelEdit}
                    disabled={loading}
                  >
                    <span className="material-symbols-outlined text-base">close</span>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
