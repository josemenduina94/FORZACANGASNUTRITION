// services/geminiService.ts
import { GoogleGenAI, Type } from "@google/genai";
import { UserData, NutritionPlan, QuestionnaireData } from "../types";

/**
 * API Key inyectada por Vercel
 */
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) throw new Error("VITE_GEMINI_API_KEY no está definida");

/**
 * Cliente Gemini para navegador
 */
const ai = new GoogleGenAI({ apiKey });

/**
 * Harris-Benedict (Roza & Shizgal, 1984)
 */
export const calculateTDEE = (data: UserData): number => {
  const bmr = data.gender === "masculino"
    ? 88.362 + 13.397 * data.weight + 4.799 * data.height - 5.677 * data.age
    : 447.593 + 9.247 * data.weight + 3.098 * data.height - 4.330 * data.age;

  const maintenance = bmr * data.activityLevel;
  const adjustment = data.goal === "Pérdida de Grasa" ? -500 :
                     data.goal === "Ganancia Muscular" ? 300 : 0;

  return Math.round(maintenance + adjustment);
};

/**
 * Genera un plan nutricional usando Gemini
 */
export const generateNutritionPlan = async (
  userData: UserData,
  healthData: QuestionnaireData
): Promise<NutritionPlan> => {
  const tdee = calculateTDEE(userData);

  const systemInstruction = `
Eres el Nutricionista Jefe de Forza Cangas Nutrition.
REGLA: El total diario DEBE ser exactamente ${tdee} kcal.
Todos los valores deben ser ENTEROS, sin decimales.
`;

  const prompt = `
Genera un plan nutricional para:
- TDEE: ${tdee} kcal
- Objetivo: ${userData.goal}
- Peso: ${userData.weight}kg
- Altura: ${userData.height}cm
- Edad: ${userData.age}
- Comidas: ${userData.mealCount}
- Estrés: ${healthData.stressLevel}
- Sueño: ${healthData.sleepQuality}
`;

  try {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-pro", systemInstruction });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            meals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  macros: {
                    type: Type.OBJECT,
                    properties: {
                      protein: { type: Type.NUMBER },
                      carbs: { type: Type.NUMBER },
                      fats: { type: Type.NUMBER },
                      calories: { type: Type.NUMBER }
                    },
                    required: ["protein","carbs","fats","calories"]
                  }
                },
                required: ["name","description","macros"]
              }
            },
            dailyTotals: {
              type: Type.OBJECT,
              properties: {
                protein: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                fats: { type: Type.NUMBER },
                calories: { type: Type.NUMBER },
                tdee: { type: Type.NUMBER }
              },
              required: ["protein","carbs","fats","calories","tdee"]
            },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["meals","dailyTotals","recommendations"]
        }
      }
    });

    const text = await result.response.text();
    const plan = JSON.parse(text) as NutritionPlan;

    // Redondeo final de macros y calorías
    plan.dailyTotals.calories = tdee;
    plan.dailyTotals.tdee = tdee;
    plan.meals = plan.meals.map(m => ({
      ...m,
      macros: {
        protein: Math.round(m.macros.protein),
        carbs: Math.round(m.macros.carbs),
        fats: Math.round(m.macros.fats),
        calories: Math.round(m.macros.calories)
      }
    }));

    return plan;

  } catch (err) {
    console.error("Error Gemini:", err);
    throw err;
  }
};
