
import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, LogIn, Loader2, AlertCircle } from 'lucide-react';
import { N8N_LOGIN_WEBHOOK_URL, N8N_LOGIN_WEBHOOK_FALLBACK_URL } from '../constants';

interface LoginFormProps {
  onLogin: (response: any) => void;
  onBack: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onBack }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error cuando el usuario escribe
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Limpieza de datos para móviles (espacios y minúsculas)
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanPassword = formData.password.trim();

    // Función auxiliar para intentar loguearse en una URL específica
    const performLoginRequest = async (url: string) => {
        // CONFIGURACIÓN MÁXIMA COMPATIBILIDAD MÓVIL Y EDGE:
        // mode: 'cors', credentials: 'omit' -> Estándar para cross-origin
        // cache: 'no-store' -> Evita que iOS use respuestas cacheadas erróneas
        // referrerPolicy: 'no-referrer' -> Privacidad y evita bloqueos de headers largos
        // Content-Type: 'text/plain' -> Evita Preflight (OPTIONS) en la mayoría de casos
        // Accept: '*/*' -> Satisface a Edge/Chrome que requieren este header explícito
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
            body: JSON.stringify({
                email: cleanEmail,
                password: cleanPassword
            })
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            throw new Error(`Error del servidor (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        
        // Validar estructura esperada
        if (data.Login !== 'ok') {
            throw new Error(data.message || "Credenciales incorrectas o cuenta no encontrada.");
        }

        return data;
    };

    try {
      // INTENTO 1: URL Principal
      const data = await performLoginRequest(N8N_LOGIN_WEBHOOK_URL);
      onLogin(data);

    } catch (primaryError: any) {
      console.warn("Error en el webhook principal de login, intentando ruta alternativa...", primaryError);
      
      try {
        // INTENTO 2: URL de Respaldo (Test)
        if (N8N_LOGIN_WEBHOOK_FALLBACK_URL) {
            const data = await performLoginRequest(N8N_LOGIN_WEBHOOK_FALLBACK_URL);
            onLogin(data);
        } else {
            throw primaryError;
        }
      } catch (secondaryError: any) {
        console.error("Error final en login:", secondaryError);
        
        let errorMsg = secondaryError.message;
        // Si el mensaje es genérico de red, damos consejos útiles
        if (errorMsg && (errorMsg.includes('Failed to fetch') || errorMsg.includes('Network request failed') || errorMsg.includes('Load failed'))) {
             errorMsg = "Error de conexión. Por favor verifica tu internet o intenta usar Datos Móviles.";
        } else if (errorMsg.includes('JSON')) {
             errorMsg = "El servidor mágico tuvo un error interno. Intenta más tarde.";
        }
        
        // ALERTA PARA MÓVILES: Mostramos el error real para que el usuario sepa qué pasa
        window.alert(`Atención: ${errorMsg}`);
        
        setError(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 text-center bg-gradient-to-r from-slate-800 to-slate-900 flex-shrink-0 relative border-b border-white/10">
          <button 
            onClick={onBack}
            className="absolute top-4 left-4 text-white/70 hover:text-white transition-colors z-20"
            disabled={isSubmitting}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="font-magic text-3xl text-yellow-300 drop-shadow-md mb-2">
            Bienvenido de nuevo
          </h2>
          <p className="text-white/80 text-sm font-body">
            Ingresa tus datos para acceder a tus actividades mágicas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
            
            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-yellow-400 font-bold ml-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-white/40" />
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="tu@correo.com"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/30 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none transition-all disabled:opacity-50"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  inputMode="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-yellow-400 font-bold ml-1">Clave de Acceso</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-white/40" />
                <input
                  required
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/30 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Error Message Display */}
            {error && (
              <div className="flex items-start gap-3 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm animate-pulse">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                w-full font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] 
                flex items-center justify-center gap-2 mt-4 transition-all transform
                ${isSubmitting 
                    ? 'bg-slate-700 cursor-not-allowed text-white/50' 
                    : 'bg-white text-slate-900 hover:bg-yellow-300 hover:shadow-[0_0_30px_rgba(253,224,71,0.4)] hover:-translate-y-1'
                }
              `}
            >
              {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verificando...
                  </>
              ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Ingresar a la Magia
                  </>
              )}
            </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
