
import { GoogleGenAI } from "@google/genai";
import { LOCAL_BINGO_CALLS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const getBingoCommentary = async (number: number): Promise<string> => {
  // Always have the local fallback ready
  const localCall = LOCAL_BINGO_CALLS[number] || `Number ${number}!`;

  if (!process.env.API_KEY) return localCall;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `The number drawn is ${number}. Give me a short, catchy bingo call (max 8 words). Use the local tradition '${localCall}' as inspiration but make it fresh.`,
      config: {
        systemInstruction: "You are an energetic Bingo caller. Keep it punchy and fun.",
        temperature: 0.8,
      }
    });
    return response.text?.trim() || localCall;
  } catch (error) {
    console.warn("Gemini offline or error, using local call.");
    return localCall;
  }
};

export const getWinCelebration = async (name: string): Promise<string> => {
  const fallback = `BINGO! ${name === 'YOU' ? 'You are' : name + ' is'} the champion!`;
  
  if (!process.env.API_KEY) return fallback;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `${name} just won the game of Bingo! Give a high-energy victory shout!`,
    });
    return response.text?.trim() || fallback;
  } catch {
    return fallback;
  }
};
