import React from 'react';
import { Award, Layers, Shield, ArrowRight } from 'lucide-react';

interface AboutViewProps {
  onExplore: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onExplore }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Hero statement */}
      <div className="max-w-3xl space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B35]">
          The KICKS Manifesto
        </span>
        <h1 className="font-display font-black text-4xl sm:text-5xl text-stone-900 leading-tight">
          ARCHITECTURAL PRECISION. <br />
          AUTHENTIC CULTURE.
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          Founded in 2026, KICKS was born from a singular obsession: to eliminate the compromises in high-tier footwear. We pair world-class nitrogen cushioning with full-grain leathers and hand-burnished finishing.
        </p>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="rounded-3xl skeuo-card p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl skeuo-inset flex items-center justify-center text-[#FF6B35]">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-lg text-stone-900">
            Material Sourcing
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            We partner directly with certified tanneries and high-density technical textile mills to engineer tear-resistant engineered meshes and buttery full-grain calfskins.
          </p>
        </div>

        <div className="rounded-3xl skeuo-card p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl skeuo-inset flex items-center justify-center text-[#FF6B35]">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-lg text-stone-900">
            Nitrogen Energy Foam
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Every racing silhouette in our catalog utilizes autoclaved supercritical nitrogen foam that returns up to 88% kinetic energy on every footstrike.
          </p>
        </div>

        <div className="rounded-3xl skeuo-card p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl skeuo-inset flex items-center justify-center text-[#FF6B35]">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-lg text-stone-900">
            Seamless Continuity
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Your shopping bag, orders, and size reservations are continuously synchronized across your mobile phone, tablet, and desktop for an effortless experience.
          </p>
        </div>

      </div>

      {/* Craft banner */}
      <div className="rounded-3xl skeuo-surface-dark p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl space-y-3">
          <h2 className="font-display font-bold text-2xl sm:text-3xl">
            Experience the Evolution of Footwear
          </h2>
          <p className="text-xs sm:text-sm text-stone-300">
            Browse our latest sneaker releases and join hundreds of satisfied athletes and streetwear enthusiasts nationwide.
          </p>
        </div>

        <button
          onClick={onExplore}
          className="px-6 py-3.5 rounded-2xl skeuo-btn-primary font-display font-bold text-xs uppercase tracking-wider shadow-xl flex items-center gap-2 shrink-0"
        >
          Explore Catalog
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
