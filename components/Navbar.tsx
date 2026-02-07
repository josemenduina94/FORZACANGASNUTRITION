
import React from 'react';
import { Dumbbell } from 'lucide-react';

const Navbar: React.FC = () => {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center cursor-pointer gap-3" onClick={() => scrollTo('hero')}>
            <div className="bg-red-500 p-1.5 rounded-lg">
              <Dumbbell className="text-white w-5 h-5" />
            </div>
            <span className="text-xl md:text-2xl font-black tracking-tighter uppercase italic">
              FORZA <span className="text-red-500">CANGAS</span> NUTRITION
            </span>
          </div>
          <div className="hidden lg:block">
            <div className="ml-10 flex items-baseline space-x-6">
              <button onClick={() => scrollTo('about')} className="text-zinc-400 hover:text-white text-xs font-black uppercase tracking-widest transition-colors">Nosotros</button>
              <button onClick={() => scrollTo('servicios')} className="text-zinc-400 hover:text-white text-xs font-black uppercase tracking-widest transition-colors">Servicios</button>
              <button onClick={() => scrollTo('educacion')} className="text-zinc-400 hover:text-white text-xs font-black uppercase tracking-widest transition-colors">Educación</button>
              <button onClick={() => scrollTo('nutrition-form')} className="text-zinc-400 hover:text-white text-xs font-black uppercase tracking-widest transition-colors">Nutricion IA</button>
              <button onClick={() => scrollTo('pricing')} className="text-zinc-400 hover:text-white text-xs font-black uppercase tracking-widest transition-colors">Tarifas</button>
              <button 
                onClick={() => scrollTo('nutrition-form')} 
                className="bg-red-500 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
              >
                Empezar Ya
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
