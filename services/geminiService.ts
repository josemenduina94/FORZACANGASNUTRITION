import { GoogleGenAI, Type } from "@google/genai";
import { UserData, NutritionPlan, QuestionnaireData } from "../types";

/**
 * Initialization following strictly the @google/genai guidelines.
 * The API key is obtained exclusively from process.env.API_KEY.
 */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Revised Harris-Benedict Formula (Roza and Shizgal, 1984)
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
  const idealKcalPerMeal = Math.round(tdee / userData.mealCount);
  
  const systemInstruction = `Eres el Nutricionista Jefe de "Forza Cangas Nutrition". 
  Tu especialidad es la nutrición de precisión para atletas de élite.
  
  REGLAS MANDATORIAS DE DISEÑO:
  1. REPARTO EQUILIBRADO: El total de ${tdee} kcal DEBE distribuirse de forma lógica entre las ${userData.mealCount} comidas. 
     Cada comida debe rondar las ${idealKcalPerMeal} kcal (+/- 10%). Evita descompensaciones extremas (no pongas una comida de 900kcal y otra de 200kcal).
  2. GRAMAJES EXACTOS: Cada ingrediente en el campo "description" DEBE tener su peso exacto en gramos (ej: "200g de pechuga de pollo", "150g de arroz pesado en crudo"). Prohibido usar medidas vagas como "una porción" o "un plato".
  3. MACRONUTRIENTES: Calcula los macros para esos gramajes específicos. Deben ser números ENTEROS.
  4. TERMINOLOGÍA: Usa el término "Comida" para referirte a cada ingesta.
  5. IDIOMA: Responde en Español, excepto el campo "imageDescription" que debe ir en Inglés técnico para búsqueda de imágenes.
  6. FORMATO: Responde ÚNICAMENTE en JSON puro siguiendo el esquema proporcionado.`;

  const prompt = `GENERAR PLAN NUTRICIONAL EQUILIBRADO:
  - TDEE OBJETIVO: ${tdee} kcal
  - Objetivo: ${userData.goal}
  - Número de Comidas: ${userData.mealCount}
  - Perfil del Atleta: Peso ${userData.weight}kg, Altura ${userData.height}cm, Edad ${userData.age} años.
  - Factores de Salud: Estrés ${healthData.stressLevel}, Calidad de Sueño ${healthData.sleepQuality}.`;

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

    // Access the text property directly (not a method call) as per guidelines.
    const planText = response.text;
    if (!planText) throw new Error("La IA no devolvió contenido.");
    
    const plan = JSON.parse(planText) as NutritionPlan;
    
    // Ensure final consistency and rounding
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