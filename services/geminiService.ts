
import { GoogleGenAI, Type } from "@google/genai";

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    eventName: { type: Type.STRING, description: "A catchy 2-4 word name for the activity logged." },
    statChanges: {
      type: Type.OBJECT,
      properties: {
        body: { type: Type.INTEGER, description: "Change in Body stat (-5 to 5)" },
        intelligence: { type: Type.INTEGER, description: "Change in Intelligence stat (-5 to 5)" },
        reflexes: { type: Type.INTEGER, description: "Change in Reflexes stat (-5 to 5)" },
        technical: { type: Type.INTEGER, description: "Change in Technical stat (-5 to 5)" },
        cool: { type: Type.INTEGER, description: "Change in Cool stat (-5 to 5)" },
      },
      required: ["body", "intelligence", "reflexes", "technical", "cool"]
    },
    comment: { type: Type.STRING, description: "A short (10-15 words) observation about the event in Traditional Chinese." }
  },
  required: ["eventName", "statChanges", "comment"]
};

export const geminiService = {
  analyzeInput: async (prompt: string, mediaData?: { mimeType: string, data: string }) => {
    // Guidelines: Use process.env.API_KEY directly for initializing GoogleGenAI.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    const systemInstruction = `
      You are a Cyber-Life Quantizer OS. Your task is to analyze user input (text, voice, or images) and quantify it into RPG stats.
      Stats: Body (肉體), Intelligence (智力), Reflexes (反應), Technical (技術), Cool (酷勁).
      Return response in structured JSON.
    `;

    const contents: any[] = [{ text: prompt }];
    if (mediaData) {
      contents.push({
        inlineData: {
          mimeType: mediaData.mimeType,
          data: mediaData.data
        }
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: contents },
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: ANALYSIS_SCHEMA
        }
      });

      // Guidelines: Access the .text property directly, it is not a method.
      if (!response.text) throw new Error("Empty AI response");
      return JSON.parse(response.text);
    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      throw error;
    }
  }
};
