
import React from 'react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-24 bg-zinc-950">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-sm font-black text-red-500 uppercase tracking-[0.3em] mb-6">Sobre Nosotros</h2>
        <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8 italic">EL PODER DEL <br/><span className="text-red-500">MORRAZO</span></h3>
        <p className="text-xl text-zinc-400 leading-relaxed font-medium italic">
          "En Forza Cangas Nutrition, creemos que la nutrición no es una restricción, sino la herramienta más potente para forjar el cuerpo que tu voluntad desea. Combinamos la nobleza del esfuerzo tradicional de nuestra tierra con la precisión analítica de la vanguardia científica. No solo contamos calorías; diseñamos el combustible para tu leyenda personal."
        </p>
      </div>
    </section>
  );
};

export default About;
