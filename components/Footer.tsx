
import React from 'react';
import { MapPin, Phone, Mail, Dumbbell } from 'lucide-react';

const Footer: React.FC = () => {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-zinc-950 border-t border-white/5 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mb-20">
          {/* Brand */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="bg-red-500 p-1.5 rounded-lg">
                <Dumbbell className="text-white w-5 h-5" />
              </div>
              <span className="text-3xl font-black tracking-tighter uppercase italic block">
                FORZA <span className="text-red-500">CANGAS</span> NUTRITION
              </span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-sm font-medium italic">
              Tu centro de referencia en O Morrazo. Combinamos el esfuerzo tradicional gallego con la tecnología de vanguardia para forjar leyendas.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-10 italic">Navegación</h4>
            <ul className="grid grid-cols-1 gap-5">
              <li><button onClick={() => scrollTo('about')} className="text-zinc-500 hover:text-red-500 transition-colors text-sm font-black uppercase italic tracking-widest text-left">Sobre nosotros</button></li>
              <li><button onClick={() => scrollTo('servicios')} className="text-zinc-500 hover:text-red-500 transition-colors text-sm font-black uppercase italic tracking-widest text-left">Nuestros Servicios</button></li>
              <li><button onClick={() => scrollTo('facilities')} className="text-zinc-500 hover:text-red-500 transition-colors text-sm font-black uppercase italic tracking-widest text-left">Instalaciones</button></li>
              <li><button onClick={() => scrollTo('educacion')} className="text-zinc-500 hover:text-red-500 transition-colors text-sm font-black uppercase italic tracking-widest text-left">IA Blog & Consejos</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div id="contact" className="scroll-mt-20">
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-10 italic">Ubicación & Contacto</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-5">
                <MapPin className="text-red-500 shrink-0 mt-1" size={20} />
                <span className="text-zinc-500 text-sm font-medium">Av. de Eugenio Sequeiros, 42, 36940 Cangas, Pontevedra</span>
              </li>
              <li className="flex items-center gap-5">
                <Phone className="text-red-500 shrink-0" size={20} />
                <span className="text-zinc-500 text-sm font-black">+34 648 12 34 56</span>
              </li>
              <li className="flex items-center gap-5">
                <Mail className="text-red-500 shrink-0" size={20} />
                <span className="text-zinc-500 text-sm font-black uppercase italic">forzacangasnutrition@gmail.es</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.2em]">
            © 2026 Forza Cangas Studio Nutrition. Todos los derechos reservados.
          </p>
          <div className="flex gap-10">
            <a href="#" className="text-zinc-700 hover:text-white text-[10px] font-black uppercase tracking-widest">Privacidad</a>
            <a href="#" className="text-zinc-700 hover:text-white text-[10px] font-black uppercase tracking-widest">Términos</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
