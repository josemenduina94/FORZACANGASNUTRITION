import { GoogleGenAI, Type } from "@google/genai";
import { UserData, NutritionPlan, QuestionnaireData } from "../types";

/**
 * Inicialización según las directrices de Google GenAI SDK.
 * La clave API se obtiene exclusivamente de process.env.API_KEY.
 */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Fórmula de Harris-Benedict (Revisión de Roza y Shizgal, 1984)
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
  Tu especialidad es la nutrición de precisión para atletas de élite.
  
  REGLAS MANDATORIAS:
  1. Cada comida DEBE desglosar exactamente qué comer y en qué cantidad (ej: "200g de pechuga de pollo, 100g de arroz basmati pesado en crudo, 50g de aguacate"). No acepto descripciones vagas.
  2. El total calórico diario DEBE ser exactamente ${tdee} kcal.
  3. Los macronutrientes (proteína, carbos, grasas) deben ser números ENTEROS.
  4. La descripción de la comida en el campo "description" DEBE ser una lista detallada de ingredientes con sus gramajes específicos.
  5. El tono es profesional, de alto rendimiento y motivador.`;

  const prompt = `GENERAR PROTOCOLO NUTRICIONAL ELITE:
  - TDEE OBJETIVO: ${tdee} kcal
  - Objetivo: ${userData.goal}
  - Número de Comidas: ${userData.mealCount}
  - Perfil del Atleta: Peso ${userData.weight}kg, Altura ${userData.height}cm, Edad ${userData.age} años.

  ESTRUCTURA DE RESPUESTA (JSON):
  - "name": Nombre del plato.
  - "description": Lista detallada de ingredientes con PESO EXACTO (ej: "180g Salmón salvaje a la plancha, 150g Batata asada, 100g Brócoli al vapor, 10ml Aceite de Oliva").
  - "imageDescription": Descripción técnica corta en inglés para búsqueda de imágenes (ej: "grilled salmon with sweet potato and broccoli").
  - "macros": Valores nutricionales calculados para esa comida.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest', // Alias recomendado para evitar errores 404 y asegurar compatibilidad
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
    
    // Aseguramos coherencia matemática final
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
    console.error("Error en Gemini:", error);
    throw error;
  }
};