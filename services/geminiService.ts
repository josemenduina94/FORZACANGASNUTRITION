
import { GoogleGenAI, Type } from "@google/genai";
import { UserData, NutritionPlan, QuestionnaireData } from "../types";

// The API key is obtained exclusively from process.env.API_KEY as per guidelines.
// GoogleGenAI instance is created inside the function to ensure the correct context.

/**
 * Fórmula de Harris-Benedict revisada
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
  
  // Initialize GoogleGenAI with a named parameter for the API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const tdee = calculateTDEE(userData);
  
  const systemInstruction = `Eres el Nutricionista Jefe de "Forza Cangas Nutrition".
  Tu misión es diseñar planes de alimentación precisos y equilibrados.
  
  REGLAS CRÍTICAS DE REPARTO:
  1. REPARTO EQUITATIVO: Divide el TDEE (${tdee} kcal) de forma balanceada entre las ${userData.mealCount} comidas. 
  2. NINGUNA comida debe ser excesivamente grande o pequeña. Variación máxima del 15% entre comidas.
  3. MACROS BALANCEADOS: Reparte proteínas, hidratos y grasas de forma lógica en cada comida.
  4. GRAMAJES: Especifica cantidades exactas en gramos (g) en la descripción.
  5. TERMINOLOGÍA: Usa "Comida" en lugar de "Protocolo".`;

  const prompt = `GENERAR PLAN NUTRICIONAL EQUILIBRADO:
  - TDEE TOTAL: ${tdee} kcal
  - Comidas: ${userData.mealCount} (Aprox. ${Math.round(tdee / userData.mealCount)} kcal por comida)
  - Objetivo: ${userData.goal}
  - Atleta: ${userData.weight}kg, ${userData.height}cm, ${userData.age} años.
  
  Detalla ingredientes exactos con sus pesos para cada comida.`;

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

    // Directly access .text property from GenerateContentResponse
    const planText = response.text;
    if (!planText) throw new Error("Sin respuesta de la IA.");
    
    const plan = JSON.parse(planText) as NutritionPlan;
    
    // Forzar consistencia matemática final
    plan.dailyTotals.calories = Math.round(tdee);
    plan.dailyTotals.tdee = Math.round(tdee);
    
    return plan;
  } catch (error) {
    console.error("Error en Gemini Service:", error);
    throw error;
  }
};
