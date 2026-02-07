
import React, { useState } from 'react';
import { UserData, QuestionnaireData } from '../types';
import Questionnaire from './Questionnaire';

interface NutritionFormProps {
  onSubmit: (data: UserData, health: QuestionnaireData) => void;
  isLoading: boolean;
}

const NutritionForm: React.FC<NutritionFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<UserData>({
    weight: 75,
    height: 175,
    age: 25,
    gender: 'masculino',
    activityLevel: 1.55,
    mealCount: 4,
    goal: 'Rendimiento Deportivo'
  });

  const [healthData, setHealthData] = useState<QuestionnaireData>({
    injuries: '',
    allergies: '',
    stressLevel: 'moderado',
    sleepQuality: 'buena',
    waterIntake: 'moderado'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericFields = ['weight', 'height', 'age', 'activityLevel', 'mealCount'];
    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, healthData);
  };

  return (
    <section id="nutrition-form" className="py-24 bg-zinc-900/50 scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic text-white">NUTRICIÓN <span className="text-red-500">FORZA</span></h2>
          <p className="text-zinc-500 mt-4 uppercase text-xs font-black tracking-widest">Algoritmo de rendimiento metabólico avanzado</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-zinc-900 p-8 md:p-12 rounded-[2.5rem] border border-white/5 shadow-2xl mb-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Objetivo Especializado</label>
                <select name="goal" value={formData.goal} onChange={handleChange} className="w-full bg-zinc-800 border border-white/10 rounded-2xl py-4 px-6 text-white font-black italic uppercase text-sm">
                  <option value="Recomposición Corporal">Recomposición Corporal</option>
                  <option value="Rendimiento Deportivo">Rendimiento Deportivo</option>
                  <option value="Nutrición Integrativa">Nutrición Integrativa</option>
                  <option value="Pérdida de Grasa">Pérdida de Grasa</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Nivel de Actividad (Factor AF)</label>
                <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="w-full bg-zinc-800 border border-white/10 rounded-2xl py-4 px-6 text-white font-black">
                  <option value={1.2}>Sedentario (1.2)</option>
                  <option value={1.375}>Ligero (1.375)</option>
                  <option value={1.55}>Moderado (1.55)</option>
                  <option value={1.725}>Intenso (1.725)</option>
                  <option value={1.9}>Élite / Atleta (1.9)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Peso (kg)</label>
                <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full bg-zinc-800 border border-white/10 rounded-2xl py-4 px-6 text-white font-black" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Altura (cm)</label>
                <input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full bg-zinc-800 border border-white/10 rounded-2xl py-4 px-6 text-white font-black" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Edad</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full bg-zinc-800 border border-white/10 rounded-2xl py-4 px-6 text-white font-black" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Número de Comidas</label>
                <select name="mealCount" value={formData.mealCount} onChange={handleChange} className="w-full bg-zinc-800 border border-white/10 rounded-2xl py-4 px-6 text-white font-black">
                  {[3, 4, 5, 6].map(n => <option key={n} value={n}>{n} comidas / día</option>)}
                </select>
              </div>
            </div>
          </div>

          < Questionnaire data={healthData} onChange={setHealthData} />
          
          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full py-6 ${isLoading ? 'bg-zinc-700' : 'bg-red-500 hover:bg-red-600'} text-white font-black rounded-2xl text-xl transition-all transform hover:scale-[1.01] shadow-2xl uppercase italic tracking-tighter flex items-center justify-center gap-4`}
          >
            {isLoading ? 'ANALIZANDO BIOMETRÍA...' : 'GENERAR PLAN FORZA FUEL'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default NutritionForm;
