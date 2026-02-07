
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WeightEntry } from '../types';
import { TrendingUp, Plus } from 'lucide-react';

const ProgressTracker: React.FC = () => {
  const [data, setData] = useState<WeightEntry[]>([
    { date: '01/03', weight: 82 },
    { date: '08/03', weight: 81.5 },
    { date: '15/03', weight: 80.8 },
    { date: '22/03', weight: 80.2 }
  ]);
  const [newWeight, setNewWeight] = useState('');

  const addEntry = () => {
    if (!newWeight) return;
    const today = new Date();
    const entry: WeightEntry = {
      date: `${today.getDate()}/${today.getMonth() + 1}`,
      weight: parseFloat(newWeight)
    };
    setData([...data, entry]);
    setNewWeight('');
  };

  return (
    <section className="py-24 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 bg-zinc-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-red-500" />
                <h3 className="text-2xl font-black uppercase tracking-tighter">Forza Analytics</h3>
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '1rem' }}
                    itemStyle={{ color: '#ef4444', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="weight" stroke="#ef4444" strokeWidth={4} fillOpacity={1} fill="url(#colorWeight)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-zinc-900 p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-center">
            <h4 className="text-xl font-black uppercase tracking-tighter mb-6">Log Personal</h4>
            <p className="text-zinc-500 text-sm mb-8 italic">"Lo que no se mide, no se puede mejorar."</p>
            
            <div className="space-y-4">
              <input 
                type="number" 
                step="0.1"
                placeholder="Peso actual (kg)"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="w-full bg-zinc-800 border border-white/10 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-red-500 text-white font-bold"
              />
              <button 
                onClick={addEntry}
                className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                <Plus size={20} /> Añadir Entrada
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProgressTracker;
