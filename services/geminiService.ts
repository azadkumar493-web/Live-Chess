
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeBoard = async (fen: string, history: string[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a Grandmaster Chess Analyst. Analyze this FEN state: "${fen}". 
      Recent move history: ${history.slice(-5).join(', ')}.
      Provide a brief (max 2 sentences) commentary on the position and who has the advantage.`,
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "The position is complex. Focus on controlling the center.";
  }
};

export const generateSpectatorChat = async (fen: string, lastMove: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The last move in a live chess match was ${lastMove}. FEN: ${fen}.
      Generate a short, enthusiastic chat message from a viewer (e.g., "Incredible find!", "I didn't see that coming!", "Blunder?").
      Keep it under 10 words.`,
      config: { temperature: 1.0 }
    });
    return response.text;
  } catch {
    return "Nice move!";
  }
};

export const getBestMove = async (fen: string, personality: string = "Balanced") => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `You are an elite grandmaster chess engine with a ${personality} personality. The current FEN position is: "${fen}".
      
      Your task:
      1. Identify the absolute best legal move.
      2. Provide a deep analytical explanation covering three key pillars:
         - Tactical considerations (e.g., discovered attacks, pins, forks, sacrifices).
         - Positional advantages (e.g., controlling the center, piece coordination, pawn structure improvements).
         - Potential threats (e.g., defending a weakness or creating an unstoppable threat for the opponent).
      
      Return the analysis in strict JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            move: {
              type: Type.STRING,
              description: 'The move in UCI format (e.g., "e2e4", "g1f3")'
            },
            explanation: {
              type: Type.STRING,
              description: 'A comprehensive grandmaster-level explanation detailing tactics, position, and threats (2-4 sentences).'
            },
            eval: {
              type: Type.NUMBER,
              description: 'Centipawn evaluation (positive for white, negative for black)'
            }
          },
          required: ['move', 'explanation']
        }
      }
    });
    
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Move Error:", error);
    return null;
  }
};

export const analyzeOpponentStrategy = async (fen: string, lastMove: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `As a Grandmaster coach, analyze the opponent's last move: "${lastMove}". 
      Current FEN: "${fen}".
      
      Identify:
      1. Their likely strategic goal (e.g., attacking the kingside, preparing a breakthrough).
      2. The primary threat they just created.
      3. A recommended counter-measure.
      
      Return as a concise JSON object.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strategy: { type: Type.STRING, description: 'Summary of the opponent\'s strategy.' },
            threatLevel: { type: Type.STRING, description: 'Low, Medium, High, or Critical.' },
            threatDescription: { type: Type.STRING, description: 'Description of the immediate threat.' },
            recommendation: { type: Type.STRING, description: 'A suggested response.' }
          },
          required: ['strategy', 'threatLevel', 'threatDescription', 'recommendation']
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Opponent Strategy Analysis Error:", error);
    return null;
  }
};
