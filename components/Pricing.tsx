
import React from 'react';
import { Check } from 'lucide-react';

const Pricing: React.FC = () => {
  const plans = [
    {
      name: "Basico IA",
      price: "29€",
      period: "/mes",
      features: ["Protocolo Harris-Benedict", "Generador IA Flash", "Gráfica de peso ilimitada", "Recetas básicas"],
      button: "Activar Plan",
      highlight: false
    },
    {
      name: "Pro Forza IA",
      price: "49€",
      period: "/mes",
      features: ["Todo lo de Basico IA", "IA de Alto Rendimiento", "Sugerencias de Suplementación", "Soporte Prioritario"],
      button: "Potenciar Rendimiento",
      highlight: true
    },
    {
      name: "Premium Nutri + IA",
      price: "89€",
      period: "/mes",
      features: ["Todo lo de Pro Forza IA", "1 Consulta con Nutricionista", "Ajuste manual de macros", "Chat 24/7 WhatsApp"],
      button: "Contactar Nutri",
      highlight: false
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-zinc-900/30 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic">TARIFAS <span className="text-red-500">ELITE</span></h2>
          <p className="text-zinc-500 mt-4 max-w-2xl mx-auto uppercase text-xs font-black tracking-widest">Inversión en tu rendimiento biológico</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <div 
              key={i} 
              className={`relative bg-zinc-900 p-10 rounded-[2.5rem] border transition-all duration-500 ${plan.highlight ? 'border-red-500 shadow-[0_0_50px_-10px_rgba(239,68,68,0.4)] scale-105 z-10' : 'border-white/5 shadow-xl'}`}
            >
              {plan.highlight && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-black uppercase px-6 py-2 rounded-full tracking-[0.2em]">
                  RECOMENDADO
                </div>
              )}
              <h3 className="text-lg font-black uppercase tracking-[0.2em] mb-4 italic">{plan.name}</h3>
              <div className="flex items-baseline gap-2 mb-10">
                <span className="text-6xl font-black tracking-tighter italic">{plan.price}</span>
                <span className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">{plan.period}</span>
              </div>
              
              <ul className="space-y-5 mb-12">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-4 text-xs text-zinc-400 font-black uppercase tracking-tighter">
                    <Check className="text-red-500 shrink-0" size={16} />
                    {feature}
                  </li>
                ))}
              </ul>

              <button 
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all italic ${plan.highlight ? 'bg-red-500 text-white hover:bg-red-600 shadow-xl shadow-red-500/20' : 'bg-white/5 text-white hover:bg-white/10'}`}
              >
                {plan.button}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
