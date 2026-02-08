import { GoogleGenAI, Type } from "@google/genai";
import { UserData, NutritionPlan, QuestionnaireData } from "../types";

/**
 * Función de detección de llave para Vercel y AI Studio.
 * Soporta prefijo VITE_ para compatibilidad con bundlers de frontend.
 */
const getApiKey = (): string => {
  // @ts-ignore
  const viteKey = typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY;
  if (viteKey) return viteKey;
  
  // Respaldo para variables de entorno estándar
  if (typeof process !== 'undefined' && process.env?.API_KEY) {
    return process.env.API_KEY;
  }
  
  return "";
};

/**
 * Cálculo de TDEE basado en biometría
 */
export const calculateTDEE = (data: UserData): number => {
  let bmr = data.gender === 'masculino' 
    ? 88.362 + (13.397 * data.weight) + (4.799 * data.height) - (5.677 * data.age)
    : 447.593 + (9.247 * data.weight) + (3.098 * data.height) - (4.330 * data.age);
  
  const maintenance = bmr * data.activityLevel;
  const adjustment = data.goal === 'Pérdida de Grasa' ? -500 : (data.goal === 'Ganancia Muscular' ? 300 : 0);
  
  return Math.round(maintenance + adjustment);
};

/**
 * Genera el plan nutricional utilizando gemini-3-flash-preview.
 */
export const generateNutritionPlan = async (
  userData: UserData, 
  healthData: QuestionnaireData
): Promise<NutritionPlan> => {
  
  const key = getApiKey();
  if (!key) throw new Error("API KEY no encontrada. Verifica que VITE_GEMINI_API_KEY esté configurada en Vercel.");

  // Inicialización siguiendo guías oficiales
  const ai = new GoogleGenAI({ apiKey: key });
  const tdee = calculateTDEE(userData);

  const systemInstruction = `Actúa como Nutricionista Jefe de "Forza Cangas Nutrition".
  Genera un plan de ${tdee} kcal para un atleta de ${userData.weight}kg con objetivo ${userData.goal}.
  Distribuye en ${userData.mealCount} comidas equilibradas.
  
  REGLAS ESTRICTAS:
  - Responde ÚNICAMENTE en formato JSON.
  - Indica gramajes exactos en gramos (g) para cada alimento en la descripción.
  - Los macros deben ser números enteros (sin decimales).
  - El campo "imageDescription" debe estar en Inglés técnico.`;

  const prompt = `Generar protocolo nutricional:
  - Objetivo: ${userData.goal}
  - Peso Atleta: ${userData.weight}kg
  - TDEE Objetivo: ${tdee} kcal
  - Comidas: ${userData.mealCount}
  - Salud: Estrés ${healthData.stressLevel}, Sueño ${healthData.sleepQuality}.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
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

    // .text es una propiedad, no un método.
    const planText = response.text;
    if (!planText) throw new Error("La IA devolvió un resultado vacío.");
    
    // Parseo y limpieza de seguridad
    const plan = JSON.parse(planText) as NutritionPlan;
    
    // Sincronización final de datos para asegurar exactitud matemática
    plan.dailyTotals.tdee = Math.round(tdee);
    plan.dailyTotals.calories = Math.round(tdee);
    
    return plan;
  } catch (error) {
    console.error("Error en la generación de nutrición:", error);
    throw error;
  }
};