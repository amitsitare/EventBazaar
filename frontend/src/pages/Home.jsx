import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Utensils, 
  Camera, 
  Trees, 
  Music, 
  Building2, 
  Cake, 
  ShieldCheck, 
  Star, 
  CreditCard, 
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Store,
  HelpCircle,
  Home as HomeIcon,
  Search,
  Calendar,
  User
} from 'lucide-react';

function ScrollReveal({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: delay / 1000, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const { t } = useLanguage();

  const trustItems = [
    {
      icon: ShieldCheck,
      titleKey: 'homeTrustVerifiedTitle',
      descKey: 'homeTrustVerifiedDesc',
    },
    {
      icon: Star,
      titleKey: 'homeTrustRatedTitle',
      descKey: 'homeTrustRatedDesc',
    },
    {
      icon: CreditCard,
      titleKey: 'homeTrustQuotesTitle',
      descKey: 'homeTrustQuotesDesc',
    },
    {
      icon: CalendarPlus,
      titleKey: 'homeTrustBookingTitle',
      descKey: 'homeTrustBookingDesc',
    },
  ];

  const vendorCategoryKey = {
    Catering: 'homeCatCateringShort',
    Photography: 'homeCatPhotoShort',
    Music: 'homeCatMusic',
    Decor: 'homeCatDecorShort',
  };

  return (
    <div className="min-h-screen font-sans antialiased relative pb-16 md:pb-0">
      <main className="bg-background-light relative overflow-hidden">
        {/* Floating Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ 
              y: [0, -40, 0],
              x: [0, 20, 0],
              rotate: [0, 10, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[20%] right-[10%] size-64 bg-primary/5 blur-[100px] rounded-full" 
          />
          <motion.div 
            animate={{ 
              y: [0, 60, 0],
              x: [0, -30, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[10%] left-[5%] size-96 bg-amber-500/5 blur-[120px] rounded-full" 
          />
        </div>

        {/* Hero */}
        <section className="relative w-full p-4 md:p-6 lg:p-8">
          <div className="relative overflow-hidden rounded-[2.5rem] min-h-[70vh] md:min-h-[80vh] bg-background-dark flex items-center">
            {/* Background image + gradient */}
              <div className="absolute inset-0">
              <motion.img
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1.05, opacity: 0.4 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="h-full w-full object-cover grayscale-[0.5]"
                src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop"
                alt={t('homeHeroImgAlt')}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background-dark via-background-dark/80 to-transparent" />
            </div>
            
            {/* The "Torch" Effect - Strong light from the left */}
            <motion.div 
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="absolute inset-0 pointer-events-none"
            >
              <div className="absolute -left-[10%] top-1/2 -translate-y-1/2 w-[60%] h-[120%] bg-[radial-gradient(circle_at_0%_50%,rgba(251,191,36,0.25),transparent_70%)] blur-3xl" />
              <div className="absolute left-0 top-0 w-full h-full bg-[linear-gradient(90deg,rgba(251,191,36,0.05)_0%,transparent_40%)]" />
            </motion.div>

            <div className="relative z-10 w-full px-6 sm:px-10 lg:px-20 py-20">
              <div className="max-w-4xl space-y-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md text-xs font-bold uppercase tracking-[0.25em] text-primary"
                >
                  <span className="size-2 rounded-full bg-primary animate-pulse" />
                  {t('homeHeroBadge')}
                </motion.div>

                <div className="space-y-6">
                  <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tighter leading-[0.85] text-white">
                    <motion.span 
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 1 }}
                      className="block"
                    >
                      {t('homeHeroLightUp')}
                    </motion.span>
                    <motion.span 
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 1.2 }}
                      className="relative block mt-2"
                    >
                      <span className="absolute -inset-x-6 -inset-y-3 bg-primary/10 blur-3xl rounded-full" />
                      <span className="relative font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-amber-200">
                        {t('homeHeroYourEvent')}
                      </span>
                    </motion.span>
                  </h1>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="text-xl sm:text-2xl font-medium text-white/70 max-w-xl leading-relaxed"
                  >
                    {t('homeHeroSub')}
                  </motion.p>
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.8 }}
                  className="flex flex-col sm:flex-row items-center gap-4 pt-4"
                >
                  <Link
                    to="/services"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-primary text-background-dark px-10 py-4 text-lg font-black shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all active:scale-95"
                  >
                    {t('homeStartPlanning')}
                    <ArrowRight className="size-5" />
                  </Link>
                  <button
                    type="button"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-white px-8 py-4 text-lg font-bold hover:bg-white/10 transition-all"
                  >
                    {t('homeViewGallery')}
                  </button>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Marquee Social Proof */}
        <div className="py-12 border-y border-slate-100 bg-white overflow-hidden">
          <div className="flex whitespace-nowrap animate-marquee">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-12 px-6">
                {['VOGUE', 'BRIDES', 'HARPER\'S BAZAAR', 'THE KNOT', 'WEDDINGWIRE', 'ELLE'].map((brand) => (
                  <span key={brand} className="text-2xl font-black text-slate-200 tracking-tighter hover:text-primary transition-colors cursor-default">
                    {brand}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Categories Bento Grid */}
        <section className="max-w-7xl mx-auto px-6 py-32">
          <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                <span className="size-1.5 rounded-full bg-primary" />
                {t('homeCollectionBadge')}
              </span>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[0.9]">
                {t('homeCollectionTitleLine1')} <br />
                {t('homeCollectionTitleLine2')}
              </h2>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-full border-2 border-slate-200 px-8 py-4 text-sm font-bold uppercase tracking-[0.1em] text-slate-600 hover:border-primary hover:text-primary transition-all"
            >
              {t('homeExploreAll')}
              <ArrowRight className="size-4" />
            </Link>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 h-[800px] md:h-[600px]">
            {/* Large Item 1 */}
            <ScrollReveal className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-[3rem] bg-orange-50">
              <img 
                src="https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070&auto=format&fit=crop" 
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
                alt={t('homeCatCatering')}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-orange-900/80 via-transparent to-transparent" />
              <div className="absolute bottom-10 left-10 text-white">
                <Utensils className="size-12 mb-4 text-primary" />
                <h3 className="text-3xl font-black tracking-tight">{t('homeCatCatering')}</h3>
                <p className="text-white/70 font-medium">{t('homeCatCateringDesc')}</p>
              </div>
            </ScrollReveal>

            {/* Medium Item 1 */}
            <ScrollReveal delay={100} className="md:col-span-2 group relative overflow-hidden rounded-[3rem] bg-amber-50">
              <img 
                src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2070&auto=format&fit=crop" 
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
                alt={t('homeCatVenues')}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-amber-900/80 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 text-white">
                <Building2 className="size-10 mb-2 text-primary" />
                <h3 className="text-2xl font-black tracking-tight">{t('homeCatVenues')}</h3>
              </div>
            </ScrollReveal>

            {/* Small Items */}
            <ScrollReveal delay={200} className="group relative overflow-hidden rounded-[3rem] bg-amber-50">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center group-hover:bg-primary transition-colors">
                <Camera className="size-12 text-amber-600 group-hover:text-background-dark transition-colors" />
                <span className="font-black text-slate-900 group-hover:text-background-dark">
                  {t('homeCatPhoto')}
                </span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300} className="group relative overflow-hidden rounded-[3rem] bg-emerald-50">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center group-hover:bg-primary transition-colors">
                <Trees className="size-12 text-emerald-600 group-hover:text-background-dark transition-colors" />
                <span className="font-black text-slate-900 group-hover:text-background-dark">
                  {t('homeCatDecor')}
                </span>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Trust Section - Interactive Grid */}
        <section className="py-32 bg-background-dark text-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
             <div className="absolute top-1/2 -left-[10%] -translate-y-1/2 w-[50%] h-[100%] bg-[radial-gradient(circle_at_0%_50%,#fbbf24,transparent_70%)]" />
          </div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <ScrollReveal className="space-y-8">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-primary">
                  {t('homeTrustBadge')}
                </span>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]">
                  {t('homeTrustLine1')} <br />
                  {t('homeTrustLine2')} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-amber-200">
                    {t('homeTrustLine3')}
                  </span>
                </h2>
                <p className="text-xl text-white/60 max-w-md leading-relaxed">{t('homeTrustBody')}</p>
                <div className="flex items-center gap-8 pt-4">
                  <div>
                    <div className="text-4xl font-black text-primary">10k+</div>
                    <div className="text-xs font-bold uppercase tracking-widest text-white/40">
                      {t('homeStatVendors')}
                    </div>
                  </div>
                  <div className="w-px h-12 bg-white/10" />
                  <div>
                    <div className="text-4xl font-black text-primary">50k+</div>
                    <div className="text-xs font-bold uppercase tracking-widest text-white/40">
                      {t('homeStatHosts')}
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {trustItems.map((item, idx) => (
                  <ScrollReveal
                    key={item.titleKey}
                    delay={idx * 100}
                    className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-primary hover:text-background-dark transition-all group cursor-default"
                  >
                    <item.icon className="size-10 text-primary group-hover:text-background-dark mb-6 transition-colors" />
                    <h4 className="text-xl font-bold mb-2">{t(item.titleKey)}</h4>
                    <p className="text-sm text-white/40 group-hover:text-background-dark/60 transition-colors leading-relaxed">
                      {t(item.descKey)}
                    </p>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Vendors */}
        <section className="py-32 max-w-7xl mx-auto px-6">
          <ScrollReveal className="flex items-center justify-between mb-16">
            <div className="space-y-2">
              <h3 className="text-3xl font-black tracking-tight">{t('homeFeaturedTitle')}</h3>
              <p className="text-slate-500 font-medium">{t('homeFeaturedSubtitle')}</p>
            </div>
            <div className="flex gap-3">
              <button className="size-12 rounded-full border-2 border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all">
                <ChevronLeft className="size-6" />
              </button>
              <button className="size-12 rounded-full border-2 border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all">
                <ChevronRight className="size-6" />
              </button>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                name: 'Elite Gourmet Catering', 
                cat: 'Catering', 
                rating: '4.9', 
                price: '10,000 Rs',
                img: 'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070&auto=format&fit=crop'
              },
              { 
                name: 'Golden Hour Studios', 
                cat: 'Photography', 
                rating: '5.0', 
                price: '57,000 Rs',
                img: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=2070&auto=format&fit=crop'
              },
              { 
                name: 'Rhythm & Vibe Ent.', 
                cat: 'Music', 
                rating: '4.8', 
                price: '6,000 Rs',
                img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop'
              },
              { 
                name: 'Floral Fantasies', 
                cat: 'Decor', 
                rating: '4.7', 
                price: '8,500 Rs',
                img: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop'
              },
            ].map((vendor, idx) => (
              <ScrollReveal key={vendor.name} delay={idx * 100} className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all">
                <div className="h-64 relative overflow-hidden">
                  <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    src={vendor.img}
                    alt={vendor.name}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black text-primary uppercase tracking-wider">
                    {t(vendorCategoryKey[vendor.cat] ?? 'homeCatCateringShort')}
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-black text-xl text-slate-900 leading-tight">{vendor.name}</h4>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="size-4 fill-current" />
                      <span className="text-sm font-black text-slate-700">{vendor.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
                        {t('homeStartingFrom')}
                      </span>
                      <span className="text-primary text-xl font-black">{vendor.price}</span>
                    </div>
                    <button className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                      <ArrowRight className="size-6" />
                    </button>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Partner CTA */}
        <section className="px-6 py-20">
          <div className="max-w-7xl mx-auto rounded-[3rem] overflow-hidden bg-background-dark relative border border-white/10">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_0%_50%,rgba(251,191,36,0.4),transparent_50%)]" />
            <div className="relative z-10 px-10 py-20 md:px-20 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="max-w-2xl space-y-6 text-center md:text-left">
                <span className="text-primary text-xs font-bold uppercase tracking-[0.3em]">
                  {t('homePartnerBadge')}
                </span>
                <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
                  {t('homePartnerTitle')}
                </h2>
                <p className="text-white/70 text-lg font-medium">{t('homePartnerBody')}</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-3 bg-primary text-background-dark font-black px-10 py-5 rounded-2xl shadow-2xl hover:scale-105 transition-all"
                >
                  <Store className="size-6" />
                  {t('homeListService')}
                </Link>
                <Link
                  to="/contact-us"
                  className="inline-flex items-center gap-3 border-2 border-white/20 text-white font-bold px-8 py-5 rounded-2xl hover:bg-white/10 transition-all"
                >
                  <HelpCircle className="size-6" />
                  {t('homeHowItWorks')}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="py-32 px-6">
          <ScrollReveal className="max-w-5xl mx-auto text-center space-y-10">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[0.9]">
              {t('homeReadyTitle1')} <br />
              <span className="italic font-serif font-normal text-primary">{t('homeReadyTitle2')}</span>
            </h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">{t('homeReadyBody')}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
              <Link
                to="/services"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-primary text-white px-12 py-6 text-xl font-black shadow-2xl shadow-primary/40 hover:shadow-primary/60 hover:-translate-y-1 transition-all"
              >
                {t('homeGetStartedNow')}
                <ArrowRight className="size-6" />
              </Link>
              <div className="flex items-center gap-4 text-slate-400">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="size-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="" />
                    </div>
                  ))}
                </div>
                <span className="text-sm font-bold">{t('homeTrustedBy')}</span>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </main>

      {/* Bottom mobile nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-50 md:hidden">
        <div className="flex justify-around items-center h-20 px-4">
          <Link to="/" className="flex flex-col items-center gap-1 text-primary">
            <HomeIcon className="size-6" />
            <span className="text-[10px] font-black uppercase tracking-wider">{t('mobileHome')}</span>
          </Link>
          <Link to="/services" className="flex flex-col items-center gap-1 text-slate-400">
            <Search className="size-6" />
            <span className="text-[10px] font-black uppercase tracking-wider">{t('mobileSearch')}</span>
          </Link>
          <Link to="/my-bookings" className="flex flex-col items-center gap-1 text-slate-400">
            <Calendar className="size-6" />
            <span className="text-[10px] font-black uppercase tracking-wider">{t('mobileBookings')}</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center gap-1 text-slate-400">
            <User className="size-6" />
            <span className="text-[10px] font-black uppercase tracking-wider">{t('mobileProfile')}</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
