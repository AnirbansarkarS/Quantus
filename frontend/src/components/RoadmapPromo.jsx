import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Map, ArrowRight, Atom, Cpu, Code2, Network } from "lucide-react";

const steps = [
  {
    id: 1,
    title: "1. Classical Foundations",
    desc: "Linear algebra, Python, and logic gates as the bedrock before moving natively into quantum systems.",
    icon: <Cpu className="text-[#FAEB92]" size={36} />,
    color: "border-[#FAEB92]/50 text-[#FAEB92] bg-[#FAEB92]/10",
    gradient: "from-[#FAEB92]/20 to-transparent",
  },
  {
    id: 2,
    title: "2. Quantum Concepts",
    desc: "Qubits, Superposition, Entanglement, and Interference. Master the math scaling the Bloch sphere.",
    icon: <Atom className="text-[#CC66DA]" size={36} />,
    color: "border-[#CC66DA]/50 text-[#CC66DA] bg-[#CC66DA]/10",
    gradient: "from-[#CC66DA]/20 to-transparent",
  },
  {
    id: 3,
    title: "3. Qiskit Programming",
    desc: "Apply the principles computationally. Build and map algorithms running in your web browser.",
    icon: <Code2 className="text-[#9929EA]" size={36} />,
    color: "border-[#9929EA]/50 text-[#9929EA] bg-[#9929EA]/10",
    gradient: "from-[#9929EA]/20 to-transparent",
  },
  {
    id: 4,
    title: "4. Quantum Algorithms",
    desc: "VQE, Grover's, Shor's and near-term NISQ logic driving current computational advantages.",
    icon: <Network className="text-[#FAEB92]" size={36} />,
    color: "border-[#FAEB92]/50 text-[#FAEB92] bg-[#FAEB92]/10",
    gradient: "from-[#FAEB92]/20 to-transparent",
  }
];

export function RoadmapPromo() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="py-24 relative overflow-hidden bg-[#0A0A10]">
      <div className="absolute inset-0 bg-[#9929EA]/5 backdrop-blur-[100px] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center p-4 bg-[#9929EA]/10 rounded-full border border-[#9929EA]/30 mb-6 drop-shadow-[0_0_15px_rgba(153,41,234,0.3)]">
            <Map className="text-[#CC66DA]" size={48} />
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            The Learning <span className="bg-gradient-to-r from-[#FAEB92] via-[#CC66DA] to-[#9929EA] text-transparent bg-clip-text drop-shadow-sm">Roadmap</span>
          </h2>
          <p className="text-gray-400 text-xl max-w-3xl mx-auto leading-relaxed">
            A comprehensive, step-by-step pedagogical journey transitioning you from classical computation into actual applied quantum physics and coding.
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 flex flex-col gap-4 mb-12 lg:mb-0">
            {steps.map((step, idx) => {
              const isActive = idx === activeStep;
              return (
                <div 
                  key={step.id} 
                  onMouseEnter={() => setActiveStep(idx)}
                  className={`
                    relative rounded-2xl p-6 cursor-pointer transition-all duration-500 border-2 overflow-hidden
                    ${isActive 
                      ? `${step.color.split(' ')[0]} bg-[#1A1A2E]/90 scale-[1.02] shadow-[0_0_30px_rgba(153,41,234,0.15)]` 
                      : 'border-white/5 bg-[#1A1A2E]/40 hover:border-white/20'
                    }
                  `}
                >
                  {isActive && (
                    <div className={`absolute inset-y-0 -left-1/4 w-1/2 bg-gradient-to-r ${step.gradient} blur-3xl`} />
                  )}
                  
                  <div className="relative z-10 flex items-start gap-5">
                    <div className={`
                      flex shrink-0 items-center justify-center w-16 h-16 rounded-2xl transition-all duration-500 shadow-inner
                      ${isActive ? step.color : 'bg-white/5 text-gray-500 border border-white/10'}
                    `}>
                      {step.icon}
                    </div>
                    <div>
                      <h3 className={`text-2xl font-bold transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-400'}`}>
                        {step.title}
                      </h3>
                      <div className={`grid transition-all duration-500 ease-in-out ${isActive ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'}`}>
                        <p className="overflow-hidden text-gray-300 text-lg leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-5 relative w-full flex flex-col items-center justify-center pt-8 lg:pt-0">
            <div className={`absolute inset-0 blur-[100px] rounded-full opacity-40 transition-all duration-700 bg-gradient-to-tr ${steps[activeStep].gradient}`} />
            
            <div className="relative rounded-[2rem] border border-white/10 bg-[#1A1A2E]/80 backdrop-blur-xl p-10 w-full flex flex-col items-center text-center shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <div className="w-40 h-40 rounded-full border-4 border-white/5 flex items-center justify-center relative mb-8 shadow-inner">
                <div className={`absolute inset-0 rounded-full border-t-4 border-r-4 transition-colors duration-500 ${steps[activeStep].color.split(' ')[0]} animate-spin`} style={{ animationDuration: '3s' }} />
                <div className="bg-[#111118]/80 backdrop-blur-sm w-32 h-32 rounded-full flex items-center justify-center text-6xl font-black text-white drop-shadow-lg transition-transform hover:scale-110">
                  {steps[activeStep].id}
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Step {steps[activeStep].id}</h3>
              <p className="text-gray-400 mb-10 text-lg leading-relaxed">
                {steps[activeStep].desc} Ready to dive in? Follow the full curriculum to track your progress sequentially.
              </p>
              <Link
                to="/roadmap"
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#9929EA] to-[#CC66DA] hover:from-[#CC66DA] hover:to-[#FAEB92] text-white hover:text-black py-5 rounded-2xl font-bold text-lg transition-all shadow-[0_0_30px_rgba(153,41,234,0.3)] hover:shadow-[0_0_40px_rgba(204,102,218,0.5)] hover:-translate-y-1"
              >
                Access Full Roadmap <ArrowRight size={24} />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default RoadmapPromo;