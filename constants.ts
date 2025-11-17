
import { Character, CharacterId } from './types';

// URL del Webhook de N8N para REGISTRO
export const N8N_WEBHOOK_URL = 'https://n8n.srv1117067.hstgr.cloud/webhook/e72f6e96-19e5-41ba-bd99-b868cb839ad0';
// URL de Respaldo (Test) para REGISTRO
export const N8N_WEBHOOK_FALLBACK_URL = 'https://n8n.srv1117067.hstgr.cloud/webhook-test/e72f6e96-19e5-41ba-bd99-b868cb839ad0';

// URL del Webhook de N8N para LOGIN
export const N8N_LOGIN_WEBHOOK_URL = 'https://n8n.srv1117067.hstgr.cloud/webhook/2afd283f-c81c-42fa-9ceb-71b41535fe90'; 
// URL de Respaldo (Test) para LOGIN
export const N8N_LOGIN_WEBHOOK_FALLBACK_URL = 'https://n8n.srv1117067.hstgr.cloud/webhook-test/2afd283f-c81c-42fa-9ceb-71b41535fe90';

// URL del Webhook de N8N para REENVIAR CORREO DE PROPUESTAS
export const N8N_RESEND_EMAIL_WEBHOOK_URL = 'https://n8n.srv1117067.hstgr.cloud/webhook/1e505459-0286-4d2a-b92d-7de0e4a6ee60';

// URL del Webhook de N8N para TRACKER (AVANCES)
export const N8N_TRACKER_WEBHOOK_URL = 'https://n8n.srv1117067.hstgr.cloud/webhook/e72f6e96-19e5-41ba-bd99-b868cb839ad1';
// URL de Respaldo para TRACKER
export const N8N_TRACKER_WEBHOOK_FALLBACK_URL = 'https://n8n.srv1117067.hstgr.cloud/webhook-test/e72f6e96-19e5-41ba-bd99-b868cb839ad1';

export const CHARACTERS: Record<CharacterId, Character> = {
  [CharacterId.SANTA]: {
    id: CharacterId.SANTA,
    name: "Santa Claus",
    title: "Papá Noel",
    description: "Habla con Santa sobre tus deseos, cuenta cómo te has portado y siente la alegría del Polo Norte.",
    colors: {
      primary: "bg-red-700",
      secondary: "bg-green-800",
      accent: "text-yellow-300",
      bgGradient: "from-red-900 via-red-800 to-slate-900",
    },
    avatarUrl: "https://picsum.photos/seed/santa123/200/200", // Placeholder, implies Santa
    systemInstruction: `Eres Santa Claus (Papá Noel). 
    Tu tono es extremadamente alegre, cálido, paternal y festivo. Usas frases como "¡Jo jo jo!" y "¡Feliz Navidad!".
    Hablas con niños y adultos con cariño.
    Pregunta si han sido buenos este año.
    Anímales a compartir sus deseos.
    Nunca rompas el personaje. Vives en el Polo Norte con la Sra. Claus y los elfos.
    Responde siempre en Español de manera mágica.`
  },
  [CharacterId.REYES]: {
    id: CharacterId.REYES,
    name: "Los Reyes Magos",
    title: "Melchor, Gaspar y Baltasar",
    description: "Comparte tu sabiduría y tus deseos con los Reyes de Oriente. Una charla llena de historia y magia.",
    colors: {
      primary: "bg-purple-900",
      secondary: "bg-blue-900",
      accent: "text-amber-400",
      bgGradient: "from-indigo-900 via-purple-900 to-slate-900",
    },
    avatarUrl: "https://picsum.photos/seed/reyes123/200/200", // Placeholder
    systemInstruction: `Sois los Tres Reyes Magos de Oriente (Melchor, Gaspar y Baltasar).
    Habláis como una sola entidad colectiva o turnándoos con sabiduría y elegancia antigua pero accesible.
    Vuestro tono es solemne, mágico, sabio y amable.
    Hacéis referencias a vuestro largo viaje siguiendo la estrella, a vuestros camellos y a los regalos: oro, incienso y mirra.
    Valoráis el buen comportamiento, la generosidad y la bondad.
    Responde siempre en Español.`
  }
};
