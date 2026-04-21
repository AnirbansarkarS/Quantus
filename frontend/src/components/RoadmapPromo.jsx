import React from "react";
import { Link } from "react-router-dom";
import { Map, ArrowRight } from "lucide-react";

export function RoadmapPromo() {
  return (
    <div className="py-24 relative overflow-hidden bg-[#0A0A10]">
      <div className="absolute inset-0 bg-[#9929EA]/5 backdrop-blur-[100px] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-gradient-to-r from-[#1A1A2E]/90 to-[#2A1B38]/90 border border-[#9929EA]/30 rounded-[2rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_0_50px_rgba(153,41,234,0.15)]">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6">
              <Map className="text-[#CC66DA]" size={40} />
              <h2 className="text-3xl md:text-5xl font-bold text-white">
                The Learning <span className="bg-gradient-to-r from-[#FAEB92] via-[#CC66DA] to-[#9929EA] text-transparent bg-clip-text">Roadmap</span>
              </h2>
            </div>
            <p className="text-gray-300 text-lg mb-8 max-w-3xl leading-relaxed">
              To teach quantum computing effectively, you need a structured roadmap that transitions from classical foundations to hands-on programming. Incorporates classical physics, quantum physics, and Qiskit.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 w-full max-w-3xl">
              <div className="bg-[#0A0A10]/50 p-4 rounded-xl border border-[#FAEB92]/30 flex items-center gap-4 hover:border-[#FAEB92]/60 transition-colors">
                <span className="w-8 h-8 rounded-full bg-[#FAEB92]/20 text-[#FAEB92] flex items-center justify-center font-bold">1</span>
                <span className="text-white font-medium">Foundation</span>
              </div>
              <div className="bg-[#0A0A10]/50 p-4 rounded-xl border border-[#CC66DA]/30 flex items-center gap-4 hover:border-[#CC66DA]/60 transition-colors">
                <span className="w-8 h-8 rounded-full bg-[#CC66DA]/20 text-[#CC66DA] flex items-center justify-center font-bold">2</span>
                <span className="text-white font-medium">Quantum Fundamentals</span>
              </div>
              <div className="bg-[#0A0A10]/50 p-4 rounded-xl border border-[#9929EA]/30 flex items-center gap-4 hover:border-[#9929EA]/60 transition-colors">
                <span className="w-8 h-8 rounded-full bg-[#9929EA]/20 text-[#9929EA] flex items-center justify-center font-bold">3</span>
                <span className="text-white font-medium">Hands-on Qiskit</span>
              </div>
              <div className="bg-[#0A0A10]/50 p-4 rounded-xl border border-[#FAEB92]/30 flex items-center gap-4 hover:border-[#FAEB92]/60 transition-colors">
                <span className="w-8 h-8 rounded-full bg-[#FAEB92]/20 text-[#FAEB92] flex items-center justify-center font-bold">4</span>
                <span className="text-white font-medium">Essential Algorithms</span>
              </div>
            </div>
            <Link
              to="/roadmap"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#9929EA] to-[#CC66DA] text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-[0_0_20px_rgba(153,41,234,0.4)] hover:shadow-[0_0_30px_rgba(204,102,218,0.6)] hover:-translate-y-1 hover:scale-105"
            >
              Explore the Full Curriculum <ArrowRight size={24} />
            </Link>
          </div>
          <div className="hidden lg:block w-1/3 relative shrink-0">
             <div className="absolute inset-0 bg-[#CC66DA] blur-[100px] opacity-20 rounded-full" />
             <div className="relative border-4 border-[#CC66DA]/30 rounded-3xl p-8 bg-[#1A1A2E]/50 backdrop-blur-sm rotate-3 transform hover:rotate-0 transition-transform duration-500">
                <Map size={150} className="mx-auto text-white opacity-80" strokeWidth={1} />
                <div className="absolute top-4 right-4 bg-[#FAEB92] text-black text-xs font-bold px-2 py-1 rounded">2029 Goal</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoadmapPromo;