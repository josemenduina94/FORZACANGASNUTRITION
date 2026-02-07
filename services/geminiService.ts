
import { GoogleGenAI, Type } from "@google/genai";
import { UserData, NutritionPlan, QuestionnaireData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Fórmula de Harris-Benedict (Revisión de Roza y Shizgal, 1984)
 * Hombre: BMR = 88.362 + (13.397 × peso) + (4.799 × altura) - (5.677 × edad)
 * Mujer: BMR = 447.593 + (9.247 × peso) + (3.098 × altura) - (4.330 × edad)
 */
export const calculateTDEE = (data: UserData): number => {
  let bmr: number;
  if (data.gender === 'masculino') {
    bmr = 88.362 + (13.397 * data.weight) + (4.799 * data.height) - (5.677 * data.age);
  } else {
    bmr = 447.593 + (9.247 * data.weight) + (3.098 * data.height) - (4.330 * data.age);
  }
  
  const maintenance = bmr * data.activityLevel;
  
  // Ajuste según el objetivo antes de aplicar el factor de actividad
  let adjustment = 0;
  if (data.goal === 'Pérdida de Grasa') adjustment = -500;
  if (data.goal === 'Ganancia Muscular') adjustment = 300;
  
  return Math.round(maintenance + adjustment);
};

export const generateNutritionPlan = async (
  userData: UserData, 
  healthData: QuestionnaireData
): Promise<NutritionPlan> => {
  const tdee = calculateTDEE(userData);
  
  const systemInstruction = `Eres el Nutricionista Jefe de Forza Cangas Nutrition. 
  Tu misión es generar planes de alimentación basados en DATOS MATEMÁTICOS EXACTOS.
  REGLA DE ORO: El total de calorías diario DEBE ser exactamente ${tdee}.
  No aceptes variaciones. La suma de las calorías de cada comida debe cuadrar al 100%.`;

  const prompt = `GENERAR PROTOCOLO NUTRICIONAL ELITE:
  - TDEE CALCULADO (FIJO): ${tdee} kcal
  - Objetivo: ${userData.goal}
  - Número de Comidas: ${userData.mealCount}
  - Perfil Metabólico: Estrés ${healthData.stressLevel}, Sueño ${healthData.sleepQuality}.
  
  REGLAS PARA EL JSON:
  1. dailyTotals.calories = ${tdee}.
  2. Suma de macros.calories de las comidas = ${tdee}.
  3. Proporciona nombres de platos realistas con ingredientes (ej: "Salmón a la plancha con espárragos y quinoa").
  4. La descripción debe mencionar por qué esos ingredientes ayudan al objetivo.`;

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
                required: ["name", "description", "macros"]
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

    const plan = JSON.parse(response.text || '{}') as NutritionPlan;
    
    // Sobreescritura de seguridad para garantizar que el frontend siempre muestre el TDEE matemático correcto
    plan.dailyTotals.calories = tdee;
    plan.dailyTotals.tdee = tdee;
    
    return plan;
  } catch (error) {
    console.error("Error IA:", error);
    throw error;
  }
};
