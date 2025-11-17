import React from 'react';
import { Sparkles } from 'lucide-react';

const WelcomeHero: React.FC = () => {
  return (
    <div className="relative z-10 text-center px-4 pt-20 pb-10 max-w-4xl mx-auto">
      <div className="mb-6 flex justify-center animate-float">
         <Sparkles className="w-16 h-16 text-yellow-400 opacity-80" />
      </div>
      
      <h1 className="font-magic text-6xl md:text-8xl text-yellow-400 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)] mb-6">
        MISION MAGIA EN NAVIDAD
      </h1>
      
      <p className="font-body text-xl md:text-2xl text-sky-300 mb-6 leading-relaxed max-w-2xl mx-auto drop-shadow-lg font-bold">
        Ilusión y magia, una experiencia que dura para siempre
      </p>

      <p className="font-body text-lg md:text-xl text-white mb-10 leading-relaxed max-w-3xl mx-auto drop-shadow-md opacity-90">
        Te invitamos a unirte a una experiencia mágica interactuando con Santa Claus y/o los Reyes Magos. Descubre la alegría del Polo Norte y la sabiduría de Oriente en esta Navidad.
      </p>
    </div>
  );
};

export default WelcomeHero;