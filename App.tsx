import React, { useState } from 'react';
import Snowfall from './components/Snowfall';
import WelcomeHero from './components/WelcomeHero';
import CharacterSelector from './components/CharacterSelector';
import MagicChat from './components/MagicChat';
import { Character, ViewState } from './types';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>('LANDING');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  const handleCharacterSelect = (char: Character) => {
    setSelectedCharacter(char);
    setViewState('CHAT');
  };

  const handleBack = () => {
    setViewState('LANDING');
    setSelectedCharacter(null);
  };

  return (
    <div className="min-h-screen w-full text-white overflow-x-hidden relative">
      
      {/* Fixed Background Image for Landing State */}
      {viewState === 'LANDING' && (
        <div className="fixed inset-0 z-0">
           <img 
              src="https://images.unsplash.com/photo-1576692131269-66987555cf25?q=80&w=3000&auto=format&fit=crop" 
              alt="Christmas Background" 
              className="w-full h-full object-cover"
           />
           <div className="absolute inset-0 bg-slate-900/70"></div>
        </div>
      )}

      <Snowfall />
      
      {viewState === 'LANDING' && (
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Main Welcome Section */}
          <div className="flex flex-col items-center justify-center pt-10 pb-6">
            <WelcomeHero />
          </div>

          {/* Video Section */}
          <div className="flex justify-center px-4 pb-10 w-full z-10 relative">
            <div className="w-full max-w-3xl aspect-video rounded-xl overflow-hidden shadow-2xl border-4 border-white/20 bg-black/50">
               <iframe 
                 src="https://drive.google.com/file/d/16P0nBrYTeskExAPuM0f-u3lbFIMREZpy/preview" 
                 className="w-full h-full" 
                 allow="autoplay; encrypted-media"
                 title="Mensaje Navideño"
               />
            </div>
          </div>

          {/* Character Selection Section */}
          <div 
            id="character-selector"
            className="flex-1 flex flex-col justify-center py-10"
          >
            <CharacterSelector onSelect={handleCharacterSelect} />
          </div>
          
          {/* Footer */}
          <footer className="py-8 text-center text-slate-400 font-body text-sm relative z-10">
            <p>&copy; {new Date().getFullYear()} Navidad Mágica. Desarrollado con amor y magia.</p>
          </footer>
        </div>
      )}

      {viewState === 'CHAT' && selectedCharacter && (
        <MagicChat 
          character={selectedCharacter} 
          onBack={handleBack} 
        />
      )}
    </div>
  );
};

export default App;