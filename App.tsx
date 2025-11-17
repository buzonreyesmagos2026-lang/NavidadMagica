
import React, { useState, useRef } from 'react';
import Snowfall from './components/Snowfall';
import WelcomeHero from './components/WelcomeHero';
import CharacterSelector from './components/CharacterSelector';
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import SuccessCard from './components/SuccessCard';
import UserDashboard from './components/UserDashboard';
import { CHARACTERS } from './constants';
import { Character, ViewState, CharacterId } from './types';
import { X, CalendarClock, UserCircle, Volume2, VolumeX } from 'lucide-react';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>('LANDING');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [showReyesModal, setShowReyesModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [userPackage, setUserPackage] = useState<string>("1");

  // Video state
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleCharacterSelect = (char: Character) => {
    if (char.id === CharacterId.REYES) {
      setShowReyesModal(true);
      return;
    }
    
    setSelectedCharacter(char);
    
    if (isLoggedIn) {
      setViewState('SUCCESS');
    } else {
      setViewState('REGISTER');
    }
  };

  const handleRegistrationComplete = (formData: any) => {
    console.log("User registered:", formData);
    setUserData(formData);
    // No logueamos automáticamente (setIsLoggedIn(true) eliminado) para requerir login manual
    setViewState('SUCCESS');
  };

  const handleLoginComplete = (data: any) => {
    console.log("User logged in:", data);
    
    // Parse experience from login response
    // Response format: { "Login": "ok", "experiencia": "santa" | "reyes", "paquete": "0" | "1" | "2" | "3", "mail": "...", "nombre": "...", "id_padre": "..." }
    
    // Ensure we handle empty string or null for experience gracefully
    const experienceId = (data.experiencia && data.experiencia.toLowerCase() === 'reyes') ? CharacterId.REYES : CharacterId.SANTA;
    const character = CHARACTERS[experienceId];
    
    setSelectedCharacter(character);
    setUserPackage(data.paquete || "1");
    setUserData(data);
    setIsLoggedIn(true);
    
    // Redirigir directamente al Dashboard según requerimiento
    setViewState('DASHBOARD');
  };

  const handleBackToLanding = () => {
    setViewState('LANDING');
    setSelectedCharacter(null);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserData(null);
    setUserPackage("1");
    handleBackToLanding();
  }

  const toggleAudio = () => {
    if (videoRef.current) {
      // Toggle the muted property directly on the DOM element for immediate effect
      videoRef.current.muted = !isMuted; 
      // Update React state to reflect the change in UI
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="min-h-screen w-full text-white overflow-x-hidden relative">
      
      {/* Fixed Background Image */}
      <div className="fixed inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1576692131269-66987555cf25?q=80&w=3000&auto=format&fit=crop" 
            alt="Christmas Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/70"></div>
      </div>

      <Snowfall />
      
      {/* LANDING VIEW */}
      {viewState === 'LANDING' && (
        <div className="relative z-10 min-h-screen flex flex-col">
          
          {/* Top Bar / Login Button */}
          <div className="absolute top-0 right-0 p-4 z-50 flex items-center gap-4">
             {isLoggedIn ? (
               <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 cursor-pointer" onClick={() => setViewState('DASHBOARD')}>
                  <UserCircle className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm font-body text-white/90">Ir a mi Panel</span>
               </div>
             ) : (
               <button 
                 onClick={() => setViewState('LOGIN')}
                 className="bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-md text-white px-6 py-2 rounded-full font-body text-sm font-bold transition-all hover:scale-105 shadow-lg"
               >
                 Ya tengo cuenta
               </button>
             )}
          </div>

          {/* Main Welcome Section */}
          <div className="flex flex-col items-center justify-center pt-20 pb-6">
            <WelcomeHero />
          </div>

          {/* Video Section */}
          <div className="flex justify-center px-4 pb-10 w-full z-10 relative">
            {/* max-w-xl hace el video más pequeño sin recortarlo, object-contain asegura el ajuste */}
            <div className="w-full max-w-xl rounded-xl overflow-hidden shadow-2xl border-4 border-white/20 bg-black/50 relative group">
               <video 
                 ref={videoRef}
                 autoPlay 
                 muted={isMuted}
                 loop 
                 playsInline 
                 className="w-full h-auto block object-contain bg-black"
                 poster="https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=1000&q=80"
               >
                 <source src="https://misionnavidadmagica.shop/media/videos/promocional_santa.MP4" type="video/mp4" />
                 Tu navegador no soporta la reproducción de videos.
               </video>
               
               {/* Audio Toggle Button */}
               <button 
                 onClick={toggleAudio}
                 className="absolute bottom-4 right-4 p-3 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm border border-white/10 transition-all hover:scale-110 z-20"
                 title={isMuted ? "Activar sonido" : "Silenciar"}
               >
                 {isMuted ? <VolumeX className="w-6 h-6 text-white/80" /> : <Volume2 className="w-6 h-6 text-yellow-400" />}
               </button>
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
            <p>&copy; {new Date().getFullYear()} MISION MAGIA EN NAVIDAD. Desarrollado con amor y magia.</p>
          </footer>
        </div>
      )}

      {/* REGISTRATION VIEW */}
      {viewState === 'REGISTER' && selectedCharacter && (
        <RegistrationForm 
          character={selectedCharacter}
          onRegister={handleRegistrationComplete}
          onBack={handleBackToLanding}
        />
      )}

      {/* LOGIN VIEW */}
      {viewState === 'LOGIN' && (
        <LoginForm 
          onLogin={handleLoginComplete}
          onBack={handleBackToLanding}
        />
      )}

      {/* SUCCESS CARD VIEW (Only for new registration) */}
      {viewState === 'SUCCESS' && selectedCharacter && (
        <SuccessCard 
          character={selectedCharacter}
          userData={userData}
          onHome={handleBackToLanding}
        />
      )}

      {/* USER DASHBOARD VIEW (Main content after login) */}
      {viewState === 'DASHBOARD' && selectedCharacter && (
        <UserDashboard 
          character={selectedCharacter}
          packageType={userPackage}
          userData={userData}
          onLogout={handleLogout}
        />
      )}

      {/* REYES MAGOS MODAL */}
      {showReyesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowReyesModal(false)} />
          <div className="relative bg-gradient-to-br from-purple-900 to-blue-900 p-8 rounded-2xl max-w-md w-full text-center border border-yellow-500/30 shadow-[0_0_50px_rgba(88,28,135,0.5)]">
            <button 
              onClick={() => setShowReyesModal(false)}
              className="absolute top-3 right-3 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="mb-6 flex justify-center">
               <div className="bg-white/10 p-4 rounded-full">
                 <CalendarClock className="w-12 h-12 text-yellow-300" />
               </div>
            </div>
            
            <h3 className="font-magic text-3xl text-yellow-300 mb-4">
              Próximamente...
            </h3>
            <p className="font-body text-lg text-slate-200 mb-6 leading-relaxed">
              Los Reyes Magos aún están preparando su viaje desde el Oriente. Llegarán el <strong>1 de Diciembre</strong> para escuchar tus deseos.
            </p>
            
            <button 
              onClick={() => setShowReyesModal(false)}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/20 transition-all font-body"
            >
              Volver a esperar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
