import { NavLink, useNavigate } from 'react-router-dom';
import { clearAuth, getAuth } from '../auth.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function Navbar() {
  const auth = getAuth();
  const navigate = useNavigate();
  const { locale, setLocale, t } = useLanguage();

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  const linkBase =
    'text-sm font-semibold text-slate-600 hover:text-primary transition-colors flex items-center gap-1 no-underline px-3 py-2 rounded-full';

  const navLinkClass = ({ isActive }) =>
    `${linkBase} ${isActive ? 'bg-primary/10 text-primary shadow-sm' : ''}`;

  const langPill =
    'px-2.5 py-1.5 rounded-full transition-colors min-w-[2.5rem] text-center';
  const langActive = 'bg-white text-primary shadow-sm';
  const langIdle = 'text-slate-500 hover:text-slate-700';

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
        {/* Brand */}
        <NavLink
          to="/"
          className="flex items-center gap-3 rounded-2xl bg-primary/5 px-3 py-1.5 hover:bg-primary/10 transition-colors no-underline shrink-0"
        >
          <img
            src="/logo.png"
            alt="EventBazaar logo"
            className="h-7 w-7 rounded-lg shadow-sm object-contain"
          />
          <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-slate-700">
            EventBazaar
          </h1>
        </NavLink>

        {/* Center nav links */}
        <nav className="hidden md:flex items-center gap-2 rounded-full bg-white/60 px-2 py-1 shadow-sm">
          <NavLink to="/" className={navLinkClass}>
            {t('navHome')}
          </NavLink>
          <NavLink to="/services" end className={navLinkClass}>
            {t('navFindVendors')}
          </NavLink>
          <NavLink to="/event-services" className={navLinkClass}>
            {t('navServices')}
          </NavLink>
          <NavLink to="/contact-us" className={navLinkClass}>
            {t('navContactUs')}
          </NavLink>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="flex items-center rounded-full border border-slate-200/90 bg-slate-50/90 p-0.5 shadow-sm"
            role="group"
            aria-label="Language"
          >
            <button
              type="button"
              onClick={() => setLocale('en')}
              className={`${langPill} ${locale === 'en' ? langActive : langIdle}`}
              aria-pressed={locale === 'en'}
            >
              {t('langEnglish')}
            </button>
            <button
              type="button"
              onClick={() => setLocale('hi')}
              className={`${langPill} ${locale === 'hi' ? langActive : langIdle}`}
              aria-pressed={locale === 'hi'}
            >
              {t('langHindi')}
            </button>
          </div>
          {!auth.token ? (
            <>
              <NavLink
                to="/login"
                className="hidden sm:inline-flex items-center justify-center text-sm font-semibold text-primary px-4 py-2 rounded-full border border-primary/20 hover:bg-primary/5 transition-colors no-underline"
              >
                {t('navLogin')}
              </NavLink>
              <NavLink
                to="/register"
                className="inline-flex items-center justify-center bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-md shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all no-underline"
              >
                {t('navGetStarted')}
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to={auth.role === 'customer' ? '/my-bookings' : '/dashboard'}
                className="hidden sm:inline-flex items-center justify-center text-sm font-semibold text-primary px-4 py-2 rounded-full border border-primary/20 hover:bg-primary/5 transition-colors no-underline"
              >
                {auth.role === 'customer' ? t('navMyBookings') : t('navDashboard')}
              </NavLink>
              {auth.role === 'customer' && (
                <NavLink
                  to="/payments"
                  className="hidden sm:inline-flex items-center justify-center text-sm font-semibold text-primary px-4 py-2 rounded-full border border-primary/20 hover:bg-primary/5 transition-colors no-underline"
                >
                  {t('navPayments')}
                </NavLink>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-md shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all"
              >
                {t('navLogout')}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
