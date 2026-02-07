
import React from 'react';
import { Target, Zap, Heart, Flame } from 'lucide-react';

const Services: React.FC = () => {
  const items = [
    { title: "Rendimiento Deportivo", desc: "Optimización de sustratos energéticos y recuperación para atletas de competición.", icon: Zap },
    { title: "Recomposición", desc: "Protocolos para ganar masa muscular mientras se reduce el porcentaje graso.", icon: Target },
    { title: "Nutrición Integrativa", desc: "Salud hormonal, digestiva y bienestar sistémico a través de la comida.", icon: Heart },
    { title: "Pérdida de Grasa", desc: "Déficit inteligente sin pérdida de rendimiento ni masa muscular.", icon: Flame }
  ];

  return (
    <section id="servicios" className="py-24 bg-zinc-900/20 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black uppercase tracking-tighter italic">NUESTROS <span className="text-red-500">SERVICIOS</span></h2>
          <p className="text-zinc-500 mt-4 uppercase text-xs font-black tracking-widest">Especialización de élite en O Morrazo</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item, i) => (
            <div key={i} className="bg-zinc-900 border border-white/5 p-8 rounded-[2.5rem] hover:border-red-500/30 transition-all group">
              <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-500 transition-colors">
                <item.icon className="text-red-500 group-hover:text-white transition-colors" />
              </div>
              <h4 className="text-lg font-black uppercase tracking-tight mb-3 italic">{item.title}</h4>
              <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
