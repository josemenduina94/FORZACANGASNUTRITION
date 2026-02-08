import { GoogleGenAI, Type } from "@google/genai";
import { UserData, NutritionPlan, QuestionnaireData } from "../types";

/**
 * Fórmula de Harris-Benedict revisada (Roza y Shizgal, 1984)
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
 * Genera el plan nutricional utilizando gemini-3-flash-preview para velocidad y precisión.
 */
export const generateNutritionPlan = async (
  userData: UserData, 
  healthData: QuestionnaireData
): Promise<NutritionPlan> => {
  // Inicialización dentro de la función para asegurar que el API Key esté disponible en el contexto de ejecución.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const tdee = calculateTDEE(userData);
  const targetKcalPerMeal = Math.round(tdee / userData.mealCount);
  
  const systemInstruction = `Eres el Nutricionista Jefe de "Forza Cangas Nutrition". 
  Tu misión es diseñar planes de alimentación de alto rendimiento con precisión matemática.

  REGLAS DE REPARTO CALÓRICO (CRÍTICO):
  1. EQUILIBRIO: Debes repartir las ${tdee} kcal de forma equilibrada entre las ${userData.mealCount} comidas.
  2. OBJETIVO POR COMIDA: Cada comida debe tener aproximadamente ${targetKcalPerMeal} kcal. 
  3. DESVIACIÓN MÁXIMA: No permitas que una comida sea mucho más grande que otra. La diferencia máxima permitida entre la comida más grande y la más pequeña es del 15%.
  4. TERMINOLOGÍA: Usa siempre el término "Comida" (ej: Comida 1, Comida 2...).

  REGLAS DE CONTENIDO:
  1. GRAMAJES EXACTOS: En el campo "description", lista cada alimento con su peso exacto en gramos (g). Ejemplo: "200g de pollo, 150g de arroz...".
  2. MACRONUTRIENTES: Calcula los macros (P, C, G) para esos gramajes específicos como números enteros.
  3. IDIOMA: Responde en Español. La "imageDescription" debe ser en Inglés técnico (ej: "grilled salmon with asparagus").`;

  const prompt = `GENERAR PLAN NUTRICIONAL EQUILIBRADO:
  - TDEE TOTAL: ${tdee} kcal
  - Objetivo: ${userData.goal}
  - Número de Comidas: ${userData.mealCount} (Target: ~${targetKcalPerMeal} kcal por comida)
  - Atleta: ${userData.weight}kg, ${userData.height}cm, ${userData.age} años.
  - Contexto: Estrés ${healthData.stressLevel}, Sueño ${healthData.sleepQuality}.`;

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

    const planText = response.text;
    if (!planText) throw new Error("La IA no devolvió contenido.");
    
    const plan = JSON.parse(planText) as NutritionPlan;
    
    // Forzar consistencia final
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
    console.error("Error crítico en generación de plan:", error);
    throw error;
  }
};