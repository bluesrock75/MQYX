import { GoogleGenAI } from "@google/genai";
import { GameMode } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateGameOverMessage = async (score: number, mode: GameMode = GameMode.CLASSIC): Promise<string> => {
  const ai = getClient();
  if (!ai) return `Great job! You scored ${score} points!`;

  try {
    let prompt = "";
    if (mode === GameMode.SHOOTER) {
        prompt = `The player just finished a game called "Cash Hunter" where they shoot red dots (innovation) at falling money (USD/RMB). They scored ${score} points (capturing capital).
        
        Generate a short, witty, 1-sentence corporate-themed congratulation or consolation message.
        Focus on "revenue streams", "capturing market share", "liquidity events", "ROI", or "cash flow".
        
        If score < 100, make a joke about bankruptcy or budget cuts.
        If score > 500, make a joke about IPOs or hostile takeovers.`;
    } else if (mode === GameMode.MONEY_RAIN) {
        prompt = `The player just finished a 1-minute time-attack game called "Capital Rain" where they caught falling money with a bucket. They collected $${score}.
        
        Generate a short, witty, 1-sentence corporate-themed message about end-of-year bonuses, fiscal year targets, or greedy executive behavior.
        
        If score < 200, joke about the company not meeting projections or no holiday bonus.
        If score > 1000, joke about golden parachutes, embezzlement, or buying a yacht.`;
    } else {
        prompt = `The player just finished a game called "Synergy Bounce" where they bounce a red dot using the company logo. They scored ${score} points. 
      
        Generate a short, witty, 1-sentence corporate-themed congratulation or consolation message. 
        Use buzzwords like "synergy", "Q4 goals", "touch base", "low hanging fruit", "circle back", or "paradigm shift" humorously.
        
        If the score is low (<10), make a joke about needing more coffee or a performance review.
        If the score is high (>50), make a joke about a promotion or working overtime.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || `Game Over! Score: ${score}`;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Project Terminated. Final Score: ${score}`;
  }
};