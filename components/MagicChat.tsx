import React, { useState, useEffect, useRef } from 'react';
import { Character, ChatMessage } from '../types';
import { createChatSession, sendMessageToGemini } from '../services/geminiService';
import { Chat, GenerateContentResponse } from '@google/genai';
import { ArrowLeft, Send, Wand2 } from 'lucide-react';

interface MagicChatProps {
  character: Character;
  onBack: () => void;
}

const MagicChat: React.FC<MagicChatProps> = ({ character, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat session on mount
  useEffect(() => {
    const session = createChatSession(character);
    setChatSession(session);
    
    // Initial greeting simulation (we don't call API for this to save tokens/time, just UI logic)
    const initialGreeting: ChatMessage = {
      id: 'init',
      role: 'model',
      text: character.id === 'SANTA' 
        ? "¡Jo jo jo! ¡Hola! Soy Santa Claus. ¿Cómo te llamas y qué tal te has portado este año?"
        : "Saludos. Hemos viajado desde muy lejos siguiendo la estrella. Cuéntanos, ¿cuáles son tus deseos más nobles?",
      timestamp: new Date()
    };
    setMessages([initialGreeting]);
  }, [character]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !chatSession || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    // Create a placeholder for the model response
    const modelMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: modelMsgId,
      role: 'model',
      text: '',
      timestamp: new Date()
    }]);

    try {
      const resultStream = await sendMessageToGemini(chatSession, userMsg.text);
      
      let fullText = '';
      for await (const chunk of resultStream) {
        const c = chunk as GenerateContentResponse;
        const text = c.text || '';
        fullText += text;
        
        setMessages(prev => prev.map(msg => 
          msg.id === modelMsgId ? { ...msg, text: fullText } : msg
        ));
      }
    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => prev.map(msg => 
        msg.id === modelMsgId ? { ...msg, text: "Lo siento, hubo una pequeña tormenta de nieve en la conexión mágica. ¿Puedes repetirlo?" } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`flex flex-col h-screen w-full bg-gradient-to-br ${character.colors.bgGradient}`}>
      {/* Header */}
      <header className="flex items-center p-4 bg-black/20 backdrop-blur-md border-b border-white/10 z-20">
        <button 
          onClick={onBack}
          className="p-2 rounded-full hover:bg-white/10 text-white transition-colors mr-4"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-3 border border-yellow-400/50">
             <span className="text-2xl">{character.id === 'SANTA' ? '🎅' : '👑'}</span>
          </div>
          <div>
            <h2 className="font-magic text-2xl text-yellow-300 leading-none">{character.name}</h2>
            <p className="text-xs text-white/60 font-body">En línea desde el {character.id === 'SANTA' ? 'Polo Norte' : 'Oriente'}</p>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6 relative z-10 scroll-smooth">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`
                max-w-[85%] md:max-w-[70%] p-4 rounded-2xl shadow-lg backdrop-blur-sm
                font-body text-lg leading-relaxed
                ${msg.role === 'user' 
                  ? 'bg-white/90 text-slate-900 rounded-br-none' 
                  : `${character.colors.primary} text-white border border-white/10 rounded-bl-none`
                }
              `}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <div className="p-4 bg-black/30 backdrop-blur-md z-20">
        <div className="max-w-4xl mx-auto relative flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={isLoading ? "La magia está viajando..." : "Escribe tu mensaje aquí..."}
              disabled={isLoading}
              className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-full py-4 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all font-body"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputText.trim()}
              className={`
                absolute right-2 p-2 rounded-full 
                ${inputText.trim() && !isLoading ? 'bg-yellow-400 text-red-900 hover:scale-105' : 'bg-white/5 text-white/20'}
                transition-all duration-200
              `}
            >
              {isLoading ? <Wand2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
            </button>
        </div>
      </div>
    </div>
  );
};

export default MagicChat;