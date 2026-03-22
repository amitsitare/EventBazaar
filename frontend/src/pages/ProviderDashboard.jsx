import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Calendar,
  Package,
  Edit3,
  Trash2,
  X,
  Upload,
  MapPin,
  DollarSign,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Activity,
  Eye,
  MessageSquare,
  TrendingUp,
  ChevronDown,
  CreditCard,
} from 'lucide-react';
import { API_BASE, authHeader } from '../auth';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  photo_url: '',
  photo_urls: [],
  location: '',
};

const formatDate = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatDateTime = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const currency = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(Number(n)) ? Number(n) : 0);

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [providerPayments, setProviderPayments] = useState([]);
  const [paymentsOpen, setPaymentsOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [servicesResp, bookingsResp, paymentsResp] = await Promise.all([
        axios.get(`${API_BASE}/api/services/my`, { headers: authHeader() }),
        axios.get(`${API_BASE}/api/bookings/my`, { headers: authHeader() }),
        axios.get(`${API_BASE}/api/payments/provider`, { headers: authHeader() }).catch(() => ({ data: [] })),
      ]);

      const bookingsData = Array.isArray(bookingsResp.data) ? bookingsResp.data : [];
      const byServiceCount = bookingsData.reduce((acc, b) => {
        const key = Number(b.service_id);
        if (!Number.isFinite(key)) return acc;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      const normalizedServices = (Array.isArray(servicesResp.data) ? servicesResp.data : []).map((s) => {
        const gallery = Array.isArray(s.photo_urls) ? s.photo_urls.filter(Boolean) : [];
        return {
          ...s,
          id: Number(s.id),
          photo_urls: gallery,
          photo_url: s.photo_url || gallery[0] || '',
          bookings_count: Number(s.bookings_count ?? byServiceCount[Number(s.id)] ?? 0),
          views: Number(s.views ?? 0),
          price: s.price == null ? null : Number(s.price),
        };
      });

      const normalizedBookings = bookingsData.map((b) => ({
        ...b,
        id: Number(b.id),
        service_id: Number(b.service_id),
        quantity: Number(b.quantity ?? 1) || 1,
        customer_id: Number(b.customer_id ?? 0),
        paid_amount: b.paid_amount != null && b.paid_amount !== '' ? Number(b.paid_amount) : null,
      }));

      const payRows = Array.isArray(paymentsResp.data) ? paymentsResp.data : [];
      setProviderPayments(
        payRows.map((p) => ({
          ...p,
          id: Number(p.id),
          amount: Number(p.amount ?? 0),
          booking_id: p.booking_id != null ? Number(p.booking_id) : null,
        }))
      );

      setServices(normalizedServices);
      setBookings(normalizedBookings);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const serviceById = useMemo(() => {
    const map = new Map();
    for (const s of services) map.set(Number(s.id), s);
    return map;
  }, [services]);

  const confirmedBookingAmount = (b) => {
    const paid = Number(b.paid_amount);
    if (Number.isFinite(paid) && paid > 0) return paid;
    const svc = serviceById.get(Number(b.service_id));
    return Number(svc?.price ?? 0) * Number(b.quantity ?? 1);
  };

  const stats = useMemo(() => {
    const totalBookings = bookings.length;
    const activeBookings = bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed').length;
    const revenue = bookings
      .filter((b) => b.status === 'confirmed')
      .reduce((sum, b) => sum + confirmedBookingAmount(b), 0);
    return {
      totalBookings,
      activeBookings,
      revenue,
      totalViews: services.reduce((sum, s) => sum + Number(s.views || 0), 0),
    };
  }, [bookings, services, serviceById]);

  const verifiedPaymentsTotal = useMemo(
    () =>
      providerPayments.filter((p) => p.signature_status === 'verified').reduce((sum, p) => sum + Number(p.amount || 0), 0),
    [providerPayments]
  );

  const pieData = useMemo(
    () => [
      { name: 'Confirmed', value: bookings.filter((b) => b.status === 'confirmed').length, color: '#FFD700' },
      { name: 'Pending', value: bookings.filter((b) => b.status === 'pending').length, color: '#6B7280' },
      { name: 'Cancelled', value: bookings.filter((b) => b.status === 'cancelled').length, color: '#EF4444' },
    ],
    [bookings]
  );

  const recentBookings = useMemo(
    () =>
      [...bookings]
        .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())
        .slice(0, 5),
    [bookings]
  );

  const openForm = () => setShowForm(true);
  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const cancelEdit = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (service) => {
    const gallery = Array.isArray(service.photo_urls) ? service.photo_urls : [];
    setForm({
      name: service.name || '',
      description: service.description || '',
      price: service.price == null ? '' : String(service.price),
      photo_url: service.photo_url || gallery[0] || '',
      photo_urls: gallery.length ? gallery : service.photo_url ? [service.photo_url] : [],
      location: service.location || '',
    });
    setEditingId(service.id);
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  const persistService = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const trimmedGallery = (form.photo_urls || []).map((u) => u.trim()).filter(Boolean);
      if (!trimmedGallery.length && !form.photo_url.trim()) {
        setError('Please upload at least one image.');
        setLoading(false);
        return;
      }

      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        location: form.location.trim(),
        price: form.price !== '' ? Number(form.price) : null,
        photo_url: form.photo_url.trim() || trimmedGallery[0] || '',
        photo_urls: trimmedGallery.length ? trimmedGallery : undefined,
      };

      if (editingId) {
        await axios.put(`${API_BASE}/api/services/${editingId}`, payload, { headers: authHeader() });
        setSuccess('Service updated successfully!');
      } else {
        await axios.post(`${API_BASE}/api/services/`, payload, { headers: authHeader() });
        setSuccess('Service created successfully!');
      }

      cancelEdit();
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setUploadingImages(true);
    setError('');
    try {
      const data = new FormData();
      files.forEach((f) => data.append('files', f));
      const resp = await axios.post(`${API_BASE}/api/services/upload-images`, data, {
        headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' },
      });
      const urls = Array.isArray(resp.data?.urls) ? resp.data.urls : [];
      if (!urls.length) {
        setError('Failed to upload images. Please try again.');
        return;
      }
      setForm((prev) => {
        const combined = [...(prev.photo_urls || []), ...urls];
        return { ...prev, photo_urls: combined, photo_url: prev.photo_url || combined[0] || '' };
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload images');
    } finally {
      setUploadingImages(false);
      event.target.value = '';
    }
  };

  const removeService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    setLoading(true);
    setError('');
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

  return (
    <main className="bg-background-light min-h-screen py-6 px-3 md:px-4 text-slate-900">
      <div className="max-w-7xl mx-auto space-y-5">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight">Provider Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your services and monitor booking performance.</p>
          </div>
          <button
            onClick={openForm}
            className="inline-flex items-center gap-1.5 bg-primary px-4 py-2.5 rounded-xl text-sm font-bold text-black"
          >
            <Plus className="size-4" /> Add Service
          </button>
        </header>

        <AnimatePresence>
          {(error || success) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  <AlertCircle className="size-4" /> {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  <CheckCircle2 className="size-4" /> {success}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-slate-100 p-4 lg:col-span-2">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Revenue</div>
            <div className="text-2xl font-black mb-1">{currency(stats.revenue)}</div>
            <p className="text-[11px] text-slate-500 mb-3">
              From confirmed bookings (uses amount actually paid when recorded; otherwise service price × quantity).
            </p>
            <div className="h-40 rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-100 p-3 flex flex-col justify-end">
              <div className="h-16 flex items-end gap-1.5">
                {[25, 35, 30, 55, 48, 70].map((h, i) => (
                  <div key={i} className="flex-1 bg-primary/70 rounded-t-md" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="mt-2 text-[11px] text-slate-500">Last 6 months snapshot</div>
            </div>

            <div className="mt-3 border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between mb-2.5">
                <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Quick Actions</div>
                <div className="text-[10px] text-slate-400">One-tap shortcuts</div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {[
                  { label: 'New Service', hint: 'Create listing', icon: Plus, onClick: openForm, accent: 'bg-amber-50 border-amber-200 text-amber-700' },
                  { label: 'View Calendar', hint: 'Check events', icon: Calendar, onClick: () => {}, accent: 'bg-blue-50 border-blue-200 text-blue-700' },
                  { label: 'Messages', hint: 'Open inbox', icon: MessageSquare, onClick: () => {}, accent: 'bg-violet-50 border-violet-200 text-violet-700' },
                  { label: 'Analytics', hint: 'Track growth', icon: TrendingUp, onClick: () => {}, accent: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
                ].map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={action.onClick}
                    className="group rounded-xl border border-slate-200 bg-white p-2.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/70 hover:border-slate-300 hover:bg-slate-50/80"
                  >
                    <div className="flex items-start gap-2 w-full">
                      <div className={`mt-0.5 size-7 rounded-lg border flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${action.accent}`}>
                        <action.icon className="size-3.5 transition-transform duration-200 group-hover:scale-110" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold text-slate-800 leading-tight group-hover:text-slate-900">{action.label}</div>
                        <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{action.hint}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-white rounded-2xl border border-slate-100 p-4">
              <div className="text-[11px] uppercase text-slate-400 font-bold">Total Views</div>
              <div className="text-xl font-black mt-1">{stats.totalViews.toLocaleString()}</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-4">
              <div className="text-[11px] uppercase text-slate-400 font-bold">Active Bookings</div>
              <div className="text-xl font-black mt-1">{stats.activeBookings}</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-4">
              <div className="text-[11px] uppercase text-slate-400 font-bold">Total Bookings</div>
              <div className="text-xl font-black mt-1">{stats.totalBookings}</div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <button
            type="button"
            onClick={() => setPaymentsOpen((o) => !o)}
            className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-slate-50/80 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <CreditCard className="size-5 text-emerald-700" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-black text-slate-900">Payments received</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {providerPayments.length} record{providerPayments.length === 1 ? '' : 's'} · Verified total{' '}
                  <span className="font-semibold text-slate-700">{currency(verifiedPaymentsTotal)}</span>
                </div>
              </div>
            </div>
            <ChevronDown
              className={`size-5 text-slate-400 shrink-0 transition-transform ${paymentsOpen ? 'rotate-180' : ''}`}
            />
          </button>
          <AnimatePresence initial={false}>
            {paymentsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-slate-100"
              >
                <div className="p-4 pt-0">
                  {providerPayments.length === 0 ? (
                    <p className="text-sm text-slate-500 py-4">No payment records yet for your services.</p>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-100 mt-3">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 uppercase tracking-wide text-[10px]">
                            <th className="py-2.5 px-3 font-bold">When</th>
                            <th className="py-2.5 px-3 font-bold">Service</th>
                            <th className="py-2.5 px-3 font-bold">Customer</th>
                            <th className="py-2.5 px-3 font-bold text-right">Amount</th>
                            <th className="py-2.5 px-3 font-bold">Status</th>
                            <th className="py-2.5 px-3 font-bold">Booking</th>
                            <th className="py-2.5 px-3 font-bold">Payment ID</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {providerPayments.map((p) => (
                            <tr key={p.id} className="bg-white hover:bg-slate-50/80">
                              <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{formatDateTime(p.created_at)}</td>
                              <td className="py-2.5 px-3 font-semibold text-slate-800 max-w-[140px] truncate" title={p.service_name}>
                                {p.service_name || '—'}
                              </td>
                              <td className="py-2.5 px-3 text-slate-600 max-w-[160px]">
                                <div className="truncate font-medium text-slate-800" title={p.customer_name}>
                                  {p.customer_name || '—'}
                                </div>
                                <div className="truncate text-[10px] text-slate-400" title={p.customer_email}>
                                  {p.customer_email || ''}
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-slate-900">{currency(p.amount)}</td>
                              <td className="py-2.5 px-3">
                                <span
                                  className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                    p.signature_status === 'verified'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {p.signature_status || '—'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-600">{p.booking_id != null ? `#${p.booking_id}` : '—'}</td>
                              <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500 max-w-[120px] truncate" title={p.payment_id}>
                                {p.payment_id || '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black">Your Services</h2>
              <span className="text-xs text-slate-500">{services.length} total</span>
            </div>
            {loading && <div className="bg-white rounded-2xl border border-slate-100 p-6 text-sm text-slate-500">Loading...</div>}
            {!loading && services.length === 0 && (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                <Package className="size-7 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-700">No services yet</p>
              </div>
            )}
            {!loading &&
              services.map((service) => (
                <div
                  key={service.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/dashboard/services/${service.id}/items`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/dashboard/services/${service.id}/items`);
                    }
                  }}
                  className="bg-white rounded-2xl border border-slate-100 p-4 flex gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <div className="size-20 rounded-xl overflow-hidden bg-slate-50 shrink-0">
                    {service.photo_url ? (
                      <img src={service.photo_url} alt={service.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-300">
                        <ImageIcon />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
                      <MapPin className="size-3" /> {service.location || '-'}
                    </div>
                    <h3 className="text-lg font-black truncate">{service.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{service.description || 'No description'}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="font-bold text-primary">{service.price != null ? currency(service.price) : 'Custom Quote'}</span>
                      <span className="text-slate-500 inline-flex items-center gap-1">
                        <Eye className="size-3.5" /> {service.views || 0}
                      </span>
                      <span className="text-slate-500 inline-flex items-center gap-1">
                        <Calendar className="size-3.5" /> {service.bookings_count || 0}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(service);
                      }}
                      className="size-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center"
                    >
                      <Edit3 className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeService(service.id);
                      }}
                      className="size-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>

          <div className="lg:col-span-4 space-y-3">
            <div className="bg-white rounded-2xl border border-slate-100 p-4">
              <h3 className="text-sm font-black mb-2.5">Booking Status</h3>
              <div className="space-y-2.5">
                {pieData.map((item) => {
                  const total = Math.max(1, bookings.length);
                  const width = Math.round((item.value / total) * 100);
                  return (
                    <div key={item.name}>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-semibold text-slate-600">{item.name}</span>
                        <span className="text-slate-500">{item.value}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${width}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-4">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-sm font-black">Recent Activity</h3>
                <Activity className="size-3.5 text-slate-400" />
              </div>
              <div className="space-y-2">
                {recentBookings.length === 0 && <p className="text-xs text-slate-500">No recent bookings.</p>}
                {recentBookings.map((b) => {
                  const svc = serviceById.get(Number(b.service_id));
                  const paid = Number(b.paid_amount);
                  const fromPaid = Number.isFinite(paid) && paid > 0;
                  const fromListPrice =
                    svc?.price != null ? Number(svc.price) * Number(b.quantity || 1) : null;
                  const lineTotal = fromPaid ? paid : fromListPrice;
                  return (
                    <div key={b.id} className="rounded-xl border border-slate-100 p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">{formatDate(b.event_date)}</span>
                        <span className="text-[10px] font-bold uppercase text-slate-600">{b.status}</span>
                      </div>
                      <p className="text-xs font-bold truncate mt-1">{svc?.name || `Service #${b.service_id}`}</p>
                      <p className="text-[11px] text-slate-500 mt-1">Customer #{b.customer_id || '-'} | Qty {b.quantity}</p>
                      <div className="mt-1.5 text-xs font-bold text-primary inline-flex items-center gap-1">
                        {lineTotal != null ? currency(lineTotal) : '—'}
                        <ChevronRight className="size-3" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] p-3 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={cancelEdit}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="relative w-full max-w-xl rounded-2xl border border-slate-100 bg-white p-4 md:p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black">{editingId ? 'Edit Service' : 'Create Service'}</h2>
                <button onClick={cancelEdit} className="size-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={persistService} className="space-y-3">
                <input
                  required
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  placeholder="Service name"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                />
                <textarea
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  placeholder="Description"
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm resize-none"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="relative">
                    <MapPin className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      required
                      name="location"
                      value={form.location}
                      onChange={onChange}
                      placeholder="Location"
                      className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2.5 text-sm"
                    />
                  </div>
                  <div className="relative">
                    <DollarSign className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      name="price"
                      value={form.price}
                      onChange={onChange}
                      placeholder="Price"
                      className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 cursor-pointer">
                    <Upload className="size-4" />
                    <span className="text-xs">{uploadingImages ? 'Uploading...' : 'Upload images'}</span>
                    <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                  </label>
                  {!!form.photo_urls.length && (
                    <div className="mt-2 grid grid-cols-4 gap-1.5">
                      {form.photo_urls.map((url, idx) => (
                        <div key={url + idx} className="relative rounded-lg overflow-hidden border border-slate-200">
                          <img src={url} alt="service" className="w-full h-14 object-cover" />
                          <button
                            type="button"
                            onClick={() =>
                              setForm((prev) => {
                                const next = [...prev.photo_urls];
                                next.splice(idx, 1);
                                return { ...prev, photo_urls: next, photo_url: next[0] || '' };
                              })
                            }
                            className="absolute top-1 right-1 size-5 rounded-md bg-black/60 text-white flex items-center justify-center"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-1 flex gap-2">
                  <button
                    type="submit"
                    disabled={loading || uploadingImages}
                    className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-bold text-black disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : editingId ? 'Update Service' : 'Create Service'}
                  </button>
                  <button type="button" onClick={cancelEdit} className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
  