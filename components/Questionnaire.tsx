
import React from 'react';
import { QuestionnaireData } from '../types';
import { ClipboardCheck } from 'lucide-react';

interface Props {
  data: QuestionnaireData;
  onChange: (data: QuestionnaireData) => void;
}

const Questionnaire: React.FC<Props> = ({ data, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  return (
    <div className="bg-zinc-900 p-8 rounded-[2.5rem] border border-white/5 shadow-xl mb-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-red-500/10 rounded-2xl">
          <ClipboardCheck className="text-red-500" size={24} />
        </div>
        <h3 className="text-2xl font-black uppercase tracking-tighter">Perfil de Salud Forza</h3>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">¿Lesiones previas o actuales?</label>
          <input 
            name="injuries" value={data.injuries} onChange={handleChange}
            placeholder="Ej: Tendinitis en rodilla izq"
            className="w-full bg-zinc-800 border border-white/10 rounded-2xl py-3 px-5 focus:ring-2 focus:ring-red-500 text-white text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">¿Alergias o intolerancias?</label>
          <input 
            name="allergies" value={data.allergies} onChange={handleChange}
            placeholder="Ej: Lactosa, frutos secos"
            className="w-full bg-zinc-800 border border-white/10 rounded-2xl py-3 px-5 focus:ring-2 focus:ring-red-500 text-white text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Nivel de estrés diario</label>
          <select 
            name="stressLevel" value={data.stressLevel} onChange={handleChange}
            className="w-full bg-zinc-800 border border-white/10 rounded-2xl py-3 px-5 focus:ring-2 focus:ring-red-500 text-white text-sm"
          >
            <option value="bajo">Bajo - Zen</option>
            <option value="moderado">Moderado - Normal</option>
            <option value="alto">Alto - Estilo de vida activo</option>
            <option value="muy alto">Extremo - Élite / Trabajo pesado</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Calidad de sueño</label>
          <select 
            name="sleepQuality" value={data.sleepQuality} onChange={handleChange}
            className="w-full bg-zinc-800 border border-white/10 rounded-2xl py-3 px-5 focus:ring-2 focus:ring-red-500 text-white text-sm"
          >
            <option value="pobre">Pobre (&lt; 6h / interrumpido)</option>
            <option value="buena">Buena (7-8h / reparador)</option>
            <option value="excelente">Excelente (Consistente)</option>
          </select>
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Consumo de agua diario</label>
          <select 
            name="waterIntake" value={data.waterIntake} onChange={handleChange}
            className="w-full bg-zinc-800 border border-white/10 rounded-2xl py-3 px-5 focus:ring-2 focus:ring-red-500 text-white text-sm"
          >
            <option value="insuficiente">Insuficiente (&lt; 1.5L)</option>
            <option value="moderado">Moderado (2-3L)</option>
            <option value="atleta">Óptimo (+3.5L)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;
