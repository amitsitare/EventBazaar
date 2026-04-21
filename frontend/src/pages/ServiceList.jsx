import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_BASE } from '../auth.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { getWishlist, toggleWishlistItem } from '../wishlist.js';

export default function ServiceList() {
  const { t } = useLanguage();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [category, setCategory] = useState('all');
  const [wishlist, setWishlist] = useState(getWishlist());
  const [compareOpen, setCompareOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (query) params.query = query;
      const { data } = await axios.get(`${API_BASE}/api/services/`, { params });
      setServices(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const price = Number(s.price ?? 0);
      if (minPrice && price < Number(minPrice)) return false;
      if (maxPrice && price > Number(maxPrice)) return false;

      if (category !== 'all') {
        const name = (s.name || '').toLowerCase();
        const desc = (s.description || '').toLowerCase();
        const loc = (s.location || '').toLowerCase();
        const catVal = category.toLowerCase();
        const text = `${name} ${desc} ${loc}`;
        if (!text.includes(catVal)) return false;
      }
      return true;
    });
  }, [services, minPrice, maxPrice, category]);

  const handlePriceChange = (setter) => (e) => {
    const value = e.target.value;
    if (value === '') {
      setter('');
      return;
    }
    const num = Number(value);
    if (Number.isNaN(num) || num < 0) return;
    setter(value);
  };

  const resetFilters = () => {
    setQuery('');
    setMinPrice('');
    setMaxPrice('');
    setCategory('all');
  };

  const toggleWishlist = (service) => {
    const next = toggleWishlistItem(service);
    setWishlist(next);
  };

  const wishIds = new Set(wishlist.map((w) => Number(w.id)));
  const compareItems = wishlist.slice(0, 4);

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50/30 via-white to-slate-50 py-6 md:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-6 flex flex-col gap-2 md:mb-8 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-600">
              {t('serviceListBadge')}
            </p>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
              {t('serviceListTitle')}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {t('serviceListSubtitle')}
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-100/70 px-3 py-1.5 text-xs font-medium text-amber-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
            {t('serviceListUpdated')}
          </div>
        </motion.header>

        {/* Filters */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="mb-6 rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur md:mb-8 md:p-5"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {t('serviceListSearch')}
              </label>
              <input
                type="text"
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                placeholder={t('serviceListSearchPlaceholder')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {t('serviceListCategory')}
              </label>
              <select
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="all">{t('serviceListAllCategories')}</option>
                <option value="cater">{t('serviceListCatering')}</option>
                <option value="photo">{t('serviceListPhotography')}</option>
                <option value="decor">{t('serviceListDecor')}</option>
                <option value="music">{t('serviceListMusic')}</option>
                <option value="venue">{t('serviceListVenues')}</option>
                <option value="cake">{t('serviceListBakery')}</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {t('serviceListBudget')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="0"
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder="Min"
                  value={minPrice}
                  onChange={handlePriceChange(setMinPrice)}
                />
                <input
                  type="number"
                  min="0"
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={handlePriceChange(setMaxPrice)}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-start justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500 sm:flex-row sm:items-center">
            <span>
              {t('serviceListShowing', { shown: filteredServices.length, total: services.length })}
            </span>
            <div className="flex w-full gap-2 sm:w-auto">
              <button
                type="button"
                className="h-10 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                onClick={resetFilters}
                disabled={loading}
              >
                {t('serviceListClear')}
              </button>
              <button
                type="button"
                className="h-10 flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-4 text-sm font-semibold text-white shadow-md shadow-amber-200 transition hover:-translate-y-0.5 hover:from-amber-600 hover:to-amber-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                onClick={load}
                disabled={loading}
              >
                {loading ? t('serviceListUpdating') : t('serviceListApply')}
              </button>
            </div>
          </div>
        </motion.section>

        {/* Results grid */}
        <section className="pb-6">
          {loading && services.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              {t('serviceListLoading')}
            </div>
          )}

          {!loading && filteredServices.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              {t('serviceListNoResults')}
            </div>
          )}

          {!loading && filteredServices.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((s, index) => (
                <motion.article
                  key={s.id}
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
                  whileHover={{ y: -6 }}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-xl hover:shadow-slate-200/80"
                >
                  <div className="relative h-52 overflow-hidden bg-slate-100">
                    {s.photo_url ? (
                      <img
                        src={s.photo_url}
                        alt={s.name}
                        className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">
                        <i className="fas fa-image text-3xl"></i>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent p-3">
                      <p className="text-sm font-semibold text-white">{s.location || t('serviceListLocationMissing')}</p>
                    </div>
                  </div>

                  <div className="flex min-h-[190px] flex-col p-4">
                    <h3 className="mb-1 line-clamp-1 text-lg font-bold text-slate-900">{s.name}</h3>
                    <p className="mb-3 line-clamp-2 text-sm text-slate-500">
                      {s.description || t('serviceListNoDescription')}
                    </p>
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-base font-bold text-amber-600">
                        {s.price != null ? `₹${s.price}` : t('serviceListFromItems')}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                          ★ {Number(s.avg_rating || 0).toFixed(1)}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                          {t('serviceListReviews', { count: Number(s.review_count || 0) })}
                        </span>
                      </div>
                    </div>
                    <Link
                      className="mt-auto inline-flex h-10 items-center justify-center rounded-xl border border-amber-300 bg-amber-50 px-4 text-sm font-semibold text-amber-700 transition hover:-translate-y-0.5 hover:border-amber-400 hover:bg-amber-100"
                      to={`/services/${s.id}`}
                    >
                      {t('serviceListViewDetails')}
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleWishlist(s)}
                      className="mt-2 inline-flex h-10 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      {wishIds.has(Number(s.id)) ? t('wishlistRemove') : t('wishlistSave')}
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-black text-slate-900">{t('wishlistCompareTitle')}</h2>
            <button
              type="button"
              className="text-xs font-semibold text-primary"
              onClick={() => setCompareOpen((v) => !v)}
            >
              {compareOpen ? t('wishlistHideCompare') : t('wishlistShowCompare')}
            </button>
          </div>
          {compareOpen && (
            compareItems.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">{t('wishlistCompareEmpty')}</p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-wide text-slate-500">
                      <th className="py-2 pr-3">{t('wishlistCompareService')}</th>
                      <th className="py-2 pr-3">{t('wishlistComparePrice')}</th>
                      <th className="py-2 pr-3">{t('wishlistCompareLocation')}</th>
                      <th className="py-2 pr-3">{t('wishlistCompareRating')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compareItems.map((item) => (
                      <tr key={`compare-${item.id}`} className="border-t border-slate-100">
                        <td className="py-2 pr-3 font-semibold">{item.name}</td>
                        <td className="py-2 pr-3">{item.price != null ? `₹${item.price}` : t('serviceListFromItems')}</td>
                        <td className="py-2 pr-3">{item.location || '-'}</td>
                        <td className="py-2 pr-3">★ {Number(item.avg_rating || 0).toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </section>
      </div>
    </main>
  );
}

