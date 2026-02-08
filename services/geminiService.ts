
import { GoogleGenAI, Type } from "@google/genai";
import { UserData, NutritionPlan, QuestionnaireData } from "../types";

/**
 * Según las directrices de Google GenAI SDK:
 * 1. La clave API debe obtenerse exclusivamente de process.env.API_KEY.
 * 2. Se debe usar la clase GoogleGenAI con el parámetro nombrado { apiKey }.
 */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Fórmula de Harris-Benedict
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
  IMPORTANTE: Todos los valores numéricos de macronutrientes y calorías deben ser números ENTEROS (redondeados).
  Usa un tono profesional, motivador y directo.`;

  const prompt = `GENERAR PLAN NUTRICIONAL:
  - TDEE OBJETIVO: ${tdee} kcal
  - Objetivo: ${userData.goal}
  - Comidas: ${userData.mealCount}

  IMPORTANTE: Para cada comida, rellena el campo "imageDescription" con una descripción técnica en inglés del plato (ejemplo: "grilled salmon with asparagus", "greek yogurt with walnuts"). No inventes URLs, solo describe el plato.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Modelo actualizado para evitar errores 404 y cumplir directrices
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

    const planText = response.text; // 'text' es una propiedad, no un método.
    if (!planText) throw new Error("La IA no devolvió contenido.");
    
    const plan = JSON.parse(planText) as NutritionPlan;
    
    // Post-procesamiento de seguridad para forzar números enteros
    plan.dailyTotals.calories = Math.round(tdee);
    plan.dailyTotals.tdee = Math.round(tdee);
    
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
