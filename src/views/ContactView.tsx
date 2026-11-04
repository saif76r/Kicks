import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, ShieldCheck, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const ContactView: React.FC = () => {
  const { settings } = useCart();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Title */}
      <div className="max-w-xl space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B35]">
          Customer Concierge
        </span>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-stone-900">
          Get in Touch with KICKS
        </h1>
        <p className="text-xs text-stone-500">
          Questions about sizing, express delivery, or manual bKash/Nagad verification? Our dedicated team is here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Contact Info (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl skeuo-card p-6 sm:p-8 space-y-6">
            
            <h3 className="font-display font-bold text-base text-stone-900 pb-3 border-b border-black/8">
              Store & Support Details
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl skeuo-inset flex items-center justify-center text-[#FF6B35] shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-stone-900 block">Customer Helpline</span>
                  <p className="font-mono text-stone-600 mt-0.5">{settings.supportPhone}</p>
                  <p className="text-[11px] text-stone-400">10:00 AM – 10:00 PM (Daily)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl skeuo-inset flex items-center justify-center text-[#FF6B35] shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-stone-900 block">Direct Email</span>
                  <p className="text-stone-600 mt-0.5">{settings.supportEmail}</p>
                  <p className="text-[11px] text-stone-400">Response within 2 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl skeuo-inset flex items-center justify-center text-[#FF6B35] shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-stone-900 block">Flagship Store Location</span>
                  <p className="text-stone-600 mt-0.5 leading-snug">
                    Plot 18, Road 11, Banani / Gulshan-2 Avenue, Dhaka-1213
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl skeuo-inset flex items-center justify-center text-[#FF6B35] shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-stone-900 block">Online Order Processing</span>
                  <p className="text-stone-600 mt-0.5">24/7 Automated Dispatch Queue</p>
                </div>
              </div>
            </div>

            {/* Verification callout */}
            <div className="pt-4 border-t border-black/5 text-xs text-stone-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Payments verified directly by KICKS authorization desk.</span>
            </div>

          </div>

          {/* WhatsApp Support Box */}
          <a
            href="https://wa.me/8801706695247?text=Hello%20KICKS,%20I%20would%20like%20to%20know%20details%20about%20your%20shoes."
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-3xl bg-gradient-to-r from-emerald-50 to-white hover:from-emerald-100/90 hover:to-emerald-50/50 border border-emerald-300 text-emerald-950 flex items-center justify-between gap-3 shadow-md transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
                <MessageCircle className="w-6 h-6 fill-white text-[#25D366]" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900 leading-snug">
                  Product details জানতে WhatsApp-এ নক দিন
                </p>
                <p className="text-xs font-mono text-emerald-800 font-bold mt-0.5">
                  01706695247 (WhatsApp)
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-xs group-hover:bg-[#25D366] group-hover:text-white transition-all shrink-0">
              Chat Now →
            </span>
          </a>
        </div>

        {/* Contact Form (7 cols) */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="rounded-3xl skeuo-card p-6 sm:p-8 space-y-4">
            <h3 className="font-display font-bold text-base text-stone-900 pb-3 border-b border-black/8">
              Send Us a Message
            </h3>

            {submitted && (
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Thank you! Your message has been sent to our customer care team.</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Saif Meer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl skeuo-inset-light text-xs text-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl skeuo-inset-light text-xs text-stone-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Size exchange inquiry, order tracking..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl skeuo-inset-light text-xs text-stone-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Your Message *
              </label>
              <textarea
                required
                rows={4}
                placeholder="How can we assist you today?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl skeuo-inset-light text-xs text-stone-900 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="py-3 px-6 rounded-xl skeuo-btn-primary font-display font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Message
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
