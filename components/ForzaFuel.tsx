
import React from 'react';
import { NutritionPlan, Meal } from '../types';
import { Download } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface ForzaFuelProps {
  plan: NutritionPlan | null;
  isLoading: boolean;
}

const cleanNameForURL = (name: string) => {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Eliminar tildes
    .replace(/[^a-z0-9\s]/g, "")    // Eliminar caracteres especiales
    .replace(/\s+/g, "-");          // Espacios por guiones
};

const MealCard: React.FC<{ meal: Meal; index: number }> = ({ meal, index }) => {
  const cleanName = cleanNameForURL(meal.name);
  const imageUrl = `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800&q=${cleanName}`;
  const fallbackUrl = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800';

  return (
    <div className="bg-zinc-900 rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col h-full shadow-2xl group hover:border-red-500/20 transition-all">
      <div className="h-52 bg-zinc-800 relative overflow-hidden">
        <img 
          src={imageUrl} 
          alt={meal.name}
          className="w-full h-52 object-cover rounded-t-[2.5rem] group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== fallbackUrl) {
              target.src = fallbackUrl;
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent"></div>
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
          <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">IA Visual Scan</span>
          <div className="w-12 h-1 bg-red-500/40 rounded-full"></div>
        </div>
      </div>
      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-red-500 italic">Comida {index + 1}</h3>
          <span className="text-xl font-black italic text-white">{meal.macros.calories} <span className="text-[10px] text-zinc-500 uppercase">kcal</span></span>
        </div>
        <h4 className="text-2xl font-black mb-4 text-white uppercase italic leading-tight">{meal.name}</h4>
        <p className="text-zinc-400 text-sm mb-8 flex-grow leading-relaxed font-medium italic border-l border-white/10 pl-4">{meal.description}</p>
        <div className="grid grid-cols-3 gap-3 border-t border-white/5 pt-8">
          <div className="text-center p-3 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-red-500/5 transition-colors">
            <p className="text-[9px] font-black text-zinc-600 uppercase mb-1">PROT</p>
            <p className="text-lg font-black text-white">{meal.macros.protein}g</p>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-red-500/5 transition-colors">
            <p className="text-[9px] font-black text-zinc-600 uppercase mb-1">CARB</p>
            <p className="text-lg font-black text-white">{meal.macros.carbs}g</p>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-red-500/5 transition-colors">
            <p className="text-[9px] font-black text-zinc-600 uppercase mb-1">GRAS</p>
            <p className="text-lg font-black text-white">{meal.macros.fats}g</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ForzaFuel: React.FC<ForzaFuelProps> = ({ plan, isLoading }) => {
  const exportPDF = () => {
    if (!plan) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("FORZA CANGAS NUTRITION - PLAN PERSONALIZADO", 10, 20);
    doc.setFontSize(14);
    doc.text(`Calorías Totales: ${plan.dailyTotals.calories} kcal`, 10, 40);
    
    plan.meals.forEach((meal, i) => {
        doc.text(`${i+1}. ${meal.name} (${meal.macros.calories} kcal)`, 10, 60 + (i * 10));
    });
    doc.save(`Forza_Cangas_Nutrition_Plan_${new Date().getTime()}.pdf`);
  };

  if (!plan && !isLoading) return null;

  return (
    <section id="forza-nutrition" className="py-24 bg-zinc-950 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic text-white">FORZA <span className="text-red-500">CANGAS NUTRITION</span></h2>
            <p className="text-zinc-500 mt-2 font-bold uppercase text-xs tracking-[0.2em]">Configuración Ganadora Generada por IA</p>
          </div>
          {plan && (
            <button 
              onClick={exportPDF}
              className="px-10 py-5 bg-white text-zinc-950 font-black rounded-2xl hover:bg-zinc-200 transition-all uppercase tracking-tighter flex items-center gap-3 shadow-xl"
            >
              <Download size={20} /> Exportar Plan PDF
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center bg-zinc-900/50 rounded-[2.5rem] border border-white/5">
            <div className="w-20 h-20 border-4 border-red-500/10 border-t-red-500 rounded-full animate-spin mb-8"></div>
            <p className="text-zinc-500 font-black uppercase tracking-[0.3em] italic animate-pulse text-center px-4">Sincronizando con base de datos de Forza Cangas...</p>
          </div>
        ) : plan ? (
          <div className="space-y-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {[
                 { label: 'CALORÍAS TOTALES', val: plan.dailyTotals.calories, u: 'kcal' },
                 { label: 'PROTEÍNA', val: plan.dailyTotals.protein, u: 'g' },
                 { label: 'CARBOHIDRATOS', val: plan.dailyTotals.carbs, u: 'g' },
                 { label: 'GRASAS', val: plan.dailyTotals.fats, u: 'g' }
               ].map((item, i) => (
                 <div key={i} className="bg-zinc-900 p-8 rounded-[2.5rem] border border-white/5 text-center shadow-lg hover:border-red-500/20 transition-all">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-3">{item.label}</p>
                    <p className="text-4xl md:text-5xl font-black text-white italic leading-none">{item.val}<span className="text-xs text-red-500 ml-1 font-black">{item.u}</span></p>
                 </div>
               ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {plan.meals.map((meal, idx) => (
                <MealCard key={idx} meal={meal} index={idx} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default ForzaFuel;
