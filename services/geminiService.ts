import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Character } from "../types";

// Initialize Gemini Client
// IMPORTANT: Ensure process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const createChatSession = (character: Character): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: character.systemInstruction,
      temperature: 0.8, // Creative and warm
      maxOutputTokens: 500,
    },
  });
};

export const sendMessageToGemini = async (
  chat: Chat, 
  message: string
): Promise<AsyncIterable<GenerateContentResponse>> => {
  try {
    // Return the stream directly
    return await chat.sendMessageStream({ message });
  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    throw error;
  }
};