
export type Gender = 'masculino' | 'femenino';
export type ActivityLevel = 1.2 | 1.375 | 1.55 | 1.725 | 1.9;

export interface UserData {
  weight: number;
  height: number;
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  mealCount: number;
  goal: string;
}

export interface QuestionnaireData {
  injuries: string;
  allergies: string;
  stressLevel: string;
  sleepQuality: string;
  waterIntake: string;
}

export interface WeightEntry {
  date: string;
  weight: number;
}

export interface Meal {
  name: string;
  description: string;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
  };
}

export interface NutritionPlan {
  meals: Meal[];
  dailyTotals: {
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
    tdee: number;
  };
  recommendations: string[];
}
