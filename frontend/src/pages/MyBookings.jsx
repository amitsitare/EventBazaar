import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_BASE, authHeader } from '../auth.js';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/api/bookings/my`, { headers: authHeader() });
      setBookings(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const sortedBookings = useMemo(
    () =>
      [...bookings].sort(
        (a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
      ),
    [bookings]
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const statusStyle = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cancelled':
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <main className="bg-background-light min-h-screen py-6 md:py-10">
      <div className="max-w-5xl mx-auto px-4">
        <header className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-primary mb-1">
              Your events
            </p>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
              My Bookings
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track all the services you&apos;ve booked in one place.
            </p>
          </div>
        </header>

        <section className="rounded-3xl bg-white border border-slate-100 shadow-sm p-4 md:p-6">
          {loading && (
            <div className="py-10 text-center text-sm text-slate-500">
              <div className="mb-3 inline-flex size-10 items-center justify-center rounded-full border border-primary/20">
                <span className="material-symbols-outlined text-primary animate-spin-slow">
                  autorenew
                </span>
              </div>
              <div>Loading your bookings...</div>
            </div>
          )}

          {!loading && sortedBookings.length === 0 && (
            <div className="py-10 text-center">
              <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-primary/5 text-primary">
                <span className="material-symbols-outlined text-3xl">calendar_month</span>
              </div>
              <h2 className="text-base md:text-lg font-bold text-slate-900 mb-1">
                No bookings yet
              </h2>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Once you book a service, your upcoming and past events will appear here.
              </p>
            </div>
          )}

          {!loading && sortedBookings.length > 0 && (
            <div className="space-y-3">
              {sortedBookings.map((b) => (
                <article
                  key={b.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-white transition-colors px-4 py-3 md:px-5 md:py-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Booking #{b.id}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Service ID: {b.service_id}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-700">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-slate-500">
                          event
                        </span>
                        {formatDate(b.event_date)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-slate-500">
                          group
                        </span>
                        Qty: {b.quantity}
                      </span>
                      {b.address && (
                        <span className="inline-flex items-center gap-1.5 text-slate-500">
                          <span className="material-symbols-outlined text-[16px] text-slate-400">
                            location_on
                          </span>
                          <span className="truncate max-w-xs">{b.address}</span>
                        </span>
                      )}
                    </div>
                    {b.notes && (
                      <p className="mt-1 text-xs md:text-sm text-slate-500 line-clamp-2">
                        {b.notes}
                      </p>
                    )}
                  </div>

                  <div className="mt-2 md:mt-0 flex flex-col items-end gap-2 shrink-0">
                    <span
                      className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.2em] ${statusStyle(
                        b.status
                      )}`}
                    >
                      {b.status}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
