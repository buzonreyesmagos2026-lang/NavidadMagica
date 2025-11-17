import React from 'react';
import { Character, CharacterId } from '../types';
import { Mail, Star, Home, Gift } from 'lucide-react';

interface SuccessCardProps {
  character: Character;
  userData: any;
  onHome: () => void;
}

const SuccessCard: React.FC<SuccessCardProps> = ({ character, userData, onHome }) => {
  // Extract children names for a personalized message
  const childrenNames = userData?.children 
    ? userData.children.map((c: any) => c.name).join(' y ')
    : 'pequeños';

  const isSanta = character.id === CharacterId.SANTA;

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative z-10`}>
      <div className="w-full max-w-2xl bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_0_50px_rgba(234,179,8,0.2)] overflow-hidden relative">
        
        {/* Decorative Background Elements */}
        <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${character.colors.primary} to-yellow-500`}></div>
        <Star className="absolute top-6 right-6 text-yellow-400 w-8 h-8 animate-twinkle" />
        <Star className="absolute bottom-8 left-8 text-yellow-400/50 w-6 h-6 animate-pulse" />

        <div className="p-8 md:p-12 text-center flex flex-col items-center">
          
          {/* Icon / Avatar */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-20 rounded-full"></div>
            <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full border-2 border-yellow-400/50 flex items-center justify-center relative z-10 shadow-xl">
                <span className="text-5xl">{isSanta ? '🎅' : '👑'}</span>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-red-600 text-white p-2 rounded-full border border-slate-900">
                <Mail className="w-5 h-5" />
            </div>
          </div>

          <h2 className="font-magic text-4xl md:text-5xl text-yellow-300 mb-6 drop-shadow-md">
            ¡Registro Mágico Exitoso!
          </h2>

          <div className="space-y-6 max-w-lg">
            <p className="font-body text-xl text-white leading-relaxed">
              ¡Hola <span className="text-yellow-300 font-bold">{childrenNames}</span>!
            </p>

            <p className="font-body text-lg text-slate-200 leading-relaxed">
              Muchas gracias por unirse a esta aventura. {character.name} ha recibido sus datos en el {isSanta ? 'Polo Norte' : 'Lejano Oriente'}.
            </p>
            
            <div className="bg-white/10 border border-white/10 p-6 rounded-xl my-6">
              <div className="flex items-start gap-4 text-left">
                <div className="bg-yellow-400/20 p-2 rounded-lg">
                    <Gift className="w-6 h-6 text-yellow-300" />
                </div>
                <div>
                    <h3 className="font-bold text-yellow-200 mb-1">Siguiente paso importante</h3>
                    <p className="text-sm text-slate-300">
                      Díganle a papá o mamá que revisen su correo electrónico. Les hemos enviado unas instrucciones secretas y mágicas para continuar con esta experiencia.
                    </p>
                </div>
              </div>
            </div>

            <p className="font-magic text-2xl text-white/80 mt-8">
              ¡Feliz Navidad y próspero Año Nuevo!
            </p>
          </div>

          <button 
            onClick={onHome}
            className="mt-10 px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-full text-white font-body flex items-center gap-2 transition-all hover:scale-105"
          >
            <Home className="w-5 h-5" />
            Volver al Inicio
          </button>

        </div>
      </div>
    </div>
  );
};

export default SuccessCard;