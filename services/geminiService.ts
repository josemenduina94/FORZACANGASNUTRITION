
import { GoogleGenAI, Type } from "@google/genai";
import { UserData, NutritionPlan, QuestionnaireData } from "../types";

/**
 * According to Google GenAI SDK guidelines, the API key must be obtained
 * exclusively from the environment variable process.env.API_KEY.
 * This also fixes the TypeError where import.meta.env was undefined.
 */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
  const tdee = Math.round(calculateTDEE(userData));
  
  const systemInstruction = `Eres el Nutricionista Jefe de Forza Cangas Nutrition. 
  Tu misión es generar planes de alimentación basados en DATOS MATEMÁTICOS EXACTOS.
  REGLA DE ORO: El total de calorías diario DEBE ser exactamente ${tdee}.
  IMPORTANTE: Todos los valores numéricos de macronutrientes y calorías deben ser números ENTEROS, sin decimales. ABSOLUTAMENTE NINGÚN DECIMAL.`;

  const prompt = `GENERAR PROTOCOLO NUTRICIONAL ELITE:
  - TDEE CALCULADO (FIJO): ${tdee} kcal
  - Objetivo: ${userData.goal}
  - Número de Comidas: ${userData.mealCount}
  - Perfil Metabólico: Estrés ${healthData.stressLevel}, Sueño ${healthData.sleepQuality}.
  
  REGLAS PARA EL JSON:
  1. dailyTotals.calories = ${tdee}.
  2. Suma de macros.calories de las comidas = ${tdee}.
  3. Todos los valores (protein, carbs, fats, calories) deben ser números ENTEROS redondeados.
  4. Proporciona nombres de platos realistas con ingredientes.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
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
    
    // Sobreescritura de seguridad para garantizar coherencia matemática y sin decimales
    plan.dailyTotals.calories = Math.round(tdee);
    plan.dailyTotals.tdee = Math.round(tdee);
    plan.dailyTotals.protein = Math.round(plan.dailyTotals.protein);
    plan.dailyTotals.carbs = Math.round(plan.dailyTotals.carbs);
    plan.dailyTotals.fats = Math.round(plan.dailyTotals.fats);
    
    plan.meals = plan.meals.map(meal => ({
      ...meal,
      macros: {
        protein: Math.round(meal.macros.protein),
        carbs: Math.round(meal.macros.carbs),
        fats: Math.round(meal.macros.fats),
        calories: Math.round(meal.macros.calories)
      }
    }));
    
    return plan;
  } catch (error) {
    console.error("Error en la generación del plan nutricional:", error);
    throw error;
  }
};
