import React from 'react';
import { Sparkles } from 'lucide-react';

const WelcomeHero: React.FC = () => {
  return (
    <div className="relative z-10 text-center px-4 pt-20 pb-10 max-w-4xl mx-auto">
      <div className="mb-6 flex justify-center animate-float">
         <Sparkles className="w-16 h-16 text-yellow-400 opacity-80" />
      </div>
      
      <h1 className="font-magic text-6xl md:text-8xl text-white drop-shadow-[0_0_15px_rgba(255,215,0,0.5)] mb-6">
        Navidad Mágica
      </h1>
      
      <p className="font-body text-xl md:text-2xl text-slate-100 mb-10 leading-relaxed max-w-2xl mx-auto drop-shadow-lg">
        Te invitamos a unirte a una experiencia mágica interactuando con Santa Claus y los Reyes Magos.
        Descubre la alegría del Polo Norte y la sabiduría de Oriente en esta Navidad.
      </p>
    </div>
  );
};

export default WelcomeHero;