import React from 'react';
import { CHARACTERS } from '../constants';
import { Character, CharacterId } from '../types';
import { ChevronRight, Star } from 'lucide-react';

interface CharacterSelectorProps {
  onSelect: (character: Character) => void;
}

const CharacterSelector: React.FC<CharacterSelectorProps> = ({ onSelect }) => {
  const characters = Object.values(CHARACTERS);

  return (
    <div className="relative z-10 px-4 pb-20 max-w-6xl mx-auto">
      <h2 className="font-magic text-4xl text-center text-yellow-100 mb-12 drop-shadow-md">
        Elige tu Compañía Mágica
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {characters.map((char) => (
          <div 
            key={char.id}
            onClick={() => onSelect(char)}
            className={`
              relative group cursor-pointer overflow-hidden rounded-2xl 
              bg-slate-900/60 backdrop-blur-md border border-slate-500 
              hover:border-yellow-400 transition-all duration-300 
              transform hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(255,215,0,0.25)]
            `}
          >
            {/* Card Background Gradient Overlay */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br ${char.id === CharacterId.SANTA ? 'from-red-600 to-yellow-500' : 'from-purple-600 to-blue-500'}`} />

            <div className="p-8 flex flex-col items-center text-center h-full relative z-10">
              
              {/* Avatar Circle */}
              <div className={`
                w-32 h-32 rounded-full mb-6 p-1 bg-gradient-to-br from-yellow-300 to-yellow-600 shadow-lg
                group-hover:scale-105 transition-transform duration-300
              `}>
                <div className={`w-full h-full rounded-full overflow-hidden bg-slate-900 flex items-center justify-center`}>
                    {/* Placeholder visuals using text/icons since we use picsum and want specific themes */}
                    {char.id === CharacterId.SANTA ? (
                        <div className="text-6xl">🎅</div>
                    ) : (
                        <div className="text-6xl">👑</div>
                    )}
                </div>
              </div>

              <h3 className="font-magic text-3xl text-yellow-300 mb-2">{char.name}</h3>
              <p className="text-slate-300 text-sm uppercase tracking-widest font-bold mb-4">{char.title}</p>
              <p className="font-body text-slate-100 mb-8 leading-relaxed">
                {char.description}
              </p>

              <div className="mt-auto">
                <span className="inline-flex items-center text-yellow-400 font-bold group-hover:translate-x-2 transition-transform duration-300">
                  Comenzar experiencia <ChevronRight className="ml-1 w-5 h-5" />
                </span>
              </div>
            </div>
            
            {/* Decorative Stars */}
            <Star className="absolute top-4 right-4 text-yellow-500/30 w-6 h-6" />
            <Star className="absolute bottom-4 left-4 text-yellow-500/30 w-4 h-4" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CharacterSelector;