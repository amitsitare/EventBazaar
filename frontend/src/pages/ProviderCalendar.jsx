import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_BASE, authHeader } from '../auth.js';

const formatDate = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function ProviderCalendar() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

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

  const dateWiseBookings = useMemo(
    () => bookings.filter((b) => String(b.event_date || '').slice(0, 10) === selectedDate),
    [bookings, selectedDate]
  );

  const bookingDates = useMemo(() => new Set(bookings.map((b) => String(b.event_date || '').slice(0, 10))), [bookings]);

  return (
    <main className="min-h-screen bg-background-light py-6 px-3 md:px-4 text-slate-900">
      <div className="max-w-7xl mx-auto space-y-4">
        <header>
          <p className="text-xs uppercase tracking-widest text-slate-500">Provider</p>
          <h1 className="text-2xl md:text-3xl font-black">Bookings Calendar</h1>
          <p className="text-sm text-slate-500">Select a date from calendar and view bookings received on that date.</p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <aside className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-black mb-2">Calendar</h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
            <div className="mt-3 text-xs text-slate-600">
              {bookingDates.has(selectedDate) ? 'Bookings available on this date.' : 'No bookings on selected date.'}
            </div>
          </aside>

          <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <h3 className="text-sm font-black">Bookings on {formatDate(selectedDate)}</h3>
            </div>
            {loading ? (
              <div className="p-6 text-sm text-slate-500">Loading bookings...</div>
            ) : dateWiseBookings.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">No bookings found for this date.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {dateWiseBookings.map((b) => (
                  <div key={b.id} className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-slate-900">{b.service_name || `Service #${b.service_id}`}</p>
                      <span className="text-xs font-semibold uppercase text-slate-500">{b.status || '-'}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Booking #{b.id} · Customer #{b.customer_id} · Qty {b.quantity || 1}
                    </p>
                    {b.address && <p className="text-xs text-slate-600 mt-1">{b.address}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
