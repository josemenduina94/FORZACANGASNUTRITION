import { GoogleGenAI, Type } from "@google/genai";
import { UserData, NutritionPlan, QuestionnaireData } from "../types";

/**
 * DETECTOR DE API KEY HÍBRIDO
 * Imprescindible para que funcione en el navegador (Vercel) y en AI Studio.
 */
const getApiKey = (): string => {
  // @ts-ignore - Prioridad Vercel/Vite
  const viteKey = typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY;
  if (viteKey) return viteKey;

  // Respaldo para AI Studio/Node
  if (typeof process !== 'undefined' && process.env?.API_KEY) {
    return process.env.API_KEY;
  }
  return "";
};

export const calculateTDEE = (data: UserData): number => {
  let bmr: number;
  if (data.gender === 'masculino') {
    bmr = 88.362 + (13.397 * data.weight) + (4.799 * data.height) - (5.677 * data.age);
  } else {
    bmr = 447.593 + (9.247 * data.weight) + (3.098 * data.height) - (4.330 * data.age);
  }
  const maintenance = bmr * data.activityLevel;
  const adjustment = data.goal === 'Pérdida de Grasa' ? -500 : (data.goal === 'Ganancia Muscular' ? 300 : 0);
  return Math.round(maintenance + adjustment);
};

export const generateNutritionPlan = async (
  userData: UserData, 
  healthData: QuestionnaireData
): Promise<NutritionPlan> => {
  
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("ERROR_CONFIG: No se encontró la API KEY. Verifica las variables de entorno.");

  const genAI = new GoogleGenAI(apiKey);
  const tdee = calculateTDEE(userData);
  const targetKcalPerMeal = Math.round(tdee / userData.mealCount);

  // AQUÍ ELIGES EL MODELO: 
  // 'gemini-1.5-flash' (Estable) o 'gemini-3-flash-preview' (El que te pide AI Studio)
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash', 
    systemInstruction: `Eres el Nutricionista Jefe de "Forza Cangas Nutrition". 
    Genera un plan de ${tdee} kcal dividido en ${userData.mealCount} comidas. 
    REGLAS: Cada comida ~${targetKcalPerMeal} kcal, gramajes exactos en gramos, sin decimales.
    Respuesta estrictamente en JSON.`
  });

  try {
    const result = await model.generateContent({
      contents: [{ 
        role: "user", 
        parts: [{ text: `Generar protocolo para atleta de ${userData.weight}kg, objetivo ${userData.goal}.` }] 
      }],
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
                  imageDescription: { type: Type.STRING },
                  macros: {
                    type: Type.OBJECT,
                    properties: {
                      protein: { type: Type.NUMBER },
                      carbs: { type: Type.NUMBER },
                      fats: { type: Type.NUMBER },
                      calories: { type: Type.NUMBER },
                    },
                    required: ["protein", "carbs", "fats", "calories"],
                  }
                },
                required: ["name", "description", "imageDescription", "macros"]
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
              required: ["protein", "carbs", "fats", "calories", "tdee"],
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["meals", "dailyTotals", "recommendations"],
        },
      },
    });

    const response = await result.response;
    const planText = response.text(); 
    
    if (!planText) throw new Error("La IA devolvió un resultado vacío.");
    
    const plan = JSON.parse(planText) as NutritionPlan;
    
    // Sincronización final de datos
    plan.dailyTotals.calories = Math.round(tdee);
    plan.dailyTotals.tdee = Math.round(tdee);
    
    return plan;
  } catch (error) {
    console.error("Error en geminiService:", error);
    throw error;
  }
};