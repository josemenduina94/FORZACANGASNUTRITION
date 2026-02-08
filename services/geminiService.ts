import { GoogleGenAI, Type } from "@google/genai";
import { UserData, NutritionPlan, QuestionnaireData } from "../types";

/**
 * Harris-Benedict revisada (Roza y Shizgal, 1984)
 * Calcula el gasto energético total diario.
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
 * Utiliza gemini-3-flash-preview para mayor velocidad y cumplimiento de guías.
 */
export const generateNutritionPlan = async (
  userData: UserData, 
  healthData: QuestionnaireData
): Promise<NutritionPlan> => {
  // Inicialización obligatoria usando process.env.API_KEY directamente
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const tdee = calculateTDEE(userData);
  const targetKcalPerMeal = Math.round(tdee / userData.mealCount);
  
  const systemInstruction = `Eres el Nutricionista Jefe de "Forza Cangas Nutrition". 
  Tu misión es diseñar planes de alimentación de alto rendimiento con precisión matemática.

  REGLAS DE REPARTO CALÓRICO:
  1. EQUILIBRIO: Distribuye las ${tdee} kcal de forma equilibrada entre las ${userData.mealCount} comidas.
  2. OBJETIVO POR COMIDA: Cada comida debe tener aproximadamente ${targetKcalPerMeal} kcal. 
  3. TERMINOLOGÍA: Usa siempre el término "Comida" (ej: Comida 1, Comida 2...).

  REGLAS DE CONTENIDO:
  1. GRAMAJES EXACTOS: En el campo "description", lista cada alimento con su peso en gramos (g).
  2. MACRONUTRIENTES: Calcula los macros para esos gramajes específicos como números enteros.
  3. IDIOMA: Responde en Español. La "imageDescription" debe ser en Inglés técnico para la API de imágenes.`;

  const prompt = `GENERAR PLAN NUTRICIONAL EQUILIBRADO:
  - TDEE TOTAL: ${tdee} kcal
  - Objetivo: ${userData.goal}
  - Número de Comidas: ${userData.mealCount}
  - Datos Atleta: ${userData.weight}kg, ${userData.height}cm, ${userData.age} años.
  - Perfil Salud: Estrés ${healthData.stressLevel}, Sueño ${healthData.sleepQuality}.`;

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

    // .text es una propiedad getter, no un método. No añadir () al final.
    const planText = response.text;
    if (!planText) throw new Error("La IA no devolvió contenido.");
    
    const plan = JSON.parse(planText) as NutritionPlan;
    
    // Forzar consistencia de calorías finales según cálculo base
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
    console.error("Error crítico en geminiService:", error);
    throw error;
  }
};