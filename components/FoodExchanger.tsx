
import React, { useState, useMemo } from 'react';
import { Search, ArrowRightLeft, Database, Info, Settings2, Trash2 } from 'lucide-react';

interface Food {
  name: string;
  category: 'protein' | 'carb' | 'fat';
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

const EXTENDED_FOOD_DB: Food[] = [
  // Proteínas
  { name: "Pechuga de Pollo", category: "protein", protein: 23, carbs: 0, fat: 1, calories: 110 },
  { name: "Merluza", category: "protein", protein: 18, carbs: 0, fat: 2, calories: 90 },
  { name: "Lomo de Terdo", category: "protein", protein: 21, carbs: 0, fat: 8, calories: 155 },
  { name: "Tofu", category: "protein", protein: 8, carbs: 2, fat: 5, calories: 76 },
  { name: "Salmón", category: "protein", protein: 20, carbs: 0, fat: 13, calories: 200 },
  { name: "Huevos Claros", category: "protein", protein: 11, carbs: 0.7, fat: 0, calories: 50 },
  { name: "Whey Protein (Polvo)", category: "protein", protein: 75, carbs: 5, fat: 3, calories: 350 },
  { name: "Atún al natural", category: "protein", protein: 24, carbs: 0, fat: 0.8, calories: 105 },
  { name: "Ternera magra", category: "protein", protein: 22, carbs: 0, fat: 6, calories: 145 },
  { name: "Gambas", category: "protein", protein: 20, carbs: 0, fat: 1.5, calories: 95 },
  
  // Hidratos
  { name: "Arroz Blanco", category: "carb", protein: 2.7, carbs: 28, fat: 0.3, calories: 130 },
  { name: "Arroz Integral", category: "carb", protein: 2.6, carbs: 25, fat: 1, calories: 115 },
  { name: "Patata Cocida", category: "carb", protein: 2, carbs: 17, fat: 0.1, calories: 77 },
  { name: "Pasta Integral", category: "carb", protein: 5.3, carbs: 26, fat: 1.5, calories: 140 },
  { name: "Avena", category: "carb", protein: 13, carbs: 66, fat: 7, calories: 389 },
  { name: "Boniato / Camote", category: "carb", protein: 1.6, carbs: 20, fat: 0.1, calories: 86 },
  { name: "Quinoa cocida", category: "carb", protein: 4.4, carbs: 21, fat: 1.9, calories: 120 },
  { name: "Pan de Centeno", category: "carb", protein: 8, carbs: 48, fat: 3, calories: 250 },
  { name: "Lentejas cocidas", category: "carb", protein: 9, carbs: 20, fat: 0.4, calories: 116 },
  { name: "Garbanzos cocidos", category: "carb", protein: 9, carbs: 27, fat: 2.6, calories: 164 },
  
  // Grasas
  { name: "Aguacate", category: "fat", protein: 2, carbs: 9, fat: 15, calories: 160 },
  { name: "Aceite de Oliva", category: "fat", protein: 0, carbs: 0, fat: 100, calories: 884 },
  { name: "Nueces", category: "fat", protein: 15, carbs: 14, fat: 65, calories: 654 },
  { name: "Almendras", category: "fat", protein: 21, carbs: 22, fat: 50, calories: 579 },
  { name: "Cacahuetes", category: "fat", protein: 26, carbs: 16, fat: 49, calories: 567 },
  { name: "Crema de Cacahuete", category: "fat", protein: 24, carbs: 20, fat: 50, calories: 590 },
  { name: "Queso Fresco Batido", category: "protein", protein: 8, carbs: 3.5, fat: 0.1, calories: 47 },
];

const FoodExchanger: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [baseAmount, setBaseAmount] = useState<number>(100);
  const [calcMode, setCalcMode] = useState<'macros' | 'calories'>('macros');

  const filteredFoods = useMemo(() => {
    if (!searchTerm) return [];
    const lower = searchTerm.toLowerCase();
    return EXTENDED_FOOD_DB.filter(f => f.name.toLowerCase().includes(lower));
  }, [searchTerm]);

  const equivalents = useMemo(() => {
    if (!selectedFood) return [];
    return EXTENDED_FOOD_DB.filter(f => f.category === selectedFood.category && f.name !== selectedFood.name);
  }, [selectedFood]);

  const calculateAmount = (altFood: Food) => {
    if (!selectedFood) return 0;
    let factor = 1;
    if (calcMode === 'calories') {
      factor = selectedFood.calories / altFood.calories;
    } else {
      if (selectedFood.category === 'protein') factor = selectedFood.protein / altFood.protein;
      if (selectedFood.category === 'carb') factor = selectedFood.carbs / altFood.carbs;
      if (selectedFood.category === 'fat') factor = selectedFood.fat / altFood.fat;
    }
    return Math.round(baseAmount * factor);
  };

  return (
    <section id="exchanger" className="py-24 bg-zinc-950 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-red-500/10 rounded-full">
              <ArrowRightLeft className="text-red-500" size={32} />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic text-white leading-none">
            INTERCAMBIADOR <span className="text-red-500">INTELIGENTE</span>
          </h2>
          <p className="text-zinc-500 mt-4 uppercase text-xs font-black tracking-widest flex items-center justify-center gap-2">
            <Database size={14} /> Base de datos extendida Forza Cangas
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Panel de Configuración */}
          <div className="bg-zinc-900/50 p-8 md:p-12 rounded-[2.5rem] border border-white/5 flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-3">
                <Settings2 className="text-red-500" size={20} />
                <h3 className="text-xl font-black uppercase italic text-white">Configuración</h3>
              </div>
              {selectedFood && (
                <button onClick={() => setSelectedFood(null)} className="text-zinc-600 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
            
            <div className="relative mb-8">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
              <input 
                type="text" 
                placeholder="Busca un alimento p.ej: Pollo, Avena..."
                className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-white font-bold italic focus:ring-1 focus:ring-red-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {filteredFoods.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden z-20 shadow-2xl max-h-60 overflow-y-auto">
                  {filteredFoods.map((f, i) => (
                    <button 
                      key={i} 
                      onClick={() => { setSelectedFood(f); setSearchTerm(""); }}
                      className="w-full text-left px-6 py-4 hover:bg-red-500 hover:text-white text-zinc-400 font-black transition-colors uppercase italic text-xs border-b border-white/5 last:border-0"
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Cantidad Base (g)</label>
                <input 
                  type="number" 
                  value={baseAmount}
                  onChange={(e) => setBaseAmount(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-4 px-6 text-white font-black italic focus:border-red-500 transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Criterio de Cambio</label>
                <select 
                  value={calcMode}
                  onChange={(e) => setCalcMode(e.target.value as 'macros' | 'calories')}
                  className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-4 px-6 text-white font-black italic uppercase text-xs outline-none cursor-pointer"
                >
                  <option value="macros">Macros Dominantes</option>
                  <option value="calories">Calorías Totales</option>
                </select>
              </div>
            </div>

            {selectedFood ? (
              <div className="bg-zinc-950 p-8 rounded-3xl border border-red-500/30 animate-in fade-in zoom-in-95 duration-300 shadow-[0_0_30px_-10px_rgba(239,68,68,0.2)]">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-black uppercase tracking-widest text-red-500 italic">Dosis Seleccionada</span>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase italic ${
                    selectedFood.category === 'protein' ? 'bg-blue-500/10 text-blue-500' :
                    selectedFood.category === 'carb' ? 'bg-orange-500/10 text-orange-500' :
                    'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {selectedFood.category}
                  </div>
                </div>
                <h4 className="text-4xl font-black italic uppercase text-white mb-8 leading-none">{selectedFood.name}</h4>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { l: 'P', v: Math.round(selectedFood.protein * (baseAmount/100)) },
                    { l: 'C', v: Math.round(selectedFood.carbs * (baseAmount/100)) },
                    { l: 'G', v: Math.round(selectedFood.fat * (baseAmount/100)) },
                    { l: 'KCAL', v: Math.round(selectedFood.calories * (baseAmount/100)), h: true }
                  ].map((x, i) => (
                    <div key={i} className="text-center">
                      <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${x.h ? 'text-red-500' : 'text-zinc-600'}`}>{x.l}</p>
                      <p className="text-xl font-black text-white italic">{x.v}{!x.h && 'g'}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center py-16 text-center text-zinc-700 font-black uppercase tracking-[0.3em] italic border-2 border-dashed border-white/5 rounded-[2rem]">
                <Database size={40} className="mb-4 opacity-20" />
                Introduce un ingrediente para empezar
              </div>
            )}
          </div>

          {/* Panel de Equivalentes */}
          <div className="bg-zinc-900/50 p-8 md:p-12 rounded-[2.5rem] border border-white/5 flex flex-col min-h-[500px]">
            <h3 className="text-xl font-black uppercase italic text-white mb-8 flex items-center gap-3">
              Posibles Sustitutos <Info size={18} className="text-red-500" />
            </h3>
            
            {!selectedFood ? (
              <div className="flex-grow flex flex-col items-center justify-center opacity-10">
                <ArrowRightLeft size={64} className="mb-6" />
                <p className="text-sm font-black uppercase tracking-[0.4em] italic">Calculadora en espera</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-3 custom-scrollbar">
                {equivalents.length > 0 ? equivalents.map((alt, i) => {
                  const amount = calculateAmount(alt);
                  const altCal = Math.round(alt.calories * (amount/100));
                  return (
                    <div key={i} className="bg-zinc-950 p-6 rounded-3xl border border-white/5 flex justify-between items-center group hover:border-red-500/20 transition-all duration-300">
                      <div className="max-w-[60%]">
                        <p className="text-white font-black italic uppercase text-lg leading-tight group-hover:text-red-500 transition-colors">{alt.name}</p>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-2 flex flex-wrap items-center gap-2">
                           <span className="text-white/30">{altCal} KCAL</span>
                           <span className="w-1 h-1 bg-zinc-800 rounded-full"></span>
                           <span>{Math.round(alt.protein * (amount/100))}g P | {Math.round(alt.carbs * (amount/100))}g C</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-black text-red-500 italic leading-none">{amount}<span className="text-xs ml-1">g</span></p>
                        <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mt-2 italic">Dosis Ideal</p>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-center text-zinc-500 font-black italic uppercase py-20">No se encontraron alternativas en esta categoría</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FoodExchanger;
