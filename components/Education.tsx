
import React, { useState } from 'react';
import { BookOpen, ShieldAlert, ShoppingCart, CheckCircle, RefreshCw } from 'lucide-react';

const Education: React.FC = () => {
  const allMyths = [
    { myth: "Los hidratos por la noche engordan.", truth: "Tu cuerpo no tiene un reloj que active el almacenamiento de grasa a las 20:00h. Importa el total diario." },
    { myth: "Beber agua durante las comidas engorda.", truth: "El agua tiene 0 calorías. Ayuda a la digestión y saciedad en cualquier momento." },
    { myth: "Las grasas son el enemigo.", truth: "Las grasas saludables son vitales para la producción hormonal y la absorción de vitaminas." },
    { myth: "La fruta después de comer fermenta.", truth: "Falso. El estómago es ácido y nada fermenta allí. Es una excelente fuente de fibra." },
    { myth: "Hay que detoxificar el cuerpo con zumos.", truth: "Tus riñones e hígado ya lo hacen 24/7. Lo mejor es beber agua y comer fibra." },
    { myth: "El huevo sube el colesterol malo.", truth: "La mayoría del colesterol es genético. El huevo es proteína de altísima calidad." }
  ];

  const [visibleMyths, setVisibleMyths] = useState(allMyths.slice(0, 3));

  const refreshMyths = () => {
    const shuffled = [...allMyths].sort(() => 0.5 - Math.random());
    setVisibleMyths(shuffled.slice(0, 3));
  };

  const labels = [
    { title: "Orden de Ingredientes", desc: "El primer ingrediente es el mayoritario. Si el azúcar está entre los 3 primeros, descártalo." },
    { title: "Azúcares Añadidos", desc: "Busca nombres como jarabe de maíz, maltodextrina o dextrosa. Son azúcar camuflado." },
    { title: "Grasas Trans", desc: "Evita 'grasas parcialmente hidrogenadas'. Son pro-inflamatorias y dañan el corazón." }
  ];

  return (
    <section id="educacion" className="py-24 bg-zinc-950 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">EDUCACIÓN <span className="text-red-500">ALIMENTARIA</span></h2>
          <p className="text-zinc-500 mt-4 uppercase text-sm font-black tracking-widest">Aprende a comer, no solo a seguir una dieta</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Mitos */}
          <div className="bg-zinc-900/50 p-8 md:p-12 rounded-[2.5rem] border border-white/5 flex flex-col">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-4 bg-red-500/10 rounded-2xl">
                <ShieldAlert className="text-red-500" />
              </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tight text-white">MITOS VS REALIDAD</h3>
            </div>
            <div className="space-y-8 flex-grow">
              {visibleMyths.map((item, i) => (
                <div key={i} className="border-l-2 border-red-500/30 pl-6 space-y-2 animate-in fade-in slide-in-from-left-4 duration-500">
                  <p className="text-red-500 text-xs font-black uppercase tracking-widest italic">Mito: {item.myth}</p>
                  <p className="text-zinc-400 text-sm font-medium leading-relaxed italic">Realidad: {item.truth}</p>
                </div>
              ))}
            </div>
            <button 
              onClick={refreshMyths}
              className="mt-10 flex items-center justify-center gap-2 py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-black rounded-2xl transition-all uppercase text-xs tracking-widest italic"
            >
              <RefreshCw size={14} className="animate-spin-slow" /> Ver más mitos
            </button>
          </div>

          {/* Etiquetas */}
          <div className="bg-zinc-900/50 p-8 md:p-12 rounded-[2.5rem] border border-white/5">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-4 bg-red-500/10 rounded-2xl">
                <ShoppingCart className="text-red-500" />
              </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tight text-white">GUÍA DE SUPERMERCADO</h3>
            </div>
            <div className="space-y-6">
              {labels.map((item, i) => (
                <div key={i} className="bg-zinc-950/50 p-6 rounded-3xl border border-white/5 flex gap-4">
                  <CheckCircle className="text-red-500 shrink-0 mt-1" size={18} />
                  <div>
                    <p className="text-white font-black uppercase text-sm italic mb-1">{item.title}</p>
                    <p className="text-zinc-500 text-xs font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-red-500 p-8 md:p-12 rounded-[2.5rem] text-center shadow-2xl shadow-red-500/20">
          <BookOpen className="mx-auto mb-6 text-white" size={48} />
          <h3 className="text-2xl md:text-3xl font-black uppercase italic text-white mb-4 tracking-tighter">EL PROTOCOLO DE HÁBITOS</h3>
          <p className="text-white/80 max-w-2xl mx-auto font-bold italic mb-0">
            "No diseñamos menús para un mes. Diseñamos criterios para una vida. La verdadera libertad nutricional llega cuando ya no necesitas pesarlo todo porque has aprendido a elegir."
          </p>
        </div>
      </div>
    </section>
  );
};

export default Education;
