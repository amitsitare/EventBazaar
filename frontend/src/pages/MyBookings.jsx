import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_BASE, authHeader } from '../auth.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function MyBookings() {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reviewDrafts, setReviewDrafts] = useState({});
  const [submittingReviewId, setSubmittingReviewId] = useState(null);
  const [reviewMessage, setReviewMessage] = useState('');

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

  const statusLabel = (status) => {
    if (status === 'confirmed') return t('myBookingsStatusConfirmed');
    if (status === 'pending') return t('myBookingsStatusPending');
    if (status === 'cancelled') return t('myBookingsStatusCancelled');
    return status;
  };

  const getDaysLeftMeta = (eventDate) => {
    if (!eventDate) return null;
    const dateOnly = new Date(`${eventDate}T00:00:00`);
    if (Number.isNaN(dateOnly.getTime())) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffMs = dateOnly.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return { expired: true, text: 'Service date passed. This booking can no longer be used.' };
    if (daysLeft === 0) return { expired: false, text: 'Service is scheduled for today.' };
    return { expired: false, text: `${daysLeft} day${daysLeft > 1 ? 's' : ''} left for service date.` };
  };

  const isReviewEligible = (booking) => {
    if (!booking || booking.status !== 'confirmed' || !booking.event_date) return false;
    const eventDate = new Date(`${booking.event_date}T00:00:00`);
    if (Number.isNaN(eventDate.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate.getTime() < today.getTime();
  };

  const setDraftField = (bookingId, field, value) => {
    setReviewDrafts((prev) => ({
      ...prev,
      [bookingId]: {
        ...(prev[bookingId] || {}),
        [field]: value,
      },
    }));
  };

  const submitReview = async (booking) => {
    if (!isReviewEligible(booking)) {
      setReviewMessage(t('myBookingsReviewEligible'));
      return;
    }
    const draft = reviewDrafts[booking.id] || {};
    const rating = Number(draft.rating || booking.review_rating || 0);
    if (!rating || rating < 1 || rating > 5) {
      setReviewMessage(t('myBookingsReviewRatingRange'));
      return;
    }
    setSubmittingReviewId(booking.id);
    setReviewMessage('');
    try {
      await axios.post(
        `${API_BASE}/api/bookings/${booking.id}/review`,
        {
          rating,
          comment: (draft.comment ?? booking.review_comment ?? '').trim() || null,
        },
        { headers: authHeader() }
      );
      await load();
      setReviewMessage(`Review saved for booking #${booking.id}.`);
    } catch (err) {
      setReviewMessage(err.response?.data?.detail || t('myBookingsReviewSaveFail'));
    } finally {
      setSubmittingReviewId(null);
    }
  };

  const downloadInvoice = async (bookingId) => {
    const resp = await axios.get(`${API_BASE}/api/bookings/${bookingId}/invoice`, {
      headers: authHeader(),
      responseType: 'blob',
    });
    const blob = new Blob([resp.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_booking_${bookingId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <main className="bg-background-light min-h-screen py-6 md:py-10">
      <div className="max-w-5xl mx-auto px-4">
        <header className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-primary mb-1">
              {t('myBookingsBadge')}
            </p>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-primary">
              {t('myBookingsTitle')}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {t('myBookingsSubtitle')}
            </p>
          </div>
        </header>

        <section className="rounded-3xl bg-white border border-slate-100 shadow-sm p-4 md:p-6">
          {reviewMessage && (
            <div className="mb-3 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
              {reviewMessage}
            </div>
          )}
          {loading && (
            <div className="py-10 text-center text-sm text-slate-500">
              <div className="mb-3 inline-flex size-10 items-center justify-center rounded-full border border-primary/20">
                <span className="material-symbols-outlined text-primary animate-spin-slow">
                  autorenew
                </span>
              </div>
              <div>{t('myBookingsLoading')}</div>
            </div>
          )}

          {!loading && sortedBookings.length === 0 && (
            <div className="py-10 text-center">
              <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-primary/5 text-primary">
                <span className="material-symbols-outlined text-3xl">calendar_month</span>
              </div>
              <h2 className="text-base md:text-lg font-bold text-slate-900 mb-1">
                {t('myBookingsEmptyTitle')}
              </h2>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                {t('myBookingsEmptyBody')}
              </p>
            </div>
          )}

          {!loading && sortedBookings.length > 0 && (
            <div className="space-y-3">
              {sortedBookings.map((b) => {
                const daysMeta = getDaysLeftMeta(b.event_date);
                return (
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
                      {b.service_name && (
                        <span className="text-[11px] text-slate-500 font-medium">
                          {b.service_name}
                        </span>
                      )}
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
                    {daysMeta && (
                      <p className={`mt-2 text-xs font-semibold ${daysMeta.expired ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {daysMeta.text}
                      </p>
                    )}
                  </div>

                  <div className="mt-2 md:mt-0 flex flex-col items-end gap-2 shrink-0">
                    <span
                      className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.2em] ${statusStyle(
                        b.status
                      )}`}
                    >
                      {statusLabel(b.status)}
                    </span>
                    <button
                      onClick={() => downloadInvoice(b.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                    >
                      <span className="material-symbols-outlined text-[15px]">download</span>
                      {t('myBookingsDownloadInvoice')}
                    </button>
                  </div>
                  {isReviewEligible(b) && (
                    <div className="mt-3 w-full rounded-xl border border-amber-200 bg-amber-50/60 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 mb-2">
                        {t('myBookingsReviewTitle')}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const selected = Number(reviewDrafts[b.id]?.rating || b.review_rating || 0) >= star;
                          return (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setDraftField(b.id, 'rating', star)}
                              className={`h-8 w-8 rounded-lg border text-sm font-bold transition ${
                                selected
                                  ? 'border-amber-400 bg-amber-100 text-amber-700'
                                  : 'border-slate-200 bg-white text-slate-500 hover:border-amber-300'
                              }`}
                            >
                              ★
                            </button>
                          );
                        })}
                      </div>
                      <textarea
                        rows={2}
                        placeholder={t('myBookingsReviewPlaceholder')}
                        value={reviewDrafts[b.id]?.comment ?? b.review_comment ?? ''}
                        onChange={(e) => setDraftField(b.id, 'comment', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                      />
                      <div className="mt-2 flex justify-end">
                        <button
                          type="button"
                          disabled={submittingReviewId === b.id}
                          onClick={() => submitReview(b)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-200 disabled:opacity-60"
                        >
                          {submittingReviewId === b.id ? t('myBookingsSaving') : b.review_rating ? t('myBookingsUpdateReview') : t('myBookingsSubmitReview')}
                        </button>
                      </div>
                    </div>
                  )}
                </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
