import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { clearWishlist, getWishlist, removeWishlistItem } from '../wishlist.js';

export default function Wishlist() {
  const { t } = useLanguage();
  const [items, setItems] = useState(getWishlist());

  const stats = useMemo(() => {
    const avg = items.length
      ? items.reduce((sum, item) => sum + Number(item.avg_rating || 0), 0) / items.length
      : 0;
    return { count: items.length, avgRating: avg };
  }, [items]);

  const onRemove = (id) => setItems(removeWishlistItem(id));
  const onClear = () => {
    clearWishlist();
    setItems([]);
  };

  return (
    <main className="min-h-screen bg-background-light py-6 px-3 md:px-4 text-slate-900">
      <div className="max-w-7xl mx-auto space-y-4">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500">{t('wishlistBadge')}</p>
            <h1 className="text-2xl md:text-3xl font-black">{t('wishlistTitle')}</h1>
            <p className="text-sm text-slate-500">{t('wishlistSubtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              {t('wishlistStats', { count: stats.count, avg: stats.avgRating.toFixed(1) })}
            </span>
            <button
              type="button"
              onClick={onClear}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold"
              disabled={!items.length}
            >
              {t('wishlistClear')}
            </button>
          </div>
        </header>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
            {t('wishlistEmpty')}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((item) => (
                <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="h-40 rounded-xl overflow-hidden bg-slate-100">
                    {item.photo_url ? (
                      <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <h2 className="mt-3 text-lg font-black">{item.name}</h2>
                  <p className="text-xs text-slate-500">{item.location || t('serviceListLocationMissing')}</p>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="font-bold text-primary">
                      {item.price != null ? `₹${item.price}` : t('serviceListFromItems')}
                    </span>
                    <span className="text-slate-600">★ {Number(item.avg_rating || 0).toFixed(1)}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Link
                      to={`/services/${item.id}`}
                      className="flex-1 rounded-lg bg-primary px-3 py-2 text-center text-sm font-bold text-black no-underline"
                    >
                      {t('wishlistBookNow')}
                    </Link>
                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      className="rounded-lg border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-700"
                    >
                      {t('wishlistRemove')}
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 overflow-x-auto">
              <h3 className="text-sm font-black mb-2">{t('wishlistCompareTitle')}</h3>
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="py-2 pr-3">{t('wishlistCompareService')}</th>
                    <th className="py-2 pr-3">{t('wishlistComparePrice')}</th>
                    <th className="py-2 pr-3">{t('wishlistCompareLocation')}</th>
                    <th className="py-2 pr-3">{t('wishlistCompareRating')}</th>
                    <th className="py-2 pr-3">{t('wishlistCompareReviews')}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={`cmp-${item.id}`} className="border-t border-slate-100">
                      <td className="py-2 pr-3 font-semibold">{item.name}</td>
                      <td className="py-2 pr-3">{item.price != null ? `₹${item.price}` : t('serviceListFromItems')}</td>
                      <td className="py-2 pr-3">{item.location || '-'}</td>
                      <td className="py-2 pr-3">★ {Number(item.avg_rating || 0).toFixed(1)}</td>
                      <td className="py-2 pr-3">{Number(item.review_count || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
