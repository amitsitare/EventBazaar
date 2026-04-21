import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_BASE, authHeader } from '../auth.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function PaymentLedger() {
  const { t } = useLanguage();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);

  const loadPayments = async () => {
    setLoading(true);
    try {
      try {
        const { data } = await axios.get(`${API_BASE}/api/payments/all`, { headers: authHeader() });
        setPayments(Array.isArray(data) ? data : []);
        setIsAdminView(true);
      } catch {
        const { data } = await axios.get(`${API_BASE}/api/payments/my`, { headers: authHeader() });
        setPayments(Array.isArray(data) ? data : []);
        setIsAdminView(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const rows = useMemo(() => payments, [payments]);

  const formatDate = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatInr = (v) => `₹${Number(v || 0).toFixed(2)}`;

  return (
    <main className="bg-background-light min-h-screen py-6 md:py-10">
      <div className="max-w-6xl mx-auto px-4">
        <header className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-primary mb-1">
            {t('paymentsBadge')}
          </p>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-primary">
            {t('paymentsTitle')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isAdminView ? t('paymentsAdminSubtitle') : t('paymentsUserSubtitle')}
          </p>
        </header>

        <section className="rounded-3xl bg-white border border-slate-100 shadow-sm p-4 md:p-6">
          {loading && <p className="text-sm text-slate-500">{t('paymentsLoading')}</p>}
          {!loading && rows.length === 0 && <p className="text-sm text-slate-500">{t('paymentsEmpty')}</p>}

          {!loading && rows.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="text-left py-2 pr-3">ID</th>
                    <th className="text-left py-2 pr-3">{t('paymentsStatus')}</th>
                    <th className="text-left py-2 pr-3">{t('paymentsAmount')}</th>
                    <th className="text-left py-2 pr-3">{t('paymentsService')}</th>
                    {isAdminView && <th className="text-left py-2 pr-3">{t('paymentsCustomer')}</th>}
                    <th className="text-left py-2 pr-3">{t('paymentsBooking')}</th>
                    <th className="text-left py-2 pr-3">{t('paymentsOrderId')}</th>
                    <th className="text-left py-2 pr-3">{t('paymentsPaymentId')}</th>
                    <th className="text-left py-2 pr-3">{t('paymentsCreated')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100 text-slate-700">
                      <td className="py-2 pr-3">#{p.id}</td>
                      <td className="py-2 pr-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${p.signature_status === 'verified' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          {p.signature_status}
                        </span>
                      </td>
                      <td className="py-2 pr-3">{formatInr(p.amount)}</td>
                      <td className="py-2 pr-3">{p.service_name || `${t('paymentsServiceLabel')} #${p.service_id}`}</td>
                      {isAdminView && (
                        <td className="py-2 pr-3">
                          <div>{p.customer_name || '-'}</div>
                          <div className="text-xs text-slate-500">{p.customer_email || '-'}</div>
                        </td>
                      )}
                      <td className="py-2 pr-3">{p.booking_id ? `#${p.booking_id}` : '-'}</td>
                      <td className="py-2 pr-3">{p.order_id}</td>
                      <td className="py-2 pr-3">{p.payment_id}</td>
                      <td className="py-2 pr-3">{formatDate(p.created_at)}</td>
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
