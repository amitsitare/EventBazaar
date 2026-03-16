import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
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

  return (
    <main className="bg-background-light min-h-screen py-0 md:py-3">
      <div className="max-w-6xl mx-auto px-3 md:px-4">
        <header className="mb-4 md:mb-5 flex flex-col md:flex-row md:items-end md:justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-primary mb-1">
              Browse vendors
            </p>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
              Find Services for Your Event
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Filter by category, location and budget to discover the right match.
            </p>
          </div>
        </header>

        {/* Filters */}
        <section className="mb-4 md:mb-5 rounded-2xl bg-white border border-slate-100 shadow-sm p-3 md:p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-3">
            <div className="flex flex-col gap-0.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Search
              </label>
              <input
                type="text"
                className="form-control form-control-sm rounded-2xl border border-slate-200"
                placeholder="Catering, decor, photography..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Category
              </label>
              <select
                className="form-select form-select-sm rounded-2xl border border-slate-200"
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

            <div className="flex flex-col gap-0.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Budget (₹)
              </label>
              <div className="d-flex gap-2">
                <input
                  type="number"
                  min="0"
                  className="form-control form-control-sm rounded-2xl border border-slate-200"
                  placeholder="Min"
                  value={minPrice}
                  onChange={handlePriceChange(setMinPrice)}
                />
                <input
                  type="number"
                  min="0"
                  className="form-control form-control-sm rounded-2xl border border-slate-200"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={handlePriceChange(setMaxPrice)}
                />
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 text-[11px] md:text-xs text-slate-500">
            <span>
              Showing <strong>{filteredServices.length}</strong> of {services.length} results
            </span>
            <div className="d-flex gap-1">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                onClick={() => {
                  setQuery('');
                  setMinPrice('');
                  setMaxPrice('');
                  setCategory('all');
                }}
                disabled={loading}
              >
                Clear filters
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm rounded-pill px-3"
                onClick={load}
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Apply filters'}
              </button>
            </div>
          </div>
        </section>

        {/* Results grid */}
        <section className="pb-4 md:pb-6">
          {loading && services.length === 0 && (
            <div className="py-6 text-center text-sm text-slate-500">
              Loading services...
            </div>
          )}

          {!loading && filteredServices.length === 0 && (
            <div className="py-6 text-center text-sm text-slate-500">
              No services found. Try adjusting your filters.
            </div>
          )}

          {!loading && filteredServices.length > 0 && (
            <div className="row g-3 g-md-4">
              {filteredServices.map((s) => (
                <div key={s.id} className="col-12 col-sm-6 col-lg-4">
                  <article className="card h-100 border-0 shadow-sm rounded-3 overflow-hidden">
                    {s.photo_url ? (
                      <img
                        src={s.photo_url}
                        className="card-img-top"
                        alt={s.name}
                        style={{
                          height: '200px',
                          objectFit: 'cover',
                          objectPosition: 'center',
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div
                        className="card-img-top d-flex align-items-center justify-content-center bg-light"
                        style={{
                          height: '200px',
                        }}
                      >
                        <i className="fas fa-image text-muted" style={{ fontSize: '2rem' }}></i>
                      </div>
                    )}
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title mb-1 text-truncate">{s.name}</h5>
                      <p className="card-text text-muted small mb-2" style={{ minHeight: '2.5em' }}>
                        {s.description || 'No description provided.'}
                      </p>
                      <p className="card-text mb-3">
                        <strong>{s.price != null ? `₹${s.price}` : 'From items'}</strong>
                        <span className="text-muted small"> · {s.location}</span>
                      </p>
                      <div className="mt-auto">
                        <Link className="btn btn-outline-primary w-100" to={`/services/${s.id}`}>
                          View details
                        </Link>
                      </div>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

