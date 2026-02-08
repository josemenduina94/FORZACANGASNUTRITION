import { GoogleGenAI, Type } from "@google/genai";
import { UserData, NutritionPlan, QuestionnaireData } from "../types";

/**
 * Inicialización siguiendo las directrices obligatorias:
 * La clave API se obtiene exclusivamente de process.env.API_KEY.
 * Se usa el parámetro nombrado { apiKey } al instanciar GoogleGenAI.
 */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
 * Genera el protocolo nutricional detallado.
 * Usa 'gemini-flash-latest' para máxima compatibilidad y velocidad.
 */
export const generateNutritionPlan = async (
  userData: UserData, 
  healthData: QuestionnaireData
): Promise<NutritionPlan> => {
  const tdee = calculateTDEE(userData);
  
  const systemInstruction = `Eres el Nutricionista Jefe de "Forza Cangas Nutrition". 
  Tu misión es diseñar protocolos de alimentación MILIMÉTRICOS para atletas.
  
  REGLAS DE ORO:
  1. CALORÍAS TOTALES: El plan DEBE sumar exactamente ${tdee} kcal.
  2. GRAMAJES EXACTOS: En el campo "description", DEBES listar cada alimento con su peso exacto en gramos (g).
     Ejemplo: "200g de pechuga de pollo a la plancha, 150g de arroz integral pesado en crudo, 80g de aguacate".
  3. SIN GENERALIDADES: Prohibido decir "un plato", "una pieza" o "una porción". Todo debe tener gramaje.
  4. MACRONUTRIENTES: Calcula los macros (P, C, G) para esos gramajes específicos. Deben ser números ENTEROS.
  5. IMÁGENES: La "imageDescription" debe ser técnica y en inglés para que la búsqueda sea precisa (ej: "grilled chicken breast with brown rice and avocado").`;

  const prompt = `GENERAR PROTOCOLO NUTRICIONAL ELITE:
  - TDEE OBJETIVO: ${tdee} kcal
  - Objetivo: ${userData.goal}
  - Número de comidas: ${userData.mealCount}
  - Datos Biométricos: Peso ${userData.weight}kg, Altura ${userData.height}cm, Edad ${userData.age} años.
  - Contexto Salud: Estrés ${healthData.stressLevel}, Alergias: ${healthData.allergies || 'Ninguna'}.

  Crea un plan que sea visualmente coherente y nutricionalmente perfecto.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
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
                  description: { 
                    type: Type.STRING,
                    description: "Lista detallada de ingredientes con gramajes específicos (ej: 200g Pollo...)"
                  },
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
    
    // Aseguramos redondeo y consistencia total con el TDEE
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
    console.error("Error crítico en la generación del plan:", error);
    throw error;
  }
};