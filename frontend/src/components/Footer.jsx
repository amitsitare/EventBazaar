export default function Footer() {
  return (
    <footer className="hidden md:block border-t border-primary/10 bg-white">
      <div className="max-w-7xl mx-auto px-4 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr,1fr,1fr] gap-12">
          {/* Brand + tagline */}
          <div className="space-y-5">
            <div className="inline-flex items-center gap-3 rounded-2xl bg-primary/5 px-4 py-3">
              <img
                src="/logo.png"
                alt="EventBazaar logo"
                className="h-8 w-8 rounded-lg shadow-sm object-contain"
              />
              <span className="text-lg font-extrabold tracking-tight text-primary">
                EventBazaar
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-500 max-w-sm">
              Plan weddings, parties, and corporate events with trusted vendors across catering,
              decor, photography, music, venues and more.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="inline-flex h-7 items-center rounded-full bg-primary/5 px-3 font-semibold text-primary">
                Made for unforgettable celebrations
              </span>
            </div>
          </div>

          {/* Customer links */}
          <div>
            <h4 className="text-sm font-semibold tracking-wide text-slate-900 uppercase mb-5">
              For Customers
            </h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li className="group">
                <a
                  href="#"
                  className="flex items-center gap-2 text-slate-500 transition-colors no-underline"
                >
                  <span className="material-symbols-outlined text-base text-primary/60 group-hover:text-primary">
                    browse_activity
                  </span>
                  <span className="group-hover:text-primary">Browse &amp; book vendors</span>
                </a>
              </li>
              <li className="group">
                <a
                  href="#"
                  className="flex items-center gap-2 text-slate-500 transition-colors no-underline"
                >
                  <span className="material-symbols-outlined text-base text-primary/60 group-hover:text-primary">
                    workspace_premium
                  </span>
                  <span className="group-hover:text-primary">Featured weddings &amp; stories</span>
                </a>
              </li>
              <li className="group">
                <a
                  href="#"
                  className="flex items-center gap-2 text-slate-500 transition-colors no-underline"
                >
                  <span className="material-symbols-outlined text-base text-primary/60 group-hover:text-primary">
                    help
                  </span>
                  <span className="group-hover:text-primary">Help center</span>
                </a>
              </li>
              <li className="group">
                <a
                  href="#"
                  className="flex items-center gap-2 text-slate-500 transition-colors no-underline"
                >
                  <span className="material-symbols-outlined text-base text-primary/60 group-hover:text-primary">
                    verified_user
                  </span>
                  <span className="group-hover:text-primary">Safety &amp; trust</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Vendor links + socials */}
          <div>
            <h4 className="text-sm font-semibold tracking-wide text-slate-900 uppercase mb-5">
              For Vendors
            </h4>
            <ul className="space-y-3 text-sm text-slate-500 mb-6">
              <li className="group">
                <a
                  href="#"
                  className="flex items-center gap-2 text-slate-500 transition-colors no-underline"
                >
                  <span className="material-symbols-outlined text-base text-primary/60 group-hover:text-primary">
                    storefront
                  </span>
                  <span className="group-hover:text-primary">Join EventBazaar</span>
                </a>
              </li>
              <li className="group">
                <a
                  href="#"
                  className="flex items-center gap-2 text-slate-500 transition-colors no-underline"
                >
                  <span className="material-symbols-outlined text-base text-primary/60 group-hover:text-primary">
                    trending_up
                  </span>
                  <span className="group-hover:text-primary">Grow your business</span>
                </a>
              </li>
              <li className="group">
                <a
                  href="#"
                  className="flex items-center gap-2 text-slate-500 transition-colors no-underline"
                >
                  <span className="material-symbols-outlined text-base text-primary/60 group-hover:text-primary">
                    equalizer
                  </span>
                  <span className="group-hover:text-primary">Pricing &amp; plans</span>
                </a>
              </li>
            </ul>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Connect
              </p>
              <div className="flex gap-3">
                <button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 text-primary hover:bg-primary hover:text-white transition-colors">
                  <i className="fab fa-instagram text-sm" />
                </button>
                <button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 text-primary hover:bg-primary hover:text-white transition-colors">
                  <i className="fab fa-facebook-f text-sm" />
                </button>
                <button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 text-primary hover:bg-primary hover:text-white transition-colors">
                  <i className="fab fa-linkedin-in text-sm" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-slate-100 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} EventBazaar. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                <a href="#" className="hover:text-primary transition-colors no-underline">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary transition-colors no-underline">
              Terms of Service
            </a>
            <a href="#" className="hover:text-primary transition-colors no-underline">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
