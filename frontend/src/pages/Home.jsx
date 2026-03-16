import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

function ScrollReveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // initial hidden state
    node.style.opacity = '0';
    node.style.transform = 'translateY(24px)';

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && node) {
          node.style.transition = 'opacity 600ms ease-out, transform 600ms ease-out';
          node.style.transitionDelay = `${delay}ms`;
          node.style.opacity = '1';
          node.style.transform = 'translateY(0)';
          observer.unobserve(node);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <main className="bg-background-light">
        {/* Hero */}
        <section className="relative px-4 @container">
          <div className="max-w-7xl mx-auto">
            <div className="relative overflow-hidden rounded-[2.5rem] min-h-screen bg-background-dark">
              {/* Background media + gradient */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    'linear-gradient(120deg, rgba(9,9,11,0.85), rgba(24,24,27,0.75), rgba(132,11,218,0.55)), url("https://lh3.googleusercontent.com/aida-public/AB6AXuBjQlnhRh-iH1Zkbm6qW7XPtPoAEouPBNp-2gVBtA4asxJpvWxXTeFAwpqfbpCO_q2ASyU8obZ6jVwHGvNXPetaII50f2lo8QZKAC76b8SVQB66QFaBtwUR4NtLJDjeLMXg7OQKvFzrmFMtYd0jmfpUsw3jmXrFD3zbUAKF_I1PXMPfPyAj31s08KfdqlXfjI2zC_-ee03UzNDQSTfATK04bVL_030JLDVXH5IPoO9RKXVn4ePTB4rGmyc5ZExFc1ZIcuh9PGoTTks")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              {/* Noise / texture */}
              <div className="absolute inset-0 opacity-30 mix-blend-soft-light bg-[radial-gradient(circle_at_0_0,rgba(248,250,252,0.4),transparent_55%),radial-gradient(circle_at_100%_0,rgba(244,114,182,0.35),transparent_55%),radial-gradient(circle_at_100%_100%,rgba(129,140,248,0.3),transparent_55%)]" />

              <div className="relative z-10 h-full flex flex-col md:flex-row items-center md:items-stretch px-6 sm:px-10 lg:px-14 py-10 lg:py-14 gap-10 lg:gap-16">
                {/* Copy side */}
                <ScrollReveal className="flex-1 flex flex-col justify-center gap-8 text-center md:text-left" delay={80}>
                  <div className="inline-flex items-center justify-center md:justify-start gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Smart way to plan your event
                  </div>

                  <div className="space-y-4">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
                      Plan Your
                      <span className="block text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-purple-300 to-sky-200">
                        Perfect Celebration
                      </span>
                    </h1>
                    <p className="text-base sm:text-lg lg:text-xl font-medium text-white/85 max-w-xl mx-auto md:mx-0">
                      Discover and book verified caterers, decor artists, photographers, DJs and more
                      in just a few clicks.
                    </p>
                  </div>

                  {/* Primary actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
                    <Link
                      to="/services"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-primary px-7 py-3.5 text-sm sm:text-base font-extrabold shadow-xl shadow-primary/40 hover:shadow-primary/60 hover:translate-y-[-1px] transition-all"
                    >
                      <span>Start Planning</span>
                      <span className="material-symbols-outlined text-base sm:text-lg">arrow_forward</span>
                    </Link>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/5 px-6 py-3 text-sm sm:text-base font-semibold text-white hover:bg-white/10 transition-colors"
                    >
                      <span className="material-symbols-outlined text-base sm:text-lg">play_circle</span>
                      See how it works
                    </button>
                  </div>

                  {/* Stats row */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-white/80 text-sm sm:text-xs lg:text-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        <span className="size-7 rounded-full border border-background-dark bg-fuchsia-300/90" />
                        <span className="size-7 rounded-full border border-background-dark bg-sky-300/90" />
                        <span className="size-7 rounded-full border border-background-dark bg-amber-300/90" />
                      </div>
                      <div className="leading-tight text-left">
                        <div className="font-semibold">10k+ happy hosts</div>
                        <div className="text-[11px] sm:text-xs text-white/70">
                          real reviews, curated vendors
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-white/10 via-white/30 to-transparent sm:block hidden" />
                    <div className="flex gap-6 sm:gap-8">
                      <div>
                        <div className="text-lg lg:text-xl font-extrabold text-white">4.9</div>
                        <div className="text-[11px] sm:text-xs text-white/70">Average rating</div>
                      </div>
                      <div>
                        <div className="text-lg lg:text-xl font-extrabold text-white">3k+</div>
                        <div className="text-[11px] sm:text-xs text-white/70">Verified vendors</div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>

                {/* Search / card side */}
                <ScrollReveal className="flex-1 max-w-xl w-full mx-auto" delay={180}>
                  <div className="bg-white/10 backdrop-blur-2xl rounded-[1.75rem] border border-white/20 shadow-[0_32px_80px_rgba(15,23,42,0.65)] p-4 sm:p-5 lg:p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70 mb-4 sm:mb-5">
                      Search vendors
                    </p>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-semibold tracking-wide text-white/70">
                          Service type
                        </label>
                        <div className="flex items-center gap-3 rounded-xl bg-white text-slate-900 px-4 py-3 shadow-lg">
                          <span className="material-symbols-outlined text-primary/70">search</span>
                          <input
                            type="text"
                            placeholder="Catering, decor, photography..."
                            className="w-full border-none focus:ring-0 focus:outline-none text-sm placeholder:text-slate-400 bg-transparent"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-semibold tracking-wide text-white/70">
                          City or area
                        </label>
                        <div className="flex items-center gap-3 rounded-xl bg-white text-slate-900 px-4 py-3 shadow-lg">
                          <span className="material-symbols-outlined text-primary/70">location_on</span>
                          <input
                            type="text"
                            placeholder="e.g. Mumbai, Andheri West"
                            className="w-full border-none focus:ring-0 focus:outline-none text-sm placeholder:text-slate-400 bg-transparent"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] font-semibold tracking-wide text-white/70">
                            Event date
                          </label>
                          <div className="flex items-center gap-3 rounded-xl bg-white text-slate-900 px-4 py-3 shadow-lg">
                            <span className="material-symbols-outlined text-primary/70">calendar_month</span>
                            <input
                              type="text"
                              placeholder="DD/MM/YYYY"
                              className="w-full border-none focus:ring-0 focus:outline-none text-sm placeholder:text-slate-400 bg-transparent"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] font-semibold tracking-wide text-white/70">
                            Guests
                          </label>
                          <div className="flex items-center gap-3 rounded-xl bg-white text-slate-900 px-4 py-3 shadow-lg">
                            <span className="material-symbols-outlined text-primary/70">groups</span>
                            <input
                              type="text"
                              placeholder="Approx. count"
                              className="w-full border-none focus:ring-0 focus:outline-none text-sm placeholder:text-slate-400 bg-transparent"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row gap-3 sm:items-center">
                        <Link
                          to="/services"
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary text-white px-6 py-3 text-sm font-bold shadow-lg shadow-primary/40 hover:shadow-primary/60 hover:translate-y-[-1px] transition-all"
                        >
                          <span>Search vendors</span>
                          <span className="material-symbols-outlined text-base">arrow_forward</span>
                        </Link>
                        <p className="text-[11px] sm:text-[10px] text-white/60 text-center sm:text-left">
                          No charges to browse. Pay vendors directly after you book.
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        {/* Browse by Category */}
        <ScrollReveal className="max-w-7xl mx-auto px-4 py-14" delay={60}>
          <div className="flex items-end justify-between gap-4 mb-8">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-primary">
                <span className="size-1.5 rounded-full bg-primary" />
                Browse by category
              </span>
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
                Find the right vendor in seconds.
              </h3>
              <p className="text-sm md:text-base text-slate-600 max-w-xl">
                Quickly explore popular event services—from catering and decor to venues and music.
              </p>
            </div>
            <Link
              to="/services"
              className="hidden sm:inline-flex items-center gap-2 rounded-full border border-primary/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary hover:bg-primary/5 transition-colors"
            >
              <span>View all</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: 'restaurant', label: 'Catering' },
              { icon: 'camera_enhance', label: 'Photography' },
              { icon: 'park', label: 'Decor' },
              { icon: 'music_note', label: 'Music & DJs' },
              { icon: 'apartment', label: 'Venues' },
              { icon: 'cake', label: 'Bakery' },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                className="group cursor-pointer flex flex-col items-center gap-3 p-5 rounded-2xl bg-white border border-slate-100 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="size-16 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-3xl group-hover:text-white transition-colors">
                    {item.icon}
                  </span>
                </div>
                <span className="font-semibold text-sm text-slate-900">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between text-[11px] md:text-xs text-slate-500">
            <span>Tap a category to start exploring vendors tailored to your event.</span>
            <Link
              to="/services"
              className="sm:hidden inline-flex items-center gap-1 font-semibold text-primary"
            >
              <span>View all</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </ScrollReveal>

        {/* Trusted partner / features */}
        <ScrollReveal className="py-20 bg-slate-50" delay={60}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col items-center text-center mb-14">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-primary">
                <span className="size-1.5 rounded-full bg-primary" />
                Why hosts trust EventBazaar
              </span>
              <h2 className="mt-5 text-3xl md:text-4xl lg:text-[2.6rem] font-black text-slate-900 leading-tight">
                Your trusted partner for
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-fuchsia-500 to-sky-500">
                  unforgettable events.
                </span>
              </h2>
              <p className="mt-4 max-w-2xl text-sm md:text-base text-slate-600">
                From shortlisting vendors to confirming bookings, we stay with you at every step so you
                can focus on enjoying the celebration.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
              {[
                {
                  icon: 'verified_user',
                  title: 'Verified Vendors',
                  text: 'Every vendor is identity-checked and quality-screened before going live.',
                },
                {
                  icon: 'star',
                  title: 'Rated Services',
                  text: 'Decide confidently with authentic reviews and transparent star ratings.',
                },
                {
                  icon: 'payments',
                  title: 'Best Prices',
                  text: 'Instantly compare quotes and choose options that fit your exact budget.',
                },
                {
                  icon: 'calendar_add_on',
                  title: 'Easy Booking',
                  text: 'Lock in multiple vendors with a single, simple planning experience.',
                },
              ].map((card, idx) => (
                <div
                  key={card.title}
                  className="group relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-sm border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="absolute inset-x-0 -top-16 h-28 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative p-7 flex flex-col gap-4">
                    <div className="inline-flex items-center justify-center">
                      <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary transition-colors">
                        <span className="material-symbols-outlined text-3xl group-hover:text-white transition-colors">
                          {card.icon}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 text-center">
                      <h4 className="text-lg font-bold text-slate-900">{card.title}</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">{card.text}</p>
                    </div>
                    <div className="mt-2 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/70">
                      <span className="material-symbols-outlined text-sm">
                        {idx === 0 ? 'shield' : idx === 1 ? 'reviews' : idx === 2 ? 'price_check' : 'bolt'}
                      </span>
                      <span>Learn more</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Featured Vendors */}
        <ScrollReveal className="py-12 bg-white" delay={60}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold tracking-tight">Featured Vendors</h3>
                <p className="text-slate-500 text-sm mt-1">Top-rated professionals for your big day</p>
              </div>
              <div className="flex gap-2">
                <button className="size-10 rounded-full border border-primary/20 flex items-center justify-center hover:bg-primary/5 transition-colors">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="size-10 rounded-full border border-primary/20 flex items-center justify-center hover:bg-primary/5 transition-colors">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-6">
              {/* Card 1 */}
              <div className="min-w-[300px] flex-shrink-0 bg-white rounded-2xl overflow-hidden border border-primary/5 shadow-md hover:shadow-xl transition-all group">
                <div className="h-48 bg-slate-200 relative overflow-hidden">
                  <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-dvfAwXblfm015_M3Kxw1TEwhktXOV0he7gOGQe8D4NExBgRRJijNxnIykS_fB73QXo5xbosxVRL3Xk4E67eMdWbqDSXJxQupiv0t3_zaazq1kKBPBz4H9RSRmHpiTy9dQ6YVklwLytr03oB6m0h-UdmWVzmy0OnzgP3ZnFeEa0PqC7PgBHgiTH4-9dzFY6XwMnGWrIjUJdH-jAP_4i_mHDjcRwPLl_E69kuP2PAWT1ekAHsQYCdSLjJj-FkdVAzZvKMJk4XsAmc"
                    alt="Gourmet catering food display at a party"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-primary">
                    Catering
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg">Elite Gourmet Catering</h4>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <span className="material-symbols-outlined text-sm">star</span>
                      <span className="text-xs font-bold text-slate-700">4.9</span>
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                    Exquisite farm-to-table wedding menus tailored for your guest list.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-bold">$$$</span>
                    <button className="text-sm font-bold border-b-2 border-primary/40 hover:border-primary transition-all">
                      View Menu
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="min-w-[300px] flex-shrink-0 bg-white rounded-2xl overflow-hidden border border-primary/5 shadow-md hover:shadow-xl transition-all group">
                <div className="h-48 bg-slate-200 relative overflow-hidden">
                  <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDuBwYZ25GjD3m0ZZ6Ix8VbQcjUmfAybdYrJlykIiwrYKPiZ145kWWxZS8FvjU9W4JxVw-TA--JKZIe9DpBLlWltFyD5GSTma1r2y9xt9Qw8d6M7MggKnNFWo_7tLDQiF7ED_aIdpUrbd0ZFzyoimV382oGAgkknTwTqMZ40GLKE7YGE7v1fliLwwNzQOfHNKAkTOpIET1whFj32uI20o3GW4oefxuyJvs7IaBjnz1N1C0upkdJf71B5KfS-WUvcnDEuODqIGx0Ro"
                    alt="Wedding photographer capturing a moment"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-primary">
                    Photography
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg">Golden Hour Studios</h4>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <span className="material-symbols-outlined text-sm">star</span>
                      <span className="text-xs font-bold text-slate-700">5.0</span>
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                    Capturing timeless memories through cinematic storytelling.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-bold">$$</span>
                    <button className="text-sm font-bold border-b-2 border-primary/40 hover:border-primary transition-all">
                      View Gallery
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="min-w-[300px] flex-shrink-0 bg-white rounded-2xl overflow-hidden border border-primary/5 shadow-md hover:shadow-xl transition-all group">
                <div className="h-48 bg-slate-200 relative overflow-hidden">
                  <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuADmojF45U7bCv4rgnccONzjvMP2PlPApkp7xo--jNJp8pheZSmYX3n_md6-De3v4kVBk4z1pCVELHb3BkeJMqtFKpOHU-Fvxa_28ZMp4QjMdauWNBeGtmq_7xHMFQslUHa-xr_lgYoDx1-R3dYQEPwpFgzwqw2QBQqQnXROlh9-HQCbv-D3zafppFMpoTe93jOzNR7bxQIy4HiVccJs9dchq4jhDhUBiuRr-WhcZtcHZUyFFjASiGiJJ3yC_SO3K2TMriWH8pemeo"
                    alt="Professional DJ at an event booth"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-primary">
                    Music
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg">Rhythm &amp; Vibe Entertainment</h4>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <span className="material-symbols-outlined text-sm">star</span>
                      <span className="text-xs font-bold text-slate-700">4.8</span>
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                    Premium sound systems and DJs that keep the dance floor packed.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-bold">$$</span>
                    <button className="text-sm font-bold border-b-2 border-primary/40 hover:border-primary transition-all">
                      Check Dates
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 4 */}
              <div className="min-w-[300px] flex-shrink-0 bg-white rounded-2xl overflow-hidden border border-primary/5 shadow-md hover:shadow-xl transition-all group">
                <div className="h-48 bg-slate-200 relative overflow-hidden">
                  <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDeNaF86WRiXbSR6622CLTrKVlZM6pn0-BFMXVAaAgI6kEhnBeXppN08yGFu5rTZxoZxd4_LIayeVBDJh6yYWWOt_bNGdPzF_fET1Ocfr4kA2wXktiqMeryBR6WHuK12clOR_VJfqnLKVEycPGtvyvfwe_2FA8IazSsB9ofGB6-wnEu0Pu4An4DUL-myJ4NjTaGW-De8BWgLeI1iX4H9gEVzIH0B-CajSeHj9-ZNUtjezMbTs8UGCDugDcIT0DKF5dLceJXZ-BXqJw"
                    alt="Elegant floral wedding table decor"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-primary">
                    Decor
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg">Floral Fantasies Design</h4>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <span className="material-symbols-outlined text-sm">star</span>
                      <span className="text-xs font-bold text-slate-700">4.7</span>
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                    Bespoke floral arrangements and venue transformations for any theme.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-bold">$$$</span>
                    <button className="text-sm font-bold border-b-2 border-primary/40 hover:border-primary transition-all">
                      See Designs
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Partner CTA — full-bleed band, no card */}
        <ScrollReveal className="w-full" delay={80}>
          <section className="relative overflow-hidden bg-gradient-to-r from-primary via-purple-700 to-background-dark py-16 md:py-20">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.04)_50%,transparent_100%)]" />
            <div className="relative z-10 max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:items-center md:justify-between gap-10 md:gap-12">
              <div className="flex-1 max-w-2xl">
                <p className="text-white/70 text-[11px] font-semibold uppercase tracking-[0.3em] mb-3">
                  Partner with us
                </p>
                <h3 className="text-white text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
                  Grow Your Business with EventBazaar
                </h3>
                <p className="mt-4 text-white/80 text-base md:text-lg max-w-xl">
                  Reach thousands of customers planning their next event. List your services, manage
                  bookings, and grow your reputation.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 shrink-0">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-white text-primary font-bold px-6 py-3.5 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                  <span className="material-symbols-outlined text-xl">storefront</span>
                  List Your Service
                </Link>
                <Link
                  to="/contact-us"
                  className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-bold px-6 py-3.5 rounded-full hover:bg-white/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">help</span>
                  How it Works
                </Link>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Final CTA */}
        <ScrollReveal className="py-20" delay={80}>
          <div className="max-w-6xl mx-auto px-4">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-background-dark via-slate-900 to-primary shadow-2xl border border-primary/20">
              {/* subtle texture */}
              <div className="absolute inset-0 opacity-30 mix-blend-soft-light bg-[radial-gradient(circle_at_0_0,rgba(248,250,252,0.4),transparent_55%),radial-gradient(circle_at_100%_0,rgba(244,114,182,0.35),transparent_55%),radial-gradient(circle_at_100%_100%,rgba(129,140,248,0.3),transparent_55%)]" />

              <div className="relative z-10 flex flex-col md:flex-row items-stretch gap-10 px-8 py-10 md:px-12 md:py-12 lg:px-16 lg:py-14">
                <div className="flex-1 flex flex-col justify-center text-center md:text-left gap-6">
                  <div className="inline-flex items-center justify-center md:justify-start gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-[11px] font-semibold uppercase tracking-[0.26em] text-white/80">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Ready to Plan Your Event?
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight text-white">
                      Turn your date into
                      <span className="block text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-purple-300 to-sky-200">
                        an unforgettable celebration.
                      </span>
                    </h2>
                    <p className="text-white/80 text-base md:text-lg max-w-xl mx-auto md:mx-0">
                      Join thousands of happy hosts who trusted EventBazaar for their weddings,
                      birthdays, and corporate events. We’ll help you find, compare and book the right
                      vendors in minutes.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
                    <Link
                      to="/services"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-primary px-10 py-3.5 text-sm md:text-base font-extrabold shadow-xl shadow-primary/40 hover:shadow-primary/60 hover:translate-y-[-1px] transition-all"
                    >
                      <span>Get Started Now</span>
                      <span className="material-symbols-outlined text-base md:text-lg">arrow_forward</span>
                    </Link>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/5 px-6 py-3 text-sm md:text-base font-semibold text-white hover:bg-white/10 transition-colors"
                    >
                      <span className="material-symbols-outlined text-base md:text-lg">event</span>
                      Explore sample event plans
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-[11px] md:text-xs text-white/70 pt-2">
                    <div className="inline-flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-emerald-400">
                        verified
                      </span>
                      <span>No platform fee to get started</span>
                    </div>
                    <div className="w-px h-4 bg-white/20 hidden sm:block" />
                    <div className="inline-flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-amber-300">
                        grade
                      </span>
                      <span>4.9 / 5 average customer rating</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 max-w-sm w-full mx-auto md:mx-0">
                  <div className="h-full rounded-3xl bg-white/5 border border-white/20 px-6 py-6 md:px-7 md:py-7 flex flex-col justify-between gap-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold tracking-[0.26em] uppercase text-white/70">
                        Why hosts choose us
                      </h3>
                      <ul className="space-y-3 text-sm text-white/80">
                        <li className="flex items-start gap-3">
                          <span className="mt-0.5 material-symbols-outlined text-emerald-400 text-base">
                            check_circle
                          </span>
                          <span>Verified, top-rated vendors across catering, decor, music and more.</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="mt-0.5 material-symbols-outlined text-emerald-400 text-base">
                            check_circle
                          </span>
                          <span>Transparent pricing and options that match your guest count and budget.</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="mt-0.5 material-symbols-outlined text-emerald-400 text-base">
                            check_circle
                          </span>
                          <span>One place to shortlist, compare and manage all your bookings.</span>
                        </li>
                      </ul>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/15 pt-4 text-[11px] md:text-xs text-white/60">
                      <div>
                        <div className="font-semibold text-white/80">10k+ events planned</div>
                        <div>from intimate gatherings to grand celebrations</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-white/80">24x7 support</div>
                        <div>for last-minute changes</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </main>

      {/* Bottom mobile nav (only on small screens) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-primary/10 z-50 md:hidden">
        <div className="flex justify-around items-center h-16 px-4">
          <Link to="/" className="flex flex-col items-center gap-1 text-primary">
            <span className="material-symbols-outlined text-2xl">home</span>
            <span className="text-[10px] font-bold">Home</span>
          </Link>
          <Link to="/services" className="flex flex-col items-center gap-1 text-slate-400">
            <span className="material-symbols-outlined text-2xl">search</span>
            <span className="text-[10px] font-bold">Search</span>
          </Link>
          <Link to="/my-bookings" className="flex flex-col items-center gap-1 text-slate-400">
            <span className="material-symbols-outlined text-2xl">calendar_month</span>
            <span className="text-[10px] font-bold">Bookings</span>
          </Link>
          <a className="flex flex-col items-center gap-1 text-slate-400" href="#">
            <span className="material-symbols-outlined text-2xl">track_changes</span>
            <span className="text-[10px] font-bold">Track</span>
          </a>
          <Link to="/login" className="flex flex-col items-center gap-1 text-slate-400">
            <span className="material-symbols-outlined text-2xl">person</span>
            <span className="text-[10px] font-bold">Profile</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
