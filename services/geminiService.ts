
import { GoogleGenAI, Type } from "@google/genai";
import { UserData, NutritionPlan, QuestionnaireData } from "../types";

/**
 * Según las directrices de Google GenAI SDK:
 * 1. La clave API debe obtenerse de process.env.API_KEY.
 * 2. Se añade compatibilidad con import.meta.env para entornos Vite/Vercel.
 * 3. Se debe usar la clase GoogleGenAI con un parámetro con nombre { apiKey }.
 */
const getApiKey = (): string => {
  // Intentar obtener de process.env (estándar del entorno de ejecución)
  if (typeof process !== 'undefined' && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  // Fallback a import.meta.env (común en despliegues Vite/Vercel)
  if (typeof (import.meta as any).env !== 'undefined' && (import.meta as any).env.VITE_GEMINI_API_KEY) {
    return (import.meta as any).env.VITE_GEMINI_API_KEY;
  }
  return "";
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey });

/**
 * Fórmula de Harris-Benedict (Revisión de Roza y Shizgal, 1984)
 * Calcula la Tasa Metabólica Basal y aplica el factor de actividad y objetivo.
 */
export const calculateTDEE = (data: UserData): number => {
  let bmr: number;
  if (data.gender === 'masculino') {
    bmr = 88.362 + (13.397 * data.weight) + (4.799 * data.height) - (5.677 * data.age);
  } else {
    bmr = 447.593 + (9.247 * data.weight) + (3.098 * data.height) - (4.330 * data.age);
  }
  
  const maintenance = bmr * data.activityLevel;
  
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
  Tu misión es generar planes de alimentación basados en DATOS MATEMÁTICOS EXACTOS para atletas de élite.
  REGLA DE ORO: El total de calorías diario DEBE ser exactamente ${tdee}.
  IMPORTANTE: Todos los valores numéricos de macronutrientes y calorías deben ser números ENTEROS (redondeados), sin decimales. ABSOLUTAMENTE NINGÚN DECIMAL.
  Usa un tono profesional, motivador y directo.`;

  const prompt = `GENERAR PROTOCOLO NUTRICIONAL:
  - TDEE: ${tdee} kcal
  - Objetivo: ${userData.goal}
  - Perfil: Peso ${userData.weight}kg, Altura ${userData.height}cm, Edad ${userData.age}
  - Estrés: ${healthData.stressLevel}, Sueño: ${healthData.sleepQuality}

  REGLAS PARA EL JSON:
  1. Incluye un campo "image" para cada comida.
  2. La URL debe ser exactamente así: https://images.unsplash.com/photo-[ID]?auto=format&fit=crop&q=80&w=800
  3. Usa IDs de Unsplash reales de comida saludable (ej: 1546065126-d1d87ee09b7a para avena, 1467003909585-2f8a72700288 para pollo).
  4. El resto de campos (name, description, macros) deben ser coherentes y sumar el TDEE de ${tdee} kcal.
  5. dailyTotals.calories DEBE ser exactamente ${tdee}.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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
                  image: { type: Type.STRING },
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
                required: ["name", "description", "image", "macros"]
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

    const planText = response.text;
    if (!planText) throw new Error("La IA no devolvió contenido.");
    
    const plan = JSON.parse(planText) as NutritionPlan;
    
    // Post-procesamiento de seguridad para garantizar coherencia y ausencia de decimales
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
    console.error("Error crítico en la conexión con Gemini:", error);
    throw error;
  }
};
