
import React, { useState } from 'react';
import { Character, CharacterId } from '../types';
import { LogOut, Download, FileText, CalendarCheck, Gift, AlertCircle, Mail, Loader2, CheckCircle, User, Sparkles, Star, X, Save, ChevronDown } from 'lucide-react';
import { N8N_RESEND_EMAIL_WEBHOOK_URL, N8N_TRACKER_WEBHOOK_URL, N8N_TRACKER_WEBHOOK_FALLBACK_URL } from '../constants';

interface UserDashboardProps {
  character: Character;
  packageType: string; // "0", "1", "2", or "3"
  userData: any;
  onLogout: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ character, packageType, userData, onLogout }) => {
  
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Tracker Modal State
  const [showTracker, setShowTracker] = useState(false);
  const [trackerLoading, setTrackerLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Nuevo estado para guardado
  const [currentChildForTracker, setCurrentChildForTracker] = useState<string | null>(null);
  const [trackerData, setTrackerData] = useState<any>(null);
  const [trackerError, setTrackerError] = useState<string | null>(null);
  
  // Estado para almacenar los cambios locales antes de guardar
  const [pendingChanges, setPendingChanges] = useState<Record<string, string>>({});

  // Extract user name for personalization (fallback to 'padre/madre' if not available)
  const userName = userData?.nombre || userData?.parentName || "Padre/Madre";
  const parentId = userData?.id_padre || "000"; // Fallback ID if missing

  // Normalizar lista de hijos
  let childrenList: any[] = [];
  if (Array.isArray(userData?.hijos)) {
    childrenList = userData.hijos;
  } else if (Array.isArray(userData?.children)) {
    childrenList = userData.children;
  }
  if (childrenList.length === 0) {
      childrenList = [{ nombre: 'Tu Pequeño/a' }];
  }

  // Configuración de colores basada en el personaje
  const isSanta = character.id === CharacterId.SANTA;
  const themeBg = isSanta ? 'bg-red-600' : 'bg-purple-600';
  const themeGradient = isSanta 
    ? 'from-red-900 via-slate-900 to-slate-900' 
    : 'from-purple-900 via-indigo-900 to-slate-900';

  // Helper to get package name
  const getPackageName = (type: string) => {
    switch (type) {
      case '1': return "Semilla Mágica";
      case '2': return "Camino Mágico";
      case '3': return "Magia Total";
      default: return "Básico";
    }
  };

  // Helper para calcular la semana mágica
  const getMagicWeek = (): string => {
    const now = new Date();
    const month = now.getMonth(); // 0-indexed (10 = Nov, 11 = Dec)
    const day = now.getDate();

    // Noviembre (y anteriores si los hubiera) siempre es semana 1
    if (month < 11 && month > 0) return "1"; // Asumiendo lógica de fin de año (Nov=10)
    if (month === 10) return "1"; 

    // Enero (0) ya pasó la temporada, devolvemos 3 por defecto
    if (month === 0) return "3";

    // Estamos en Diciembre (month === 11)
    if (isSanta) {
        // SANTA:
        // Sem 1: 1-7 Dic
        // Sem 2: 8-14 Dic
        // Sem 3: 15-21+ Dic
        if (day <= 7) return "1";
        if (day <= 14) return "2";
        return "3";
    } else {
        // REYES (Una semana después):
        // Sem 1: 8-14 Dic (y días previos 1-7 también cuentan como 1)
        // Sem 2: 15-21 Dic
        // Sem 3: 22+ Dic
        if (day <= 14) return "1"; // Cubre del 1 al 14
        if (day <= 21) return "2";
        return "3";
    }
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendStatus('idle');
    try {
        // CONFIGURACIÓN MÁXIMA COMPATIBILIDAD MÓVIL Y EDGE
        const response = await fetch(N8N_RESEND_EMAIL_WEBHOOK_URL, {
            method: 'POST',
            mode: 'cors',
            credentials: 'omit',
            cache: 'no-store',
            referrerPolicy: 'no-referrer',
            headers: { 
                'Content-Type': 'text/plain',
                'Accept': '*/*'
            },
            body: JSON.stringify(userData || {})
        });

        if (response.ok) {
            setResendStatus('success');
            setTimeout(() => setResendStatus('idle'), 5000);
        } else {
            setResendStatus('error');
        }
    } catch (error: any) {
        console.error("Error resending email", error);
        window.alert("Error al reenviar correo: " + error.message);
        setResendStatus('error');
    } finally {
        setIsResending(false);
    }
  };

  // Lógica para abrir el Tracker (Tabla de Actividades)
  const handleOpenTracker = async (childName: string) => {
    setCurrentChildForTracker(childName);
    setShowTracker(true);
    setTrackerLoading(true);
    setTrackerError(null);
    setTrackerData(null);
    setPendingChanges({}); // Limpiar cambios pendientes

    const currentWeek = getMagicWeek();
    console.log("Consultando semana:", currentWeek, "para", character.id);

    const payload = { 
        ...userData, 
        nombre_hijo: childName,
        semana: currentWeek 
    };

    const fetchTracker = async (url: string) => {
        // CONFIGURACIÓN MÁXIMA COMPATIBILIDAD MÓVIL Y EDGE
        const res = await fetch(url, {
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
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        return await res.json();
    };

    try {
        // Intentar URL principal
        try {
            const data = await fetchTracker(N8N_TRACKER_WEBHOOK_URL);
            setTrackerData(data);
        } catch (e) {
            console.warn("Primary tracker webhook failed, trying fallback...");
            // Intentar URL respaldo
            const data = await fetchTracker(N8N_TRACKER_WEBHOOK_FALLBACK_URL);
            setTrackerData(data);
        }
    } catch (error: any) {
        console.error("All tracker webhooks failed", error);
        window.alert("No pudimos cargar la tabla: " + error.message);
        setTrackerError("No pudimos cargar el progreso mágico en este momento.");
    } finally {
        setTrackerLoading(false);
    }
  };

  const handleStatusChange = (day: string, rowIndex: number, value: string) => {
    // Construimos la key específica: dia + (indice + 1). Ej: lunes1, lunes2, lunes3
    const cellKey = `${day}${rowIndex + 1}`; 
    setPendingChanges(prev => ({
        ...prev,
        [cellKey]: value
    }));
  };

  const handleSaveChanges = async () => {
    if (Object.keys(pendingChanges).length === 0) return;

    setIsSaving(true);

    const currentWeek = getMagicWeek();

    // Payload includes user credentials, child name, week, and the changes map
    const payload = {
        ...userData,
        nombre_hijo: currentChildForTracker,
        semana: currentWeek,
        cambios: pendingChanges // Enviamos mapa de cambios { "lunes1": "Bien", ... }
    };

    const saveToWebhook = async (url: string) => {
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
        if (!response.ok) throw new Error("Server error");
        // Intentamos parsear JSON por si el servidor responde algo útil
        const text = await response.text();
        try { return JSON.parse(text); } catch { return {}; }
    };

    try {
        try {
            await saveToWebhook(N8N_TRACKER_WEBHOOK_URL);
        } catch (e) {
            console.warn("Primary save failed, trying fallback...");
            if (N8N_TRACKER_WEBHOOK_FALLBACK_URL) {
                await saveToWebhook(N8N_TRACKER_WEBHOOK_FALLBACK_URL);
            } else {
                throw e;
            }
        }

        // Éxito
        alert("¡Avances mágicos guardados con éxito!");
        setShowTracker(false);
        setPendingChanges({});
        
    } catch (error: any) {
        console.error("Error saving progress", error);
        alert("Hubo un problema al guardar: " + error.message);
    } finally {
        setIsSaving(false);
    }
  };

  const renderTrackerModal = () => {
    if (!showTracker) return null;

    const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    // Indices de las 3 filas posibles
    const activityRowIndices = [0, 1, 2]; 

    // Transformar el array de avances en un objeto de acceso rápido aplanado
    // Entrada esperada: [{ "lunes1": "excelente", "lunes2": "bien" }, { "martes1": "..." }]
    const advancesMap: Record<string, string> = {};
    if (trackerData?.avances && Array.isArray(trackerData.avances)) {
        trackerData.avances.forEach((item: any) => {
            // Iteramos sobre todas las keys del objeto (ej: lunes1, lunes2)
            Object.keys(item).forEach(key => {
                if (item[key]) {
                    advancesMap[key.toLowerCase()] = item[key];
                }
            });
        });
    }

    const getStatusColor = (status: string | undefined) => {
        if (!status) return 'bg-white/5 text-white';
        const s = status.toLowerCase();
        if (s.includes('excelente')) return 'bg-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.5)]';
        if (s.includes('bien')) return 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]';
        if (s.includes('regular')) return 'bg-yellow-500 text-slate-900 shadow-[0_0_10px_rgba(234,179,8,0.5)]';
        if (s.includes('mejorar')) return 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]';
        return 'bg-white/20 text-white';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowTracker(false)} />
            <div className="relative bg-slate-900 border border-yellow-500/30 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                
                {/* Header Modal */}
                <div className="p-4 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-white/10 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-spin-slow" />
                        <h3 className="font-magic text-2xl text-yellow-300">
                            Avances de {currentChildForTracker} (Semana {getMagicWeek()})
                        </h3>
                    </div>
                    <button onClick={() => setShowTracker(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-6 h-6 text-white/70" />
                    </button>
                </div>

                {/* Content Modal */}
                <div className="p-4 md:p-6 overflow-auto custom-scrollbar flex-1">
                    {trackerLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <Loader2 className="w-12 h-12 text-yellow-400 animate-spin" />
                            <p className="text-white/60 animate-pulse">Consultando el libro de los buenos niños...</p>
                        </div>
                    ) : trackerError ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                            <AlertCircle className="w-12 h-12 text-red-400" />
                            <p className="text-red-300">{trackerError}</p>
                        </div>
                    ) : (
                        <div className="min-w-[800px]"> {/* Scroll horizontal forzoso en móviles pequeños */}
                            <div className="grid grid-cols-8 gap-2 mb-2">
                                <div className="col-span-1 font-bold text-yellow-400 text-center p-2 text-sm uppercase tracking-wider">Actividad</div>
                                {days.map(day => (
                                    <div key={day} className="col-span-1 font-bold text-white/70 text-center capitalize p-2 bg-white/5 rounded-t-lg text-sm">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2">
                                {activityRowIndices.map((rowIndex) => {
                                    // Obtener el ID real de la actividad desde la respuesta del Webhook
                                    const activityId = trackerData?.actividades?.[rowIndex] || "0";
                                    const isActivityZero = String(activityId) === "0";

                                    return (
                                        <div key={rowIndex} className="grid grid-cols-8 gap-2 items-stretch bg-white/5 p-2 rounded-lg hover:bg-white/10 transition-colors">
                                            {/* Columna Imagen Actividad */}
                                            <div className="col-span-1 flex justify-center items-center bg-white/10 rounded-lg p-2 min-h-[80px] relative">
                                                {isActivityZero ? (
                                                    <div className="text-center">
                                                        <span className="text-[10px] uppercase text-white/40 font-bold block">No asignada</span>
                                                    </div>
                                                ) : (
                                                    <img 
                                                        src={`https://misionnavidadmagica.shop/media/images/actividad${activityId}.png`} 
                                                        alt={`Actividad ${activityId}`}
                                                        className="max-w-full max-h-20 object-contain drop-shadow-md"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                        }}
                                                    />
                                                )}
                                            </div>

                                            {/* Columnas Días */}
                                            {days.map(day => {
                                                // Construir la clave única: dia + numero (ej: lunes1, lunes2, lunes3)
                                                const cellKey = `${day}${rowIndex + 1}`;

                                                // 1. Check API data first using the specific cell key
                                                const apiStatus = advancesMap[cellKey];
                                                // 2. Check local pending changes
                                                const pendingStatus = pendingChanges[cellKey];
                                                // 3. Determine final value to show
                                                const finalStatus = pendingStatus || apiStatus || "";
                                                
                                                // Si hay un status real desde la API, es modo lectura.
                                                // Si no (string vacío o null), es modo edición.
                                                const isReadOnly = !!apiStatus && apiStatus.trim() !== "";

                                                // Si la actividad es 0, siempre mostrar guión
                                                if (isActivityZero) {
                                                    return (
                                                        <div key={`${rowIndex}-${day}`} className="col-span-1 flex items-center justify-center h-full bg-white/5 rounded-md">
                                                             <span className="text-white/20">-</span>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <div key={`${rowIndex}-${day}`} className="col-span-1 h-full flex items-center justify-center">
                                                        {isReadOnly ? (
                                                            <div className={`w-full h-full min-h-[3rem] flex items-center justify-center rounded-md text-xs md:text-sm font-bold uppercase text-center p-1 transition-all border border-white/5 ${getStatusColor(finalStatus)}`}>
                                                                {finalStatus}
                                                            </div>
                                                        ) : (
                                                            <div className="relative w-full h-full group">
                                                                <select 
                                                                    value={finalStatus}
                                                                    onChange={(e) => handleStatusChange(day, rowIndex, e.target.value)}
                                                                    className={`
                                                                        w-full h-full min-h-[3rem] appearance-none outline-none rounded-md text-xs font-bold text-center cursor-pointer
                                                                        border border-white/20 hover:border-yellow-400/50 transition-all
                                                                        ${finalStatus ? getStatusColor(finalStatus) : 'bg-black/40 text-white/60 hover:bg-black/60'}
                                                                    `}
                                                                >
                                                                    <option value="" disabled>Seleccionar</option>
                                                                    <option value="Excelente" className="text-black bg-white">Excelente</option>
                                                                    <option value="Bien" className="text-black bg-white">Bien</option>
                                                                    <option value="Regular" className="text-black bg-white">Regular</option>
                                                                    <option value="Podemos mejorar" className="text-black bg-white">Podemos mejorar</option>
                                                                </select>
                                                                {!finalStatus && (
                                                                    <ChevronDown className="absolute right-1 bottom-1 w-3 h-3 text-white/30 pointer-events-none" />
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Footer Modal */}
                <div className="p-4 bg-slate-900 border-t border-white/10 flex justify-between items-center shrink-0">
                    <span className="text-xs text-white/40">
                       {Object.keys(pendingChanges).length > 0 ? "Tienes cambios pendientes por guardar." : "El progreso se actualiza mágicamente cada día."}
                    </span>
                    <button 
                        onClick={handleSaveChanges}
                        disabled={Object.keys(pendingChanges).length === 0 || isSaving}
                        className={`
                            flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm transition-all
                            ${Object.keys(pendingChanges).length > 0 && !isSaving
                                ? 'bg-yellow-400 text-slate-900 hover:bg-yellow-300 hover:scale-105 shadow-[0_0_15px_rgba(250,204,21,0.4)]' 
                                : 'bg-white/10 text-white/30 cursor-not-allowed'
                            }
                        `}
                    >
                        {isSaving ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                        ) : (
                            <><Save className="w-4 h-4" /> Guardar Avances</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
  };

  const renderDownloadsForChild = (childNameRaw: string) => {
    const safeChildName = childNameRaw.trim().replace(/\s+/g, '_');
    const baseUrlCartas = "https://misionnavidadmagica.shop/media/cartas/";
    const baseUrlTableros = "https://misionnavidadmagica.shop/media/tableros/";

    const letterLink = `${baseUrlCartas}${parentId}-carta_${safeChildName}.pdf`;
    const trackerLink = `${baseUrlTableros}${parentId}-tablero_${safeChildName}.pdf`;
    const week1Link = `${baseUrlTableros}${parentId}-tablero_${safeChildName}_sem1.pdf`;
    const week2Link = `${baseUrlTableros}${parentId}-tablero_${safeChildName}_sem2.pdf`;
    const week3Link = `${baseUrlTableros}${parentId}-tablero_${safeChildName}_sem3.pdf`;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        
        {/* CARTA (Todos los paquetes) */}
        <a href={letterLink} target="_blank" rel="noopener noreferrer" className="group relative overflow-hidden bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all hover:scale-[1.02] hover:shadow-lg hover:border-yellow-400/50 flex flex-col h-full min-h-[180px]">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FileText className="w-24 h-24 text-yellow-400" />
          </div>
          <div className="flex items-center gap-4 relative z-10 mb-4">
             <div className={`p-3 rounded-full ${themeBg} text-white shadow-lg`}>
                <Gift className="w-6 h-6" />
             </div>
             <div>
               <h3 className="text-lg font-magic text-yellow-300 mb-0 leading-none">Carta de Deseos</h3>
               <p className="text-xs text-slate-400 font-bold uppercase">Para {childNameRaw}</p>
             </div>
          </div>
          <div className="mt-auto relative z-10">
               <span className="inline-flex items-center text-sm font-bold text-white bg-white/10 px-3 py-2 rounded-full w-full justify-center hover:bg-white/20 transition-colors">
                 <Download className="w-4 h-4 mr-2" /> Descargar PDF
               </span>
          </div>
        </a>

        {/* PAQUETE 2 */}
        {packageType === '2' && (
          <div className="flex flex-col gap-4 h-full">
              {/* Botón Descarga Tablero */}
              <a href={trackerLink} target="_blank" rel="noopener noreferrer" className="group relative overflow-hidden bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all hover:scale-[1.02] hover:shadow-lg hover:border-green-400/50 flex flex-col h-full justify-between">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <CalendarCheck className="w-24 h-24 text-green-400" />
                </div>
                <div className="flex items-center gap-4 relative z-10 mb-4">
                <div className={`p-3 rounded-full bg-green-700 text-white shadow-lg`}>
                    <CalendarCheck className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-lg font-magic text-green-300 mb-0 leading-none">Tablero de Objetivos</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase">Para {childNameRaw}</p>
                </div>
                </div>
                <div className="relative z-10">
                    <span className="inline-flex items-center text-sm font-bold text-white bg-white/10 px-3 py-2 rounded-full w-full justify-center hover:bg-white/20 transition-colors">
                    <Download className="w-4 h-4 mr-2" /> Descargar PDF
                    </span>
                </div>
              </a>
          </div>
        )}

        {/* PAQUETE 3 */}
        {packageType === '3' && (
          <div className="grid grid-cols-1 gap-3">
             {[
                { name: 'Semana 1', link: week1Link },
                { name: 'Semana 2', link: week2Link },
                { name: 'Semana 3', link: week3Link }
             ].map((item, i) => (
                <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-blue-400/50 transition-all">
                   <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-magic text-white">{i+1}</div>
                       <span className="font-magic text-blue-200 text-lg">Objetivos {item.name}</span>
                   </div>
                   <Download className="w-4 h-4 text-white/70" />
                </a>
             ))}
          </div>
        )}

        {/* BOTÓN DE TRACKER (SOLO PAQUETES 2 Y 3) */}
        {(packageType === '2' || packageType === '3') && (
            <div className="md:col-span-2 mt-2">
                <button 
                    onClick={() => handleOpenTracker(childNameRaw)}
                    className="w-full group relative overflow-hidden bg-gradient-to-r from-yellow-600/20 to-yellow-400/10 border border-yellow-500/30 rounded-2xl p-6 hover:bg-yellow-500/20 transition-all hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(250,204,21,0.15)]"
                >
                     <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
                        <div className="flex items-center gap-4 text-left">
                            <div className="p-3 rounded-full bg-yellow-500 text-slate-900 shadow-lg group-hover:rotate-12 transition-transform">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-magic text-yellow-300 leading-none">Registrar / Ver Avances</h3>
                                <p className="text-sm text-slate-300 font-body mt-1">Consulta el comportamiento mágico de la semana.</p>
                            </div>
                        </div>
                        <div className="flex items-center bg-yellow-400 text-slate-900 px-6 py-2 rounded-full font-bold text-sm group-hover:bg-yellow-300 transition-colors">
                            Ver Tabla de Actividades <CalendarCheck className="ml-2 w-4 h-4" />
                        </div>
                     </div>
                </button>
            </div>
        )}

      </div>
    );
  };

  return (
    <div className={`min-h-screen flex flex-col items-center p-4 relative z-10 bg-gradient-to-br ${themeGradient}`}>
      
      {/* Navbar */}
      <div className="w-full max-w-6xl flex justify-between items-center py-6 border-b border-white/10 mb-8">
         <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-white/10 border border-yellow-400`}>
               {isSanta ? '🎅' : '👑'}
            </div>
            <div>
               <h1 className="font-magic text-2xl text-yellow-300 leading-none">Zona Mágica</h1>
               <p className="text-xs text-white/60 uppercase tracking-widest font-bold">Experiencia {character.name}</p>
            </div>
         </div>
         <button 
           onClick={onLogout}
           className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors border border-white/10 text-sm font-bold"
         >
           <LogOut className="w-4 h-4" /> <span className="hidden md:inline">Cerrar Sesión</span>
         </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl flex flex-col items-center text-center pb-20">
        
        <h2 className="font-magic text-4xl md:text-5xl text-white drop-shadow-lg mb-4">
          Bienvenido a tu Panel Mágico, <span className="text-yellow-400">{userName}</span>
        </h2>
        
        {packageType !== '0' ? (
          <p className="font-body text-lg text-slate-200 max-w-2xl mb-8 leading-relaxed">
             {isSanta 
               ? "Desde el Polo Norte hemos preparado materiales especiales para cada uno de tus pequeños. ¡Descárgalos y prepárate para la Navidad!"
               : "La sabiduría de Oriente llega hasta ti. Descarga los materiales para cada niño y prepárate ante la llegada de los Reyes Magos."
             }
          </p>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-white/5 border border-white/10 rounded-3xl max-w-2xl mx-auto shadow-2xl mt-8">
            <div className="bg-yellow-400/20 p-5 rounded-full mb-6 shadow-[0_0_20px_rgba(250,204,21,0.2)] animate-pulse">
                <AlertCircle className="w-12 h-12 text-yellow-400" />
            </div>
            <h3 className="text-3xl font-magic text-yellow-300 mb-6">Aún no tienes un paquete activo</h3>
            <p className="text-slate-200 font-body text-lg leading-relaxed max-w-lg">
                Para disfrutar de la magia y descargar tus materiales, necesitas adquirir uno de nuestros paquetes.
            </p>
            <div className="mt-6 p-6 bg-black/20 rounded-xl border border-white/5 w-full">
                <p className="text-slate-300 font-body mb-6">
                    Por favor, <span className="text-yellow-300 font-bold">ve al correo informativo</span> que te enviamos y adquiere alguna de las opciones disponibles.
                </p>
                <div className="flex flex-col items-center gap-3">
                    <button 
                        onClick={handleResendEmail}
                        disabled={isResending || resendStatus === 'success'}
                        className={`
                            flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm transition-all shadow-lg
                            ${resendStatus === 'success' 
                                ? 'bg-green-600/20 text-green-400 border border-green-500/50 cursor-default' 
                                : 'bg-white text-slate-900 hover:bg-yellow-300 hover:scale-105 border border-white/50'
                            }
                            ${isResending ? 'opacity-70 cursor-wait' : ''}
                        `}
                    >
                        {isResending ? (
                            <> <Loader2 className="w-5 h-5 animate-spin" /> Enviando solicitud... </>
                        ) : resendStatus === 'success' ? (
                            <> <CheckCircle className="w-5 h-5" /> Correo enviado exitosamente </>
                        ) : (
                            <> <Mail className="w-5 h-5" /> Enviar nuevamente correo con propuestas </>
                        )}
                    </button>
                </div>
            </div>
          </div>
        )}

        {/* Grid de Hijos */}
        {packageType !== '0' && (
          <div className="w-full space-y-8">
             <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-yellow-400/20 border border-yellow-400/40 text-yellow-200 font-bold text-lg shadow-[0_0_15px_rgba(250,204,21,0.2)] mb-4">
                 <Sparkles className="w-5 h-5" /> 
                 Nivel {packageType}: {getPackageName(packageType)}
             </div>

             <div className="grid grid-cols-1 gap-8">
                {childrenList.map((child: any, index: number) => {
                    const childName = child?.nombre || child?.name || `Hijo ${index + 1}`;
                    return (
                      <div key={index} className="bg-slate-900/40 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/10 shadow-xl w-full max-w-4xl mx-auto">
                         <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
                             <div className="bg-white/10 p-2 rounded-full">
                                <User className="w-6 h-6 text-yellow-300" />
                             </div>
                             <h3 className="text-2xl font-magic text-white text-left">
                               Materiales para <span className="text-yellow-300">{childName}</span>
                             </h3>
                         </div>
                         {renderDownloadsForChild(childName)}
                      </div>
                    );
                })}
             </div>
          </div>
        )}
      </main>

      <footer className="w-full py-6 text-center text-white/30 text-xs font-body">
        Mision Magia en Navidad &copy; {new Date().getFullYear()}
      </footer>

      {/* Modal renderizado condicionalmente */}
      {renderTrackerModal()}

    </div>
  );
};

export default UserDashboard;
