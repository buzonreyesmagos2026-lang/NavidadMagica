
import React, { useState } from 'react';
import { Character } from '../types';
import { N8N_WEBHOOK_URL, N8N_WEBHOOK_FALLBACK_URL } from '../constants';
import { ArrowLeft, User, Mail, Phone, Users, Lock, Star, Plus, Trash2, Cake, Loader2, Heart } from 'lucide-react';

interface RegistrationFormProps {
  character: Character;
  onRegister: (formData: any) => void;
  onBack: () => void;
}

interface ChildData {
  id: string;
  name: string;
  age: string;
  gender: string;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ character, onRegister, onBack }) => {
  const [parentName, setParentName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  const [children, setChildren] = useState<ChildData[]>([
    { id: '1', name: '', age: '', gender: '' }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddChild = () => {
    setChildren([...children, { 
      id: Date.now().toString(), 
      name: '', 
      age: '', 
      gender: '' 
    }]);
  };

  const handleRemoveChild = (id: string) => {
    if (children.length > 1) {
      setChildren(children.filter(c => c.id !== id));
    }
  };

  const handleChildChange = (id: string, field: keyof ChildData, value: string) => {
    setChildren(children.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Sanitización de inputs
    const cleanEmail = email.trim().toLowerCase();
    const cleanParentName = parentName.trim();
    const cleanPhone = phone.trim();
    const cleanPassword = password.trim();

    const payload = {
      characterId: character.id,
      parentName: cleanParentName,
      email: cleanEmail,
      phone: cleanPhone,
      password: cleanPassword,
      children,
      timestamp: new Date().toISOString(),
      source: 'web_app'
    };

    // Función auxiliar para intentar enviar a una URL específica
    const sendToWebhook = async (url: string) => {
      // CONFIGURACIÓN MÁXIMA COMPATIBILIDAD MÓVIL Y EDGE
      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-store',
        referrerPolicy: 'no-referrer',
        headers: {
          'Content-Type': 'text/plain',
          'Accept': '*/*'
        },
        body: JSON.stringify(payload)
      });

      // Intentamos leer la respuesta como JSON
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // Si falla el parseo JSON pero fue OK, lanzamos error específico
        if (response.ok) {
            throw new Error("Respuesta ilegible del servidor.");
        }
        throw new Error("Error de comunicación con el servidor mágico.");
      }

      // Validar respuesta esperada
      if (data && data.Resultado === 'ok') {
        return true; // Éxito
      } else {
        const mensajeError = data?.Mensaje || "Hubo un problema al guardar tu registro mágico.";
        throw new Error(mensajeError);
      }
    };

    try {
      // INTENTO 1: URL Principal
      await sendToWebhook(N8N_WEBHOOK_URL);
      onRegister(payload);

    } catch (primaryError: any) {
      console.warn("Error en el webhook principal, intentando ruta alternativa...", primaryError);
      
      try {
        // INTENTO 2: URL de Respaldo (Test)
        if (N8N_WEBHOOK_FALLBACK_URL) {
           await sendToWebhook(N8N_WEBHOOK_FALLBACK_URL);
           onRegister(payload);
        } else {
           throw primaryError;
        }
      } catch (secondaryError: any) {
        console.error("Error final en registro:", secondaryError);
        let errorMsg = secondaryError.message;
        if (errorMsg && (errorMsg.includes('Failed to fetch') || errorMsg.includes('Network request failed') || errorMsg.includes('Load failed'))) {
             errorMsg = "No se pudo conectar. Si usas WiFi, intenta con datos móviles.";
        }
        
        window.alert(`Error al registrar: ${errorMsg}`);
        setError(errorMsg || "Ocurrió un problema inesperado. Por favor intenta nuevamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10 pb-20">
      <div className="w-full max-w-2xl bg-slate-900/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className={`p-6 text-center bg-gradient-to-r ${character.colors.primary} to-slate-900 flex-shrink-0 relative`}>
          <button 
            onClick={onBack}
            className="absolute top-4 left-4 text-white/70 hover:text-white transition-colors z-20"
            disabled={isSubmitting}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="font-magic text-3xl text-yellow-300 drop-shadow-md mb-2">
            Registro Mágico
          </h2>
          <p className="text-white/80 text-sm font-body">
            Para que {character.name} pueda personalizar la experiencia, necesitamos algunos datos de los ayudantes (padres).
          </p>
        </div>

        {/* Scrollable Form Content */}
        <div className="overflow-y-auto p-6 md:p-8 scroll-smooth custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Parent Info Section */}
            <div className="space-y-4">
              <h3 className="flex items-center text-xl font-magic text-yellow-100 border-b border-white/10 pb-2">
                <User className="w-5 h-5 mr-2 text-yellow-400" /> Datos del Adulto
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-yellow-400/80 font-bold ml-1">Nombre Completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-white/40" />
                    <input
                      required
                      type="text"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="Tu nombre"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/30 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-yellow-400/80 font-bold ml-1">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-white/40" />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="correo@ejemplo.com"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/30 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none transition-all"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      inputMode="email"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-yellow-400/80 font-bold ml-1">WhatsApp (Opcional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-white/40" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 234 567 890"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/30 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-yellow-400/80 font-bold ml-1">Crear Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-white/40" />
                    <input
                      required
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Para acceder después"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/30 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Children Info Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h3 className="flex items-center text-xl font-magic text-yellow-100">
                  <Users className="w-5 h-5 mr-2 text-yellow-400" /> Niños / Niñas
                </h3>
                <button
                  type="button"
                  onClick={handleAddChild}
                  className="text-xs bg-yellow-400 text-slate-900 px-3 py-1 rounded-full font-bold hover:bg-yellow-300 flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Agregar otro
                </button>
              </div>

              <div className="space-y-6">
                {children.map((child, index) => (
                  <div key={child.id} className="bg-white/5 p-4 rounded-xl border border-white/10 relative group">
                    {children.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveChild(child.id)}
                        className="absolute top-2 right-2 text-red-400 hover:text-red-300 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                       <div className="md:col-span-2 space-y-1">
                          <label className="text-xs text-white/60 ml-1">Nombre</label>
                          <div className="relative">
                            <Heart className="absolute left-3 top-3 w-4 h-4 text-pink-400" />
                            <input
                              required
                              type="text"
                              value={child.name}
                              onChange={(e) => handleChildChange(child.id, 'name', e.target.value)}
                              placeholder="Nombre del niño/a"
                              className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-white text-sm focus:border-pink-400 focus:ring-1 focus:ring-pink-400 outline-none"
                            />
                          </div>
                       </div>
                       <div className="space-y-1">
                          <label className="text-xs text-white/60 ml-1">Edad</label>
                          <div className="relative">
                            <Cake className="absolute left-3 top-3 w-4 h-4 text-blue-400" />
                            <input
                              required
                              type="number"
                              value={child.age}
                              onChange={(e) => handleChildChange(child.id, 'age', e.target.value)}
                              placeholder="Años"
                              className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-white text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none"
                            />
                          </div>
                       </div>
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-xs text-white/60 ml-1">Género</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
                            <select
                                required
                                value={child.gender}
                                onChange={(e) => handleChildChange(child.id, 'gender', e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-white text-sm focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none appearance-none"
                            >
                                <option value="" disabled className="text-slate-900 bg-slate-200">Seleccionar género</option>
                                <option value="niño" className="text-slate-900 bg-slate-200">Niño</option>
                                <option value="niña" className="text-slate-900 bg-slate-200">Niña</option>
                                <option value="no deseo especificar" className="text-slate-900 bg-slate-200">No deseo especificar</option>
                            </select>
                             {/* Custom chevron arrow for select */}
                             <div className="absolute right-3 top-3 pointer-events-none">
                                <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                             </div>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center animate-pulse font-bold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                w-full font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] 
                flex items-center justify-center gap-2 text-lg transition-all transform
                ${isSubmitting 
                    ? 'bg-slate-700 cursor-not-allowed text-white/50' 
                    : 'bg-white text-slate-900 hover:bg-yellow-300 hover:shadow-[0_0_30px_rgba(253,224,71,0.4)] hover:-translate-y-1'
                }
              `}
            >
              {isSubmitting ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Enviando a {character.id === 'SANTA' ? 'Polo Norte' : 'Oriente'}...
                  </>
              ) : (
                  <>
                    <Star className="w-6 h-6 text-yellow-600" fill="currentColor" />
                    Completar Registro
                  </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
