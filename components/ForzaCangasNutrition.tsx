import React, { useState, useEffect } from 'react';
import { NutritionPlan, Meal } from '../types';
import { Download, Scale, Zap, Info } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface ForzaCangasNutritionProps {
  plan: NutritionPlan | null;
  isLoading: boolean;
}

const MealCard: React.FC<{ meal: Meal; index: number }> = ({ meal, index }) => {
  const fallbackUrl = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800';
  const [imageUrl, setImageUrl] = useState(fallbackUrl);

  useEffect(() => {
    const unsplashApiKey = "1v8avkDCUeUlgqPzeVnqQnDfH3fMHjhu--yrgw_smbw"; 

    if (meal.imageDescription) {
      const query = encodeURIComponent(meal.imageDescription + " food");
      const url = `https://api.unsplash.com/search/photos?query=${query}&per_page=1&client_id=${unsplashApiKey}`;

      fetch(url)
        .then(res => res.json())
        .then(data => {
          if (data.results && data.results.length > 0) {
            setImageUrl(data.results[0].urls.regular);
          } else {
            setImageUrl(fallbackUrl);
          }
        })
        .catch(() => setImageUrl(fallbackUrl));
    }
  }, [meal.imageDescription, fallbackUrl]);

  return (
    <div className="bg-zinc-900 rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col h-full shadow-2xl group hover:border-red-500/20 transition-all">
      <div className="h-56 bg-zinc-800 relative overflow-hidden">
        <img 
          src={imageUrl} 
          alt={meal.name}
          className="w-full h-full object-cover rounded-t-[2.5rem] group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent"></div>
        <div className="absolute top-4 left-4">
          <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2">
            <Scale size={12} className="text-red-500" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Pesaje de Precisión</span>
          </div>
        </div>
      </div>
      
      <div className="p-8 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-red-500 italic">Protocolo {index + 1}</h3>
          <span className="text-2xl font-black italic text-white leading-none">{Math.round(meal.macros.calories)} <span className="text-[10px] text-zinc-500 uppercase">kcal</span></span>
        </div>
        
        <h4 className="text-2xl font-black mb-6 text-white uppercase italic leading-tight group-hover:text-red-500 transition-colors">{meal.name}</h4>
        
        <div className="bg-white/5 rounded-2xl p-5 mb-8 border border-white/5 relative overflow-hidden flex-grow group/desc">
          <div className="flex items-center gap-2 mb-3">
             <Info size={14} className="text-red-500" />
             <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Ingredientes y Gramajes</span>
          </div>
          <p className="text-zinc-200 text-sm leading-relaxed font-bold italic border-l-2 border-red-500 pl-4">
            {meal.description}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5">
          <div className="text-center p-3 bg-zinc-950 rounded-2xl border border-white/5">
            <p className="text-[9px] font-black text-zinc-600 uppercase mb-1">Proteína</p>
            <p className="text-lg font-black text-white italic">{Math.round(meal.macros.protein)}g</p>
          </div>
          <div className="text-center p-3 bg-zinc-950 rounded-2xl border border-white/5">
            <p className="text-[9px] font-black text-zinc-600 uppercase mb-1">Carbos</p>
            <p className="text-lg font-black text-white italic">{Math.round(meal.macros.carbs)}g</p>
          </div>
          <div className="text-center p-3 bg-zinc-950 rounded-2xl border border-white/5">
            <p className="text-[9px] font-black text-zinc-600 uppercase mb-1">Grasas</p>
            <p className="text-lg font-black text-white italic">{Math.round(meal.macros.fats)}g</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ForzaCangasNutrition: React.FC<ForzaCangasNutritionProps> = ({ plan, isLoading }) => {
  const exportPDF = () => {
    if (!plan) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("FORZA CANGAS NUTRITION - PROTOCOLO ELITE", 10, 20);
    doc.setFontSize(14);
    doc.text(`TDEE Objetivo: ${Math.round(plan.dailyTotals.tdee)} kcal`, 10, 40);
    
    plan.meals.forEach((meal, i) => {
        doc.text(`${i+1}. ${meal.name}`, 10, 60 + (i * 20));
        doc.setFontSize(10);
        doc.text(`${meal.description}`, 15, 65 + (i * 20));
        doc.setFontSize(14);
    });
    doc.save(`Forza_Nutrition_Protocol_${new Date().getTime()}.pdf`);
  };

  if (!plan && !isLoading) return null;

  return (
    <section id="forza-nutrition" className="py-24 bg-zinc-950 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic text-white">ESTRATEGIA <span className="text-red-500">BIO-MÉTRICA</span></h2>
            <p className="text-zinc-500 mt-2 font-bold uppercase text-xs tracking-[0.2em]">Configuración de Macronutrientes por IA</p>
          </div>
          {plan && (
            <button 
              onClick={exportPDF}
              className="px-10 py-5 bg-white text-zinc-950 font-black rounded-2xl hover:bg-zinc-200 transition-all uppercase tracking-tighter flex items-center gap-3 shadow-xl"
            >
              <Download size={20} /> Exportar Protocolo PDF
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center bg-zinc-900/50 rounded-[2.5rem] border border-white/5">
            <div className="w-20 h-20 border-4 border-red-500/10 border-t-red-500 rounded-full animate-spin mb-8"></div>
            <p className="text-zinc-500 font-black uppercase tracking-[0.3em] italic animate-pulse text-center px-4">Calculando densidades calóricas...</p>
          </div>
        ) : plan ? (
          <div className="space-y-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {[
                 { label: 'CALORÍAS TOTALES', val: plan.dailyTotals.calories, u: 'kcal' },
                 { label: 'PROTEÍNA TOTAL', val: plan.dailyTotals.protein, u: 'g' },
                 { label: 'CARBOHIDRATOS', val: plan.dailyTotals.carbs, u: 'g' },
                 { label: 'GRASAS TOTALES', val: plan.dailyTotals.fats, u: 'g' }
               ].map((item, i) => (
                 <div key={i} className="bg-zinc-900 p-8 rounded-[2.5rem] border border-white/5 text-center shadow-lg hover:border-red-500/20 transition-all">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-3">{item.label}</p>
                    <p className="text-4xl md:text-5xl font-black text-white italic leading-none">{Math.round(item.val)}<span className="text-xs text-red-500 ml-1 font-black">{item.u}</span></p>
                 </div>
               ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {plan.meals.map((meal, idx) => (
                <MealCard key={idx} meal={meal} index={idx} />
              ))}
            </div>

            <div className="bg-zinc-900/50 p-8 md:p-12 rounded-[2.5rem] border border-white/5">
              <h3 className="text-xl font-black uppercase italic text-white mb-8">Recomendaciones de Élite</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {plan.recommendations.map((rec, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 shrink-0"></div>
                    <p className="text-zinc-400 text-sm font-bold italic">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default ForzaCangasNutrition;