
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Facilities from './components/Facilities';
import Education from './components/Education';
import NutritionForm from './components/NutritionForm';
import ForzaFuel from './components/ForzaFuel';
import FoodExchanger from './components/FoodExchanger';
import ProgressTracker from './components/ProgressTracker';
import Pricing from './components/Pricing';
import Footer from './components/Footer';
import { UserData, NutritionPlan, QuestionnaireData } from './types';
import { generateNutritionPlan } from './services/geminiService';

const App: React.FC = () => {
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePlan = async (userData: UserData, healthData: QuestionnaireData) => {
    setIsLoading(true);
    setError(null);
    try {
      const plan = await generateNutritionPlan(userData, healthData);
      setNutritionPlan(plan);
      setTimeout(() => {
        document.getElementById('forza-nutrition')?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } catch (err) {
      setError('Error en la conexión con la red Forza Cangas. Reintenta en unos instantes.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen selection:bg-red-500/30 selection:text-red-500 bg-zinc-950">
      <Navbar />
      
      <main>
        <Hero />
        <About />
        <Services />
        <Facilities />
        <Education />
        
        <NutritionForm onSubmit={handleGeneratePlan} isLoading={isLoading} />
        
        {error && (
          <div className="max-w-4xl mx-auto px-4 -mt-8 mb-12">
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-8 rounded-[2.5rem] text-center font-black uppercase italic">
              {error}
            </div>
          </div>
        )}

        <ForzaFuel plan={nutritionPlan} isLoading={isLoading} />
        
        <FoodExchanger />

        <ProgressTracker />

        <Pricing />

        {/* Final CTA */}
        <section className="py-32 relative overflow-hidden bg-zinc-950">
          <div className="absolute inset-0 z-0">
             <img 
               src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=2000" 
               className="w-full h-full object-cover opacity-10" 
               alt="Nutrition background" 
             />
             <div className="absolute inset-0 bg-red-600/5 mix-blend-overlay"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="text-6xl md:text-8xl font-black mb-10 uppercase tracking-tighter leading-none italic text-white">
              TU DESTINO <br/><span className="text-red-500">ES HOY</span>
            </h2>
            <button 
              onClick={() => document.getElementById('nutrition-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-block px-16 py-8 bg-white text-zinc-950 font-black rounded-[2rem] text-2xl hover:bg-zinc-200 transition-all transform hover:scale-105 shadow-2xl uppercase italic tracking-tighter"
            >
              Recalcular mi estrategia
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default App;
