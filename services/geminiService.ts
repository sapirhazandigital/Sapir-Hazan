
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSmartCategorization = async (itemName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `קטלג את המוצר הבא לקטגוריה אחת קצרה (למשל: מוצרי חלב, ירקות, ניקיון, בשר): ${itemName}`,
      config: {
        maxOutputTokens: 50,
        thinkingConfig: { thinkingBudget: 0 },
        temperature: 0.1
      }
    });
    return response.text?.trim() || "כללי";
  } catch (error) {
    console.error("Gemini classification failed", error);
    return "כללי";
  }
};

export const identifyProductByBarcode = async (barcode: string): Promise<{name: string, category: string}> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `זהה את המוצר הישראלי לפי הברקוד הבא: ${barcode}. החזר תשובה בפורמט JSON בלבד: {"name": "שם המוצר", "category": "קטגוריה"}. אם אינך מזהה, המצא שם גנרי מתאים לקטגוריה סבירה.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            category: { type: Type.STRING }
          },
          required: ["name", "category"]
        }
      }
    });
    const result = JSON.parse(response.text || '{"name": "מוצר לא מזוהה", "category": "כללי"}');
    return result;
  } catch (error) {
    console.error("Gemini barcode identification failed", error);
    return { name: `ברקוד ${barcode}`, category: "כללי" };
  }
};

export const getShoppingInsights = async (history: any[]): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `נתח את רשימת הקניות החודשית הזו ותן 3 המלצות לחיסכון או ייעול בעברית. היסטוריה: ${JSON.stringify(history)}`,
    });
    return response.text || "אין מספיק נתונים להפקת תובנות.";
  } catch (error) {
    return "שגיאה בניתוח הנתונים.";
  }
};
