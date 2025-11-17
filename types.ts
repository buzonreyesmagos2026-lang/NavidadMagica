
export enum CharacterId {
  SANTA = 'SANTA',
  REYES = 'REYES'
}

export interface Character {
  id: CharacterId;
  name: string;
  title: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    bgGradient: string;
  };
  avatarUrl: string;
  systemInstruction: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export type ViewState = 'LANDING' | 'REGISTER' | 'LOGIN' | 'SUCCESS' | 'DASHBOARD';
