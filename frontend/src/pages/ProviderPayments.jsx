import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_BASE, authHeader } from '../auth.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';

const formatDateTime = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const currency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n || 0));

export default function ProviderPayments() {
  const { t } = useLanguage();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/api/payments/provider`, { headers: authHeader() });
      setRows(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (statusFilter !== 'all' && r.signature_status !== statusFilter) return false;
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return `${r.service_name || ''} ${r.customer_name || ''} ${r.customer_email || ''} ${r.payment_id || ''}`.toLowerCase().includes(q);
      }),
    [rows, statusFilter, query]
  );

  const verifiedTotal = useMemo(
    () => filtered.filter((r) => r.signature_status === 'verified').reduce((sum, r) => sum + Number(r.amount || 0), 0),
    [filtered]
  );

  return (
    <main className="min-h-screen bg-background-light py-6 px-3 md:px-4 text-slate-900">
      <div className="max-w-7xl mx-auto space-y-4">
        <header>
          <p className="text-xs uppercase tracking-widest text-slate-500">{t('providerPaymentsBadge')}</p>
          <h1 className="text-2xl md:text-3xl font-black">{t('providerPaymentsTitle')}</h1>
          <p className="text-sm text-slate-500">{t('providerPaymentsSubtitle')}</p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('paymentsStatus')}</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="all">{t('providerPaymentsAllStatuses')}</option>
                <option value="verified">verified</option>
                <option value="failed">failed</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('providerPaymentsSearch')}</label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder={t('providerPaymentsSearchPlaceholder')}
              />
            </div>
            <div className="text-sm font-semibold text-slate-700">{t('providerPaymentsVerifiedTotal')}: {currency(verifiedTotal)}</div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          {loading ? (
            <div className="p-6 text-sm text-slate-500">{t('paymentsLoading')}</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">{t('paymentsEmpty')}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2">{t('paymentsCreated')}</th>
                    <th className="px-3 py-2">{t('paymentsService')}</th>
                    <th className="px-3 py-2">{t('paymentsCustomer')}</th>
                    <th className="px-3 py-2 text-right">{t('paymentsAmount')}</th>
                    <th className="px-3 py-2">{t('paymentsStatus')}</th>
                    <th className="px-3 py-2">{t('paymentsBooking')}</th>
                    <th className="px-3 py-2">{t('paymentsPaymentId')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={row.id} className="border-t border-slate-100">
                      <td className="px-3 py-2">{formatDateTime(row.created_at)}</td>
                      <td className="px-3 py-2 font-semibold">{row.service_name || '-'}</td>
                      <td className="px-3 py-2">
                        <div>{row.customer_name || '-'}</div>
                        <div className="text-xs text-slate-500">{row.customer_email || ''}</div>
                      </td>
                      <td className="px-3 py-2 text-right font-bold">{currency(row.amount)}</td>
                      <td className="px-3 py-2">{row.signature_status || '-'}</td>
                      <td className="px-3 py-2">{row.booking_id != null ? `#${row.booking_id}` : '-'}</td>
                      <td className="px-3 py-2 font-mono text-xs">{row.payment_id || '-'}</td>
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
