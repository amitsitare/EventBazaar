import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_BASE, authHeader } from '../auth.js';

const formatDate = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const currency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n || 0));

export default function ProviderBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API_BASE}/api/bookings/my`, { headers: authHeader() });
        setBookings(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalAmount = useMemo(
    () => bookings.reduce((sum, b) => sum + Number(b.paid_amount || 0), 0),
    [bookings]
  );

  return (
    <main className="min-h-screen bg-background-light py-6 px-3 md:px-4 text-slate-900">
      <div className="max-w-7xl mx-auto space-y-4">
        <header>
          <p className="text-xs uppercase tracking-widest text-slate-500">Provider</p>
          <h1 className="text-2xl md:text-3xl font-black">All Bookings Received</h1>
          <p className="text-sm text-slate-500">{bookings.length} bookings · {currency(totalAmount)} total paid amount</p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          {loading ? (
            <div className="p-6 text-sm text-slate-500">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">No bookings received yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2">Booking</th>
                    <th className="px-3 py-2">Event Date</th>
                    <th className="px-3 py-2">Service</th>
                    <th className="px-3 py-2">Customer</th>
                    <th className="px-3 py-2">Qty</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2 text-right">Paid Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-t border-slate-100">
                      <td className="px-3 py-2 font-semibold">#{b.id}</td>
                      <td className="px-3 py-2">{formatDate(b.event_date)}</td>
                      <td className="px-3 py-2">{b.service_name || `Service #${b.service_id}`}</td>
                      <td className="px-3 py-2">#{b.customer_id}</td>
                      <td className="px-3 py-2">{b.quantity || 1}</td>
                      <td className="px-3 py-2">{b.status || '-'}</td>
                      <td className="px-3 py-2 text-right font-bold">{currency(b.paid_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
