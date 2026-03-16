import { NavLink, useNavigate } from 'react-router-dom';
import { clearAuth, getAuth } from '../auth.js';

export default function Navbar() {
  const auth = getAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  const linkBase =
    'text-sm font-semibold text-slate-600 hover:text-primary transition-colors flex items-center gap-1 no-underline px-3 py-2 rounded-full';

  const navLinkClass = ({ isActive }) =>
    `${linkBase} ${isActive ? 'bg-primary/10 text-primary shadow-sm' : ''}`;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-primary/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <NavLink
          to="/"
          className="flex items-center gap-3 rounded-2xl bg-primary/5 px-3 py-1.5 hover:bg-primary/10 transition-colors"
        >
          <img
            src="/logo.png"
            alt="EventBazaar logo"
            className="h-7 w-7 rounded-lg shadow-sm object-contain"
          />
          <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-primary">
            EventBazaar
          </h1>
        </NavLink>

        {/* Center nav links */}
        <nav className="hidden md:flex items-center gap-2 rounded-full bg-white/60 px-2 py-1 shadow-sm">
          <NavLink to="/services" className={navLinkClass}>
            Find Vendors
          </NavLink>
          <a href="#" className={linkBase}>
            Inspiration
          </a>
          <a href="#" className={linkBase}>
            Pricing
          </a>
          <a href="#" className={linkBase}>
            Track
          </a>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {!auth.token ? (
            <>
              <NavLink
                to="/login"
                className="hidden sm:inline-flex items-center justify-center text-sm font-semibold text-primary px-4 py-2 rounded-full border border-primary/20 hover:bg-primary/5 transition-colors no-underline"
              >
                Log In
              </NavLink>
              <NavLink
                to="/register"
                className="inline-flex items-center justify-center bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-md shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all no-underline"
              >
                Get Started
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to={auth.role === 'customer' ? '/my-bookings' : '/dashboard'}
                className="hidden sm:inline-flex items-center justify-center text-sm font-semibold text-primary px-4 py-2 rounded-full border border-primary/20 hover:bg-primary/5 transition-colors no-underline"
              >
                {auth.role === 'customer' ? 'My Bookings' : 'Dashboard'}
              </NavLink>
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-md shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}



