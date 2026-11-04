import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings } = useCart();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribed(true);
    setNewsletterEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer className="bg-[#151515] text-[#ECECE9] pt-16 pb-12 border-t border-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-2xl px-4 py-2 shadow-xl inline-flex items-center justify-center">
                <img
                  src="/assets/aistudio/WhatsApp_Image_2026-11-04_at_11.08.18_PM_0f182253.jpeg"
                  alt="KICKS Logo"
                  className="h-12 sm:h-14 w-auto object-contain"
                />
              </div>
            </div>
            
            <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
              Engineered footwear built with premium materials, responsive cushions, and sculptural ergonomics. Authentic craftsmanship delivered nationwide.
            </p>

            <div className="pt-2 space-y-2 text-xs text-stone-300">
              <a 
                href="https://wa.me/8801706695247?text=Hello%20KICKS,%20I%20want%20to%20know%20product%20details."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                <span>WhatsApp: 01706695247 (Product Details)</span>
              </a>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#FF6B35]" />
                <span className="font-mono">{settings.supportPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#FF6B35]" />
                <span>{settings.supportEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#FF6B35]" />
                <span>Gulshan-2 / Dhanmondi Flagship, Dhaka</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-white">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors">
                  All Shoes
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
                  About KICKS
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">
                  Contact Support
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-white">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button onClick={() => onNavigate('tracking')} className="hover:text-white transition-colors">
                  Track Your Order
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('account', 'orders')} className="hover:text-white transition-colors">
                  Order History & Receipt
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
                  Craftsmanship & Heritage
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">
                  Contact Support
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter / Drop Alerts */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-white">
              Exclusive Drops
            </h4>
            <p className="text-xs text-stone-400">
              Subscribe to get secret access to limited-edition colourways and restock notices.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-white/10 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#FF6B35]"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-2.5 rounded-lg skeuo-btn-primary flex items-center justify-center text-white"
                  aria-label="Submit newsletter"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {subscribed && (
                <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> You're on the VIP drop list!
                </p>
              )}
            </form>
          </div>

        </div>

        {/* Bottom Bar: Payments & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          
          <div className="flex items-center gap-3">
            <span>Payment Options:</span>
            <span className="px-2.5 py-1 rounded-md bg-stone-900 text-stone-300 font-bold border border-white/5">
              bKash Send Money
            </span>
            <span className="px-2.5 py-1 rounded-md bg-stone-900 text-stone-300 font-bold border border-white/5">
              Nagad Send Money
            </span>
            <span className="px-2.5 py-1 rounded-md bg-stone-900 text-stone-300 font-bold border border-white/5">
              Cash on Delivery (COD)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>© 2026 KICKS. All rights reserved. Genuine Footwear.</span>
          </div>

        </div>

      </div>
    </footer>
  );
};
