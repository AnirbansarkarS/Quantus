import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, Sparkles, Zap, Terminal } from 'lucide-react';

const words = [
  { text: "Quantum Realm", color: "from-[#9929EA] via-[#CC66DA] to-[#FAEB92]" },
  { text: "Classical Physics", color: "from-[#FAEB92] via-[#ff8844] to-[#ff4444]" },
  { text: "Qiskit SDk", color: "from-[#4488ff] via-[#44ffff] to-[#22eedd]" }
];

export function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex flex-col items-center text-center px-4 min-h-[90vh] justify-center">
      {/* Background Effects */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#9929EA]/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#CC66DA]/20 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-10 pointer-events-auto w-full">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#9929EA]/30 bg-[#9929EA]/10 backdrop-blur-sm text-sm font-medium text-[#FAEB92] mb-4 hover:bg-[#9929EA]/20 transition-colors cursor-default mx-auto relative group">
          <span className="w-2 h-2 rounded-full bg-[#FAEB92] animate-ping absolute left-4" />
          <span className="w-2 h-2 rounded-full bg-[#FAEB92] relative" />
          <span className="px-2">The Ultimate Physics Learning Platform</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight min-h-[3em] flex flex-col justify-center items-center gap-2 leading-tight">
          <span className="text-white drop-shadow-lg">Master the</span>
          <div className="relative w-full h-[1.3em] overflow-hidden mt-4">
            {words.map((word, i) => (
              <div
                key={word.text}
                className={`absolute w-full h-full flex items-center justify-center transition-all duration-700 ease-in-out ${
                  i === index 
                    ? 'opacity-100 translate-y-0 scale-100 z-10' 
                    : i < index 
                      ? 'opacity-0 -translate-y-12 scale-95 z-0' 
                      : 'opacity-0 translate-y-12 scale-95 z-0'
                }`}
              >
                <span className={`bg-gradient-to-r ${word.color} text-transparent bg-clip-text drop-shadow-2xl`}>
                  {word.text}
                </span>
              </div>
            ))}
          </div>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
          Interactive 3D simulations, real-world algorithms, and deep learning for the quantum curious. Transition from <span className="text-white font-medium">Newton</span> to <span className="text-[#CC66DA] font-medium">Schrödinger</span>.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 w-full max-w-2xl mx-auto">
          <Link to="/simulations" className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#9929EA] to-[#CC66DA] hover:from-[#CC66DA] hover:to-[#FAEB92] text-white hover:text-black rounded-full font-bold transition-all shadow-[0_0_20px_rgba(153,41,234,0.4)] hover:shadow-[0_0_40px_rgba(204,102,218,0.6)] hover:-translate-y-1 flex items-center justify-center gap-3 text-lg">
            <Play size={24} fill="currentColor" />
            Explore Simulations
          </Link>
          <Link to="/roadmap" className="group w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-[#9929EA]/50 hover:border-[#FAEB92] hover:bg-[#FAEB92]/10 text-white rounded-full font-bold transition-all flex items-center justify-center gap-3 text-lg hover:-translate-y-1">
            Start Learning
            <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-center border-t border-white/10 max-w-4xl mx-auto mt-12">
          <div className="space-y-1 p-4 rounded-2xl hover:bg-white/5 transition-colors cursor-default">
            <div className="text-4xl font-black text-[#FAEB92]">10+</div>
            <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Simulations</div>
          </div>
          <div className="space-y-1 p-4 rounded-2xl hover:bg-white/5 transition-colors cursor-default">
            <div className="text-4xl font-black text-[#CC66DA]">Real</div>
            <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Qiskit Code</div>
          </div>
          <div className="space-y-1 p-4 rounded-2xl hover:bg-white/5 transition-colors cursor-default">
            <div className="text-4xl font-black text-[#9929EA]">3D</div>
            <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Visualizations</div>
          </div>
          <div className="space-y-1 p-4 rounded-2xl hover:bg-white/5 transition-colors cursor-default">
            <div className="text-4xl font-black text-white">1</div>
            <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Unified Roadmap</div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Hero;