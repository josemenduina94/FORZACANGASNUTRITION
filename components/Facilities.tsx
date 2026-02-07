
import React from 'react';

const Facilities: React.FC = () => {
  return (
    <section id="facilities" className="py-24 bg-zinc-950 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative rounded-[2.5rem] overflow-hidden group border border-white/5">
          <img 
            src="https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=2000" 
            alt="Clínica Forza Cangas con báscula de bioimpedancia" 
            className="w-full h-[600px] object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
          <div className="absolute bottom-12 left-12 right-12">
            <h3 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">INSTALACIONES <br/><span className="text-red-500">DE PRECISIÓN</span></h3>
            <p className="text-zinc-400 mt-4 max-w-lg font-medium italic">Nuestra clínica en Cangas está equipada con tecnología de bioimpedancia avanzada para medir lo que realmente importa: tu evolución biológica.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Facilities;
