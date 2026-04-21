import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  Cake,
  Camera,
  Music,
  Palette,
  Sparkles,
  Utensils,
  Users,
  ShieldCheck,
  CalendarRange,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext.jsx';

const categoriesRaw = [
  {
    title: 'Catering & banquets',
    desc: 'Menus from intimate gatherings to grand receptions — chefs, live counters, and curated tastings.',
    icon: Utensils,
    accent: 'from-amber-500/20 to-orange-100/80',
    border: 'border-amber-200/80',
  },
  {
    title: 'Photography & film',
    desc: 'Story-driven coverage, candid moments, and highlight reels you will replay for years.',
    icon: Camera,
    accent: 'from-rose-500/15 to-amber-50/90',
    border: 'border-rose-200/60',
  },
  {
    title: 'Decor & florals',
    desc: 'Stages, mandaps, lighting design, and florals tailored to your palette and venue.',
    icon: Palette,
    accent: 'from-emerald-500/15 to-amber-50/80',
    border: 'border-emerald-200/70',
  },
  {
    title: 'Music & entertainment',
    desc: 'DJs, live bands, anchors, and performers that match the energy of your crowd.',
    icon: Music,
    accent: 'from-violet-500/15 to-slate-50',
    border: 'border-violet-200/70',
  },
  {
    title: 'Venues & spaces',
    desc: 'Banquet halls, lawns, rooftops, and boutique locations with the right capacity and vibe.',
    icon: Building2,
    accent: 'from-sky-500/15 to-slate-50',
    border: 'border-sky-200/70',
  },
  {
    title: 'Cakes & desserts',
    desc: 'Custom tiers, dessert tables, and regional sweets styled for your celebration.',
    icon: Cake,
    accent: 'from-pink-500/15 to-amber-50/90',
    border: 'border-pink-200/60',
  },
];

const pillarsRaw = [
  {
    title: 'Vetted partners',
    body: 'Browse profiles, packages, and real reviews before you shortlist.',
    icon: ShieldCheck,
  },
  {
    title: 'One place to plan',
    body: 'Compare categories side by side, then book without juggling ten different tabs.',
    icon: CalendarRange,
  },
  {
    title: 'Built for hosts',
    body: 'Whether it is a wedding, birthday, or corporate offsite — the same polished flow.',
    icon: Users,
  },
];

export default function ServicesOverview() {
  const { t } = useLanguage();
  const categories = [
    { ...categoriesRaw[0], title: t('servicesOverviewCat1Title'), desc: t('servicesOverviewCat1Desc') },
    { ...categoriesRaw[1], title: t('servicesOverviewCat2Title'), desc: t('servicesOverviewCat2Desc') },
    { ...categoriesRaw[2], title: t('servicesOverviewCat3Title'), desc: t('servicesOverviewCat3Desc') },
    { ...categoriesRaw[3], title: t('servicesOverviewCat4Title'), desc: t('servicesOverviewCat4Desc') },
    { ...categoriesRaw[4], title: t('servicesOverviewCat5Title'), desc: t('servicesOverviewCat5Desc') },
    { ...categoriesRaw[5], title: t('servicesOverviewCat6Title'), desc: t('servicesOverviewCat6Desc') },
  ];
  const pillars = [
    { ...pillarsRaw[0], title: t('servicesOverviewPillar1Title'), body: t('servicesOverviewPillar1Body') },
    { ...pillarsRaw[1], title: t('servicesOverviewPillar2Title'), body: t('servicesOverviewPillar2Body') },
    { ...pillarsRaw[2], title: t('servicesOverviewPillar3Title'), body: t('servicesOverviewPillar3Body') },
  ];
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50/40 via-white to-slate-50 py-6 md:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/90 p-8 shadow-sm backdrop-blur md:p-12 md:rounded-[2.5rem]"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.35),transparent_68%)] blur-2xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.2),transparent_70%)] blur-2xl"
          />
          <div className="relative max-w-3xl space-y-5">
            <p className="inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50/90 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-800">
              <Sparkles className="size-3.5 text-amber-600" strokeWidth={2.5} />
              {t('servicesOverviewBadge')}
            </p>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-5xl md:leading-[1.08]">
              {t('servicesOverviewHeroTitlePrefix')}{' '}
              <span className="bg-gradient-to-r from-amber-600 via-primary to-amber-500 bg-clip-text text-transparent">
                {t('servicesOverviewHeroTitleHighlight')}
              </span>
            </h1>
            <p className="text-base leading-relaxed text-slate-600 md:text-lg">
              {t('servicesOverviewHeroBody')}
            </p>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
              <Link
                to="/services"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-sm font-bold text-background-dark shadow-lg shadow-amber-200/60 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-300/50"
              >
                {t('servicesOverviewFindVendors')}
                <ArrowRight className="size-4" strokeWidth={2.5} />
              </Link>
              <Link
                to="/contact-us"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-8 py-3.5 text-sm font-bold text-slate-700 transition hover:border-primary/40 hover:text-primary"
              >
                {t('servicesOverviewTalkToUs')}
              </Link>
            </div>
          </div>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.06 }}
          className="mt-10 md:mt-14"
        >
          <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
                {t('servicesOverviewExploreCategories')}
              </h2>
              <p className="mt-1 max-w-xl text-sm text-slate-500">
                {t('servicesOverviewExploreSubtitle')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, index) => {
              const Icon = cat.icon;
              return (
                <motion.article
                  key={cat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.08 + index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className={`group relative overflow-hidden rounded-3xl border ${cat.border} bg-gradient-to-br ${cat.accent} p-6 shadow-sm transition-shadow hover:shadow-xl hover:shadow-slate-200/60`}
                >
                  <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-white/90 text-amber-700 shadow-sm ring-1 ring-slate-200/60">
                    <Icon className="size-6" strokeWidth={2.2} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{cat.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{cat.desc}</p>
                  <Link
                    to="/services"
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-800 transition group-hover:gap-2"
                  >
                    {t('servicesOverviewBrowseMarketplace')}
                    <ArrowRight className="size-4" />
                  </Link>
                </motion.article>
              );
            })}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.45 }}
          className="mt-14 md:mt-20"
        >
          <div className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-8 shadow-sm md:p-10 md:rounded-[2.5rem]">
            <h2 className="text-center text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
              {t('servicesOverviewWhyTitle')}
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-slate-500">
              {t('servicesOverviewWhySubtitle')}
            </p>
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
              {pillars.map((p) => {
                const Icon = p.icon;
                return (
                  <div
                    key={p.title}
                    className="rounded-2xl border border-slate-100 bg-slate-50/80 p-6 text-center md:text-left"
                  >
                    <div className="mx-auto mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-primary/15 text-amber-800 md:mx-0">
                      <Icon className="size-5" strokeWidth={2.2} />
                    </div>
                    <h3 className="font-bold text-slate-900">{p.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="mt-12 pb-8 md:mt-16"
        >
          <div className="relative overflow-hidden rounded-[2rem] bg-background-dark px-8 py-12 text-center md:rounded-[2.5rem] md:px-12">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(251,191,36,0.25),transparent_50%),radial-gradient(circle_at_80%_100%,rgba(255,255,255,0.06),transparent_45%)]"
            />
            <div className="relative mx-auto max-w-2xl space-y-5">
              <h2 className="text-2xl font-black tracking-tight text-white md:text-3xl">
                {t('servicesOverviewCtaTitle')}
              </h2>
              <p className="text-sm text-white/65 md:text-base">
                {t('servicesOverviewCtaBody')}
              </p>
              <Link
                to="/services"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-10 py-4 text-sm font-black text-background-dark shadow-xl shadow-primary/25 transition hover:-translate-y-0.5 hover:shadow-primary/40"
              >
                {t('servicesOverviewOpenFindVendors')}
                <ArrowRight className="size-4" strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
