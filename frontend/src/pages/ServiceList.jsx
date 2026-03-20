import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_BASE } from '../auth.js';

export default function ServiceList() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [category, setCategory] = useState('all');

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
              Browse vendors
            </p>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
              Find Services for Your Event
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Filter by category, location and budget to discover the right match.
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-100/70 px-3 py-1.5 text-xs font-medium text-amber-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
            Updated marketplace view
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
                Search
              </label>
              <input
                type="text"
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                placeholder="Catering, decor, photography..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Category
              </label>
              <select
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="all">All categories</option>
                <option value="cater">Catering</option>
                <option value="photo">Photography</option>
                <option value="decor">Decor</option>
                <option value="music">Music & DJs</option>
                <option value="venue">Venues</option>
                <option value="cake">Bakery</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Budget (₹)
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
              Showing <strong className="text-slate-700">{filteredServices.length}</strong> of{' '}
              {services.length} results
            </span>
            <div className="flex w-full gap-2 sm:w-auto">
              <button
                type="button"
                className="h-10 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                onClick={resetFilters}
                disabled={loading}
              >
                Clear filters
              </button>
              <button
                type="button"
                className="h-10 flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-4 text-sm font-semibold text-white shadow-md shadow-amber-200 transition hover:-translate-y-0.5 hover:from-amber-600 hover:to-amber-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                onClick={load}
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Apply filters'}
              </button>
            </div>
          </div>
        </motion.section>

        {/* Results grid */}
        <section className="pb-6">
          {loading && services.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              Loading services...
            </div>
          )}

          {!loading && filteredServices.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              No services found. Try adjusting your filters.
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
                      <p className="text-sm font-semibold text-white">{s.location || 'Location not specified'}</p>
                    </div>
                  </div>

                  <div className="flex min-h-[190px] flex-col p-4">
                    <h3 className="mb-1 line-clamp-1 text-lg font-bold text-slate-900">{s.name}</h3>
                    <p className="mb-3 line-clamp-2 text-sm text-slate-500">
                      {s.description || 'No description provided.'}
                    </p>
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-base font-bold text-amber-600">
                        {s.price != null ? `₹${s.price}` : 'From items'}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                          ★ {Number(s.avg_rating || 0).toFixed(1)}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                          {Number(s.review_count || 0)} review{Number(s.review_count || 0) === 1 ? '' : 's'}
                        </span>
                      </div>
                    </div>
                    <Link
                      className="mt-auto inline-flex h-10 items-center justify-center rounded-xl border border-amber-300 bg-amber-50 px-4 text-sm font-semibold text-amber-700 transition hover:-translate-y-0.5 hover:border-amber-400 hover:bg-amber-100"
                      to={`/services/${s.id}`}
                    >
                      View details
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

