import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 3200);
  };

  const inputClass =
    'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-100';

  const cards = [
    {
      title: 'Our address',
      lines: ['Tiwariganj', 'Lucknow, Uttar Pradesh (226028)', 'India'],
      icon: MapPin,
    },
    {
      title: 'Phone',
      content: (
        <a href="tel:+916395490029" className="font-medium text-amber-800 hover:text-primary">
          +91 63954 90029
        </a>
      ),
      icon: Phone,
    },
    {
      title: 'Email',
      content: (
        <a
          href="mailto:amitdiwakar946@gmail.com"
          className="break-all font-medium text-amber-800 hover:text-primary"
        >
          amitdiwakar946@gmail.com
        </a>
      ),
      icon: Mail,
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50/40 via-white to-slate-50 py-6 md:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8 text-center md:mb-10"
        >
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50/90 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-800">
            <Sparkles className="size-3.5 text-amber-600" strokeWidth={2.5} />
            We are here to help
          </p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-5xl">Contact us</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 md:text-base">
            Questions about bookings, becoming a vendor, or something else? Send a note — we will get back
            as soon as we can.
          </p>
        </motion.header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 text-center shadow-sm backdrop-blur transition hover:shadow-md md:text-left"
              >
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-amber-800 md:mx-0">
                  <Icon className="size-6" strokeWidth={2.2} />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">{c.title}</h2>
                {c.lines ? (
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {c.lines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </p>
                ) : (
                  <div className="mt-2 text-sm text-slate-600">{c.content}</div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 shadow-sm backdrop-blur md:p-8 md:rounded-[2.5rem]">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-slate-900 text-primary">
                  <MessageCircle className="size-5" strokeWidth={2.2} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Send a message</h2>
                  <p className="text-sm text-slate-500">Fields marked * are required.</p>
                </div>
              </div>

              {submitted && (
                <div
                  className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-900"
                  role="status"
                >
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                  <span>Thank you for reaching out. We will reply shortly.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Full name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className={inputClass}
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={inputClass}
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className={inputClass}
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="+91 ..."
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      className={inputClass}
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a topic</option>
                      <option value="general">General inquiry</option>
                      <option value="booking">Booking support</option>
                      <option value="provider">Become a provider</option>
                      <option value="technical">Technical support</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    className={inputClass}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="How can we help?"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-background-dark shadow-lg shadow-amber-200/50 transition hover:-translate-y-0.5 hover:shadow-xl sm:w-auto sm:px-10"
                >
                  <Send className="size-4" strokeWidth={2.2} />
                  Send message
                </button>
              </form>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="flex flex-col gap-5 lg:col-span-2"
          >
            <div className="rounded-[2rem] border border-slate-200/80 bg-gradient-to-br from-slate-900 to-background-dark p-6 text-white shadow-lg md:rounded-[2.5rem] md:p-8">
              <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-white/10 text-primary">
                <Clock className="size-5" strokeWidth={2.2} />
              </div>
              <h2 className="text-lg font-bold">Business hours</h2>
              <ul className="mt-4 space-y-2 text-sm text-white/75">
                <li className="flex justify-between gap-4 border-b border-white/10 pb-2">
                  <span>Mon – Fri</span>
                  <span className="font-medium text-white/90">9:00 – 18:00</span>
                </li>
                <li className="flex justify-between gap-4 border-b border-white/10 pb-2">
                  <span>Saturday</span>
                  <span className="font-medium text-white/90">10:00 – 16:00</span>
                </li>
                <li className="flex justify-between gap-4 pt-1">
                  <span>Sunday</span>
                  <span className="font-medium text-white/90">Closed</span>
                </li>
              </ul>
            </div>

            <div className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 shadow-sm md:rounded-[2.5rem] md:p-8">
              <h2 className="text-lg font-bold text-slate-900">Follow along</h2>
              <p className="mt-1 text-sm text-slate-500">Updates, inspiration, and behind-the-scenes.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  { href: 'https://facebook.com', label: 'Facebook' },
                  { href: 'https://instagram.com', label: 'Instagram' },
                  { href: 'https://twitter.com', label: 'X' },
                  { href: 'https://linkedin.com', label: 'LinkedIn' },
                  { href: 'https://whatsapp.com', label: 'WhatsApp' },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-900"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
              <Link
                to="/services"
                className="mt-6 inline-flex text-sm font-semibold text-amber-800 hover:text-primary"
              >
                Browse vendors →
              </Link>
            </div>
          </motion.aside>
        </div>
      </div>
    </main>
  );
}
