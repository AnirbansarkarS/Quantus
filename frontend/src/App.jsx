import React, { useState } from "react";
import { Play, Sparkles, BookOpen, Atom, Cpu, Code2 } from "lucide-react";
import "./App.css";
import Antigravity from "./components/Antigravity";
import BorderGlow from "./components/BorderGlow";

function Navbar() {
  return (
    <nav className="fixed w-full z-50 bg-[#000000]/80 backdrop-blur-md border-b border-[#9929EA]/20 pointer-events-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Atom className="text-[#CC66DA]" size={28} />
            <span className="text-xl font-bold bg-gradient-to-r from-[#FAEB92] via-[#CC66DA] to-[#9929EA] text-transparent bg-clip-text">
              Quantus
            </span>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#" className="hover:text-[#FAEB92] text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Courses</a>
              <a href="#" className="text-[#FAEB92] px-3 py-2 rounded-md text-sm font-medium border-b-2 border-[#FAEB92]">Simulations</a>
              <a href="#" className="hover:text-[#FAEB92] text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">Research</a>
              <a href="#" className="hover:text-[#FAEB92] text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">Community</a>
            </div>
          </div>
          <div>
            <button className="bg-[#9929EA] hover:bg-[#CC66DA] text-white px-6 py-2 rounded-full font-medium transition-all shadow-[0_0_15px_rgba(153,41,234,0.5)]">
              Launch Simulator
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex flex-col items-center text-center px-4">
      {/* Abstract Wave decorative background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[1200px] opacity-40 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-[#9929EA] blur-[120px] rounded-full mix-blend-screen mix-blend-lighten" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-[#CC66DA] blur-[90px] rounded-full mix-blend-screen mix-blend-lighten" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-8 pointer-events-auto">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          Master the <span className="bg-gradient-to-r from-[#9929EA] via-[#CC66DA] to-[#FAEB92] text-transparent bg-clip-text">Quantum Realm</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
          Interactive simulations and deep learning for the quantum curious
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button className="w-full sm:w-auto px-8 py-3 bg-[#9929EA] hover:bg-[#CC66DA] text-white rounded-full font-semibold transition-all shadow-[0_0_20px_rgba(153,41,234,0.4)] flex items-center justify-center gap-2">
            <Play size={20} fill="currentColor" />
            Explore Simulations
          </button>
          <button className="w-full sm:w-auto px-8 py-3 bg-[#000000] border border-[#9929EA] hover:border-[#CC66DA] hover:bg-[#9929EA]/10 text-white rounded-full font-semibold transition-all flex items-center justify-center gap-2">
            <BookOpen size={20} />
            View Courses
          </button>
        </div>
      </div>
    </div>
  );
}

const simulations = [
  {
    id: 1,
    title: "Double-Slit Interference",
    desc: "Visualize superposition and interference patterns in interactive 3D.",
    tag: "Interactive",
    icon: <Sparkles className="text-[#FAEB92] mb-4" size={32} />,
    color: "from-[#9929EA] to-transparent",
  },
  {
    id: 2,
    title: "Photoelectric Effect",
    desc: "Experiment with photons, work functions, and electron emission.",
    tag: "Interactive",
    icon: <Atom className="text-[#CC66DA] mb-4" size={32} />,
    color: "from-[#CC66DA] to-transparent",
  },
  {
    id: 3,
    title: "Bloch Sphere",
    desc: "Manipulate qubit states intuitively via interactive rotations.",
    tag: "Interactive",
    icon: <Cpu className="text-[#FAEB92] mb-4" size={32} />,
    color: "from-[#9929EA] to-transparent",
  },
  {
    id: 4,
    title: "Schr�dinger Equation",
    desc: "Render and execute probabilistic wave functions in real time.",
    tag: "Deep Dive",
    icon: <Code2 className="text-[#CC66DA] mb-4" size={32} />,
    color: "from-[#9929EA] via-[#CC66DA] to-transparent",
  }
];

function ExperimentCards() {
  return (
    <section className="py-20 px-4 max-w-7xl mx-auto relative z-10 pointer-events-none overflow-visible">
      <div className="text-center mb-16 space-y-4 pointer-events-auto">
        <h2 className="text-3xl md:text-5xl font-bold">Interactive Experiments</h2>
        <p className="text-gray-400 text-lg">Interactive simulations and deep learning for the quantum curious</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 pointer-events-none overflow-visible">
        {simulations.map((sim, i) => (
          <div key={sim.id} className="pointer-events-auto h-full flex overflow-visible">
            <BorderGlow
              className="w-full flex-1"
              edgeSensitivity={32}
              glowColor="40 80 80"
              backgroundColor="#000000"
              borderRadius={16}
              glowRadius={58}
              glowIntensity={1.4}
              coneSpread={26}
              animated
              colors={['#9929EA', '#CC66DA', '#FAEB92']}
            >
              <div 
                className="group relative w-full h-full border border-[#9929EA]/30 hover:border-[#CC66DA] rounded-2xl p-6 transition-all hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(153,41,234,0.3)] overflow-hidden cursor-pointer flex flex-col items-center text-center bg-transparent"
              >
                <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${sim.color} opacity-20 blur-2xl rounded-full group-hover:opacity-40 transition-opacity`} />
                
                <div className="absolute top-4 right-4 bg-[#FAEB92]/10 border border-[#FAEB92]/30 text-[#FAEB92] text-xs px-2 py-1 rounded-full uppercase tracking-wider font-bold">
                  {sim.tag}
                </div>

                <div className="mt-8 mb-4">
                  {sim.icon}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{sim.title}</h3>
                <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                  {sim.desc}
                </p>
              </div>
            </BorderGlow>
          </div>
        ))}
      </div>
    </section>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-[#CC66DA] selection:text-white relative">
      <div className="fixed inset-0 z-0 pointer-events-auto">
        <Antigravity
          count={300}
          magnetRadius={10}
          ringRadius={10}
          waveSpeed={0.4}
          waveAmplitude={1}
          particleSize={2}
          lerpSpeed={0.1}
          color="#9806f9"
          autoAnimate={false}
          particleVariance={0.4}
          rotationSpeed={0.4}
          depthFactor={0.7}
          pulseSpeed={3}
          particleShape="sphere"
          fieldStrength={9}
        />
      </div>
      <div className="relative z-10 pointer-events-none">
        <Navbar />
        <Hero />
        <ExperimentCards />
      </div>
    </div>
  );
}

export default App;

