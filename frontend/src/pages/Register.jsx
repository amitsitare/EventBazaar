import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  ArrowRight,
  Store,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Map as MapIcon,
} from 'lucide-react';
import { API_BASE } from '../auth.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function Register() {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    address: '',
    role: 'customer',
    password: '',
    latitude: null,
    longitude: null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobile') {
      const digitsOnly = String(value || '').replace(/\D/g, '').slice(0, 10);
      setForm((prev) => ({ ...prev, mobile: digitsOnly }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const getLocation = () =>
    new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          // Location permission is optional during registration.
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
        }
      );
    });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const loc = await getLocation();
      const payload = loc ? { ...form, ...loc } : { ...form };
      await axios.post(`${API_BASE}/api/auth/register`, payload);
      setSuccess(t('registerSuccess'));
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      const serverMsg = err.response?.data?.detail;
      setError(serverMsg || t('registerFailed'));
    } finally {
      setLoading(false);
    }
  };

  const setRole = (role) => {
    setForm((prev) => ({ ...prev, role }));
  };

  return (
    <main className="bg-background-light min-h-screen py-10 px-4 relative overflow-hidden flex items-center justify-center">
      {/* Floating Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            y: [0, -40, 0],
            x: [0, 20, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] right-[5%] size-64 bg-primary/5 blur-[100px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            y: [0, 60, 0],
            x: [0, -30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[20%] left-[10%] size-96 bg-amber-500/5 blur-[120px] rounded-full" 
        />
      </div>

      <div className="max-w-6xl w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Side - Info */}
          <div className="lg:col-span-4 space-y-6 hidden lg:block">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-primary"
            >
              <Sparkles className="size-3" />
              {t('registerBadge')}
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-black tracking-tighter text-slate-900 leading-[0.95]"
            >
              {t('registerStartYour')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-amber-500 to-primary">{t('registerJourney')}</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base text-slate-500 font-medium leading-relaxed"
            >
              {t('registerLead')}
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              {[
                t('registerFeature1'),
                t('registerFeature2'),
                t('registerFeature3'),
                t('registerFeature4')
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                  <div className="size-5 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="size-3" />
                  </div>
                  {item}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Side - Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-8 bg-white rounded-[2rem] border border-slate-100 shadow-xl p-6 md:p-10"
          >
            <div className="text-center lg:text-left mb-7 space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">{t('registerCreateAccount')}</h2>
              <p className="text-sm text-slate-500 font-medium">{t('registerJoinToday')}</p>
            </div>

            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-3 mb-7">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  form.role === 'customer' 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                }`}
              >
                <Users className="size-5" />
                <span className="text-xs font-black uppercase tracking-widest">{t('registerCustomer')}</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('provider')}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  form.role === 'provider' 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                }`}
              >
                <Store className="size-5" />
                <span className="text-xs font-black uppercase tracking-widest">{t('registerVendor')}</span>
              </button>
            </div>

            <AnimatePresence mode="wait">
              {(error || success) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 space-y-3 overflow-hidden"
                >
                  {error && (
                    <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-rose-700 font-bold text-sm">
                      <AlertCircle className="size-5 shrink-0" />
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-emerald-700 font-bold text-sm">
                      <CheckCircle2 className="size-5 shrink-0" />
                      {success}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={onSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{t('registerFullName')}</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
                    <input
                      required
                      name="name"
                      value={form.name}
                      onChange={onChange}
                      placeholder="Sandeep"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-3.5 text-slate-900 font-bold focus:ring-4 focus:ring-primary/20 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{t('registerEmail')}</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
                    <input
                      required
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={onChange}
                      placeholder="sandeep@example.com"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-3.5 text-slate-900 font-bold focus:ring-4 focus:ring-primary/20 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{t('registerMobile')}</label>
                  <div className="relative">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
                    <input
                      required
                      type="tel"
                      maxLength={10}
                      name="mobile"
                      value={form.mobile}
                      onChange={onChange}
                      placeholder={t('registerMobilePlaceholder')}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-3.5 text-slate-900 font-bold focus:ring-4 focus:ring-primary/20 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{t('registerLocation')}</label>
                  <div className="relative">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
                    <input
                      name="address"
                      value={form.address}
                      onChange={onChange}
                      placeholder="e.g. Lucknow"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-3.5 text-slate-900 font-bold focus:ring-4 focus:ring-primary/20 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{t('registerPassword')}</label>
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
                    <input
                      required
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={onChange}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-3.5 text-slate-900 font-bold focus:ring-4 focus:ring-primary/20 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white font-black py-3.5 rounded-2xl shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
                >
                  {loading ? t('registerCreating') : t('registerCreateAccount')}
                  {!loading && <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />}
                </button>
                
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
                  <MapIcon className="size-3" />
                  {t('registerLocationOptional')}
                </div>
              </div>

              <div className="pt-4 text-center">
                <p className="text-sm font-bold text-slate-500">
                  {t('registerAlready')}{' '}
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-primary hover:bg-primary/15"
                  >
                    {t('registerSignIn')}
                  </Link>
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
