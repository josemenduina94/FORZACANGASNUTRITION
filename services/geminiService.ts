
import { GoogleGenAI, Type } from "@google/genai";
import { UserData, NutritionPlan, QuestionnaireData } from "../types";

/**
 * Harris-Benedict revisada - Cálculo de gasto energético base
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

/**
 * Genera el plan nutricional de alto rendimiento.
 * Requiere que API_KEY esté definida en las variables de entorno de Vercel.
 */
export const generateNutritionPlan = async (
  userData: UserData, 
  healthData: QuestionnaireData
): Promise<NutritionPlan> => {
  // Inicialización directa según directrices de @google/genai
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const tdee = calculateTDEE(userData);
  const targetKcalPerMeal = Math.round(tdee / userData.mealCount);
  
  const systemInstruction = `Eres el Nutricionista Jefe de "Forza Cangas Nutrition". 
  Diseña un plan de alto rendimiento con ${tdee} kcal totales.
  
  REGLAS CRÍTICAS:
  1. REPARTO: Distribuye las calorías equitativamente. Cada comida debe tener aprox ${targetKcalPerMeal} kcal.
  2. GRAMAJES: Indica siempre los gramos (g) exactos de cada alimento en el campo description.
  3. ESTRUCTURA: Usa el término "Comida" para cada ingesta.
  4. FORMATO: Responde estrictamente en JSON.
  5. IDIOMA: Español, excepto imageDescription que debe ser Inglés técnico para búsqueda de fotos.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generar plan nutricional para atleta de ${userData.weight}kg con objetivo de ${userData.goal}.`,
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

    // Acceso directo a la propiedad .text (no es un método)
    const planText = response.text;
    if (!planText) throw new Error("Respuesta vacía de la IA.");
    
    const plan = JSON.parse(planText) as NutritionPlan;
    
    // Normalización de datos finales
    plan.dailyTotals.calories = Math.round(tdee);
    plan.dailyTotals.tdee = Math.round(tdee);
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
  } catch (error) {
    console.error("Error en geminiService:", error);
    throw error;
  }
};
