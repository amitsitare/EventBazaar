export default function Footer() {
  return (
    <footer className="hidden md:block bg-background-dark border-t border-white/10 text-white relative overflow-hidden">
      {/* Subtle glow layers */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-100 bg-[radial-gradient(circle_at_0%_0%,rgba(251,191,36,0.22),transparent_45%),radial-gradient(circle_at_100%_0%,rgba(255,255,255,0.08),transparent_40%)]"
      />
      <div className="max-w-7xl mx-auto px-4 pt-14 pb-10 relative">
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr,1fr,1fr] gap-12">
          {/* Brand + tagline */}
          <div className="space-y-5">
            <div className="inline-flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 border border-white/10">
              <img
                src="/logo.png"
                alt="EventBazaar logo"
                className="h-8 w-8 rounded-lg shadow-sm object-contain"
              />
              <span className="text-lg font-extrabold tracking-tight text-primary">
                EventBazaar
              </span>
            </div>
            <p className="text-sm leading-relaxed text-white/60 max-w-sm">
              Plan weddings, parties, and corporate events with trusted vendors across catering,
              decor, photography, music, venues and more.
            </p>
            <div className="flex items-center gap-3 text-xs text-white/50">
              <span className="inline-flex h-7 items-center rounded-full bg-primary/10 px-3 font-semibold text-primary">
                Made for unforgettable celebrations
              </span>
            </div>
          </div>

          {/* Customer links */}
          <div>
            <h4 className="text-sm font-semibold tracking-wide text-white/90 uppercase mb-5">
              For Customers
            </h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="group">
                <a
                  href="#"
                  className="flex items-center gap-2 text-white/60 transition-colors no-underline"
                >
                  <span className="material-symbols-outlined text-base text-primary/70 group-hover:text-primary transition-colors">
                    browse_activity
                  </span>
                  <span className="group-hover:text-primary transition-colors">
                    Browse &amp; book vendors
                  </span>
                </a>
              </li>
              <li className="group">
                <a
                  href="#"
                  className="flex items-center gap-2 text-white/60 transition-colors no-underline"
                >
                  <span className="material-symbols-outlined text-base text-primary/70 group-hover:text-primary transition-colors">
                    workspace_premium
                  </span>
                  <span className="group-hover:text-primary transition-colors">
                    Featured weddings &amp; stories
                  </span>
                </a>
              </li>
              <li className="group">
                <a
                  href="#"
                  className="flex items-center gap-2 text-white/60 transition-colors no-underline"
                >
                  <span className="material-symbols-outlined text-base text-primary/70 group-hover:text-primary transition-colors">
                    help
                  </span>
                  <span className="group-hover:text-primary transition-colors">Help center</span>
                </a>
              </li>
              <li className="group">
                <a
                  href="#"
                  className="flex items-center gap-2 text-white/60 transition-colors no-underline"
                >
                  <span className="material-symbols-outlined text-base text-primary/70 group-hover:text-primary transition-colors">
                    verified_user
                  </span>
                  <span className="group-hover:text-primary transition-colors">Safety &amp; trust</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Vendor links + socials */}
          <div>
            <h4 className="text-sm font-semibold tracking-wide text-white/90 uppercase mb-5">
              For Vendors
            </h4>
            <ul className="space-y-3 text-sm text-white/60 mb-6">
              <li className="group">
                <a
                  href="#"
                  className="flex items-center gap-2 text-white/60 transition-colors no-underline"
                >
                  <span className="material-symbols-outlined text-base text-primary/70 group-hover:text-primary transition-colors">
                    storefront
                  </span>
                  <span className="group-hover:text-primary transition-colors">Join EventBazaar</span>
                </a>
              </li>
              <li className="group">
                <a
                  href="#"
                  className="flex items-center gap-2 text-white/60 transition-colors no-underline"
                >
                  <span className="material-symbols-outlined text-base text-primary/70 group-hover:text-primary transition-colors">
                    trending_up
                  </span>
                  <span className="group-hover:text-primary transition-colors">Grow your business</span>
                </a>
              </li>
              <li className="group">
                <a
                  href="#"
                  className="flex items-center gap-2 text-white/60 transition-colors no-underline"
                >
                  <span className="material-symbols-outlined text-base text-primary/70 group-hover:text-primary transition-colors">
                    equalizer
                  </span>
                  <span className="group-hover:text-primary transition-colors">
                    Pricing &amp; plans
                  </span>
                </a>
              </li>
            </ul>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
                Connect
              </p>
              <div className="flex gap-3">
                <button className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-primary hover:bg-primary hover:text-white transition-colors">
                  <i className="fab fa-instagram text-sm" />
                </button>
                <button className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-primary hover:bg-primary hover:text-white transition-colors">
                  <i className="fab fa-facebook-f text-sm" />
                </button>
                <button className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-primary hover:bg-primary hover:text-white transition-colors">
                  <i className="fab fa-linkedin-in text-sm" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} EventBazaar. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-white/50">
            <a
              href="#"
              className="text-primary/80 hover:text-primary transition-colors no-underline"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-primary/80 hover:text-primary transition-colors no-underline"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-primary/80 hover:text-primary transition-colors no-underline"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
