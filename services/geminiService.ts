import { GoogleGenAI, Type } from "@google/genai";
import { UserData, NutritionPlan, QuestionnaireData } from "../types";

/**
 * Inicialización siguiendo las directrices de Google GenAI SDK.
 * Se utiliza exclusivamente process.env.API_KEY.
 */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
  const tdee = calculateTDEE(userData);
  
  const systemInstruction = `Eres el Nutricionista Jefe de "Forza Cangas Nutrition". 
  Tu misión es diseñar planes de alimentación de alto rendimiento.

  REGLAS CRÍTICAS DE BALANCE (EVITAR DESCOMPENSACIÓN):
  1. REPARTO EQUITATIVO: El total de ${tdee} kcal debe dividirse equitativamente entre las ${userData.mealCount} comidas. 
  2. NINGUNA comida puede tener menos del 20% ni más del 30% del total calórico diario (salvo que el número de comidas sea muy bajo).
  3. EVITA el error de poner una comida de 900kcal y otra de 200kcal. El objetivo es aprox ${Math.round(tdee / userData.mealCount)} kcal por comida.
  4. GRAMAJES EXACTOS: En "description", especifica cada alimento con su PESO en gramos (g).
  5. TERMINOLOGÍA: Usa siempre la palabra "Comida" para referirte a las ingestas.
  6. RESPUESTA: Solo JSON puro.`;

  const prompt = `GENERAR PROTOCOLO NUTRICIONAL ELITE:
  - TDEE OBJETIVO: ${tdee} kcal
  - Distribución ideal: ~${Math.round(tdee / userData.mealCount)} kcal por cada una de las ${userData.mealCount} comidas.
  - Objetivo: ${userData.goal}
  - Atleta: Peso ${userData.weight}kg, Altura ${userData.height}cm, Edad ${userData.age} años.
  - Estrés: ${healthData.stressLevel}, Sueño: ${healthData.sleepQuality}.
  
  Crea un plan realista, con ingredientes comunes pero efectivos (pollo, arroz, aguacate, huevos, avena, etc.) y cantidades precisas.`;

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
                  description: { type: Type.STRING, description: "Lista de ingredientes con gramajes exactos" },
                  imageDescription: { type: Type.STRING, description: "Short technical description in English for image search" },
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
    
    // Forzar redondeo final y coherencia con el cálculo base
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
    console.error("Error en generateNutritionPlan:", error);
    throw error;
  }
};