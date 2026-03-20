import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, CheckCircle2, AlertCircle, LogIn } from 'lucide-react';
import { API_BASE, setAuth } from '../auth.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError('');
    setSuccess('');

    try {
      setLoading(true);
      const { data: token } = await axios.post(`${API_BASE}/api/auth/login`, { email, password });

      // Fetch profile for role (needed to route to the correct dashboard).
      const { data: profile } = await axios.get(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token.access_token}` },
      });

      setAuth(token.access_token, profile.role);
      setSuccess('Login successful! Redirecting...');

      // Small delay so the success banner is visible.
      setTimeout(() => {
        navigate(profile.role === 'provider' ? '/dashboard' : '/my-bookings');
      }, 800);
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
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
            className="absolute top-[10%] left-[5%] size-64 bg-primary/5 blur-[100px] rounded-full" 
          />
          <motion.div 
            animate={{ 
              y: [0, 60, 0],
              x: [0, -30, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[20%] right-[10%] size-96 bg-amber-500/5 blur-[120px] rounded-full" 
          />
        </div>
  
        <div className="max-w-sm w-full relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-6 md:p-8"
          >
            <div className="text-center mb-7 space-y-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center justify-center size-12 rounded-2xl bg-primary/10 text-primary mx-auto"
              >
                <LogIn className="size-6" />
              </motion.div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-slate-900">Welcome Back</h2>
                <p className="text-sm text-slate-500 font-medium">Log in to manage your events and services.</p>
              </div>
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
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
                  <input
                    required
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-3.5 text-slate-900 font-bold focus:ring-4 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>
              </div>
  
              <div className="space-y-2">
                <div className="flex justify-between items-center px-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password</label>
                  <button type="button" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Forgot?</button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
                  <input
                    required
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-3.5 text-slate-900 font-bold focus:ring-4 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>
              </div>
  
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white font-black py-3.5 rounded-2xl shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                  {!loading && <ArrowRight className="size-4 transition-transform" />}
                </button>
              </div>
  
              <div className="pt-6 text-center">
                <p className="text-sm font-bold text-slate-500">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-primary hover:underline">Create One</Link>
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </main>
    );
  }
  