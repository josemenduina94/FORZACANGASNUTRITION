
import React from 'react';
import { Dumbbell } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover opacity-40 scale-110"
          alt="Athlete background" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
        <div className="flex justify-center mb-8">
           <div className="bg-red-500 p-4 rounded-3xl shadow-2xl shadow-red-500/40">
             <Dumbbell className="text-white w-12 h-12 md:w-16 md:h-16" />
           </div>
        </div>
        <h1 className="text-5xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter leading-none mb-8 italic">
          FORZA <span className="text-red-500">CANGAS</span><br/>NUTRITION
        </h1>
        <p className="text-xl md:text-2xl text-zinc-300 max-w-3xl mx-auto mb-12 font-bold uppercase tracking-tight italic">
          No comas para vivir. Come para dominar. <br/>Optimización de Macros para el Atleta Moderno.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button 
            onClick={() => document.getElementById('nutrition-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-12 py-6 bg-red-500 text-white font-black rounded-2xl text-xl hover:bg-red-600 transition-all transform hover:scale-105 shadow-2xl uppercase italic tracking-tighter"
          >
            Obtener mi Nutricion IA
          </button>
          <button 
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-12 py-6 bg-white/5 text-white font-black rounded-2xl text-xl hover:bg-white/10 transition-all border border-white/10 uppercase italic tracking-tighter"
          >
            Ver Tarifas Elite
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
