import React, { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { Play, Sparkles, BookOpen, Atom, Cpu, Code2, Menu, X, Zap, Rocket, CircleDot, Waves, FlaskConical, Orbit, Terminal } from "lucide-react";
import "./App.css";
import Antigravity from "./components/Antigravity";
import BorderGlow from "./components/BorderGlow";
import BlochSphere from "./components/BlochSphere";
import DoubleSlit from "./components/DoubleSlit";
import PhotoelectricEffect from "./components/PhotoelectricEffect";
import SchrodingerEquation from "./components/SchrodingerEquation";
import ProjectileMotion from "./components/ProjectileMotion";
import Pendulum from "./components/Pendulum";
import SpringOscillator from "./components/SpringOscillator";
import QiskitPlayground from "./components/QiskitPlayground";
import Roadmap from "./components/Roadmap";
import RoadmapPromo from "./components/RoadmapPromo";
import { Hero } from "./components/HeroAnimation";

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 bg-[#000000]/80 backdrop-blur-md border-b border-[#9929EA]/20 pointer-events-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Atom className="text-[#CC66DA]" size={28} />
            <span className="text-xl font-bold bg-gradient-to-r from-[#FAEB92] via-[#CC66DA] to-[#9929EA] text-transparent bg-clip-text">
              Quantus
            </span>
          </Link>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link to="/" className="hover:text-[#FAEB92] text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</Link>
              <Link to="/simulations" className="hover:text-[#FAEB92] text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">Simulations</Link>
              <Link to="/roadmap" className="hover:text-[#FAEB92] text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">Roadmap</Link>
              <Link to="/playground" className="hover:text-[#FAEB92] text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1">
                <Terminal size={14} /> Playground
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <Link to="/playground" className="bg-[#9929EA] hover:bg-[#CC66DA] text-white px-6 py-2 rounded-full font-medium transition-all shadow-[0_0_15px_rgba(153,41,234,0.5)]">
              Launch Playground
            </Link>
          </div>
          <button
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-[#9929EA]/20">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-sm font-medium text-white hover:text-[#FAEB92] hover:bg-[#9929EA]/10 transition-colors">Home</Link>
            <Link to="/simulations" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-[#FAEB92] hover:bg-[#9929EA]/10 transition-colors">Simulations</Link>
            <Link to="/roadmap" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-[#FAEB92] hover:bg-[#9929EA]/10 transition-colors">Roadmap</Link>
            <Link to="/playground" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-[#FAEB92] hover:bg-[#9929EA]/10 transition-colors">Playground</Link>
            <Link to="/playground" onClick={() => setMobileMenuOpen(false)} className="block w-full mt-4 text-center bg-[#9929EA] hover:bg-[#CC66DA] text-white px-6 py-2 rounded-full font-medium transition-all">
              Launch Playground
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

const quantumSimulations = [
  {
    id: 1,
    title: "Double-Slit Interference",
    desc: "Visualize superposition and interference patterns as particles build up.",
    tag: "Interactive",
    icon: <Sparkles className="text-[#FAEB92] mb-4" size={32} />,
    color: "from-[#9929EA] to-transparent",
    route: "/double-slit",
  },
  {
    id: 2,
    title: "Photoelectric Effect",
    desc: "Experiment with photons, work functions, and electron emission.",
    tag: "Interactive",
    icon: <Zap className="text-[#CC66DA] mb-4" size={32} />,
    color: "from-[#CC66DA] to-transparent",
    route: "/photoelectric",
  },
  {
    id: 3,
    title: "Bloch Sphere",
    desc: "Manipulate qubit states via interactive quantum gate operations.",
    tag: "Interactive",
    icon: <Cpu className="text-[#FAEB92] mb-4" size={32} />,
    color: "from-[#9929EA] to-transparent",
    route: "/bloch-sphere",
  },
  {
    id: 4,
    title: "Schrödinger Equation",
    desc: "Render probabilistic wave functions evolving in real time.",
    tag: "Deep Dive",
    icon: <Waves className="text-[#CC66DA] mb-4" size={32} />,
    color: "from-[#9929EA] via-[#CC66DA] to-transparent",
    route: "/schrodinger",
  },
];

const classicalSimulations = [
  {
    id: 5,
    title: "Projectile Motion",
    desc: "Launch projectiles and study parabolic trajectories in 3D.",
    tag: "Interactive",
    icon: <Rocket className="text-[#ff8844] mb-4" size={32} />,
    color: "from-[#ff8844] to-transparent",
    route: "/projectile",
  },
  {
    id: 6,
    title: "Simple Pendulum",
    desc: "Explore harmonic motion with adjustable length, mass, and gravity.",
    tag: "Interactive",
    icon: <CircleDot className="text-[#FAEB92] mb-4" size={32} />,
    color: "from-[#FAEB92] to-transparent",
    route: "/pendulum",
  },
  {
    id: 7,
    title: "Spring Oscillator",
    desc: "Study simple harmonic motion with a spring-mass system and damping.",
    tag: "Interactive",
    icon: <Orbit className="text-[#CC66DA] mb-4" size={32} />,
    color: "from-[#CC66DA] to-transparent",
    route: "/spring",
  },
];

function SimulationCard({ sim }) {
  return (
    <div className="pointer-events-auto h-full flex overflow-visible">
      <Link to={sim.route} className="w-full flex-1">
        <BorderGlow
          className="w-full h-full"
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
          <div className="group relative w-full h-full border border-[#9929EA]/30 hover:border-[#CC66DA] rounded-2xl p-6 transition-all hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(153,41,234,0.3)] overflow-hidden cursor-pointer flex flex-col items-center text-center bg-transparent">
            <div className={`absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br ${sim.color} opacity-20 blur-2xl rounded-full group-hover:opacity-40 transition-opacity`} />
            <div className="absolute top-4 right-4 bg-[#FAEB92]/10 border border-[#FAEB92]/30 text-[#FAEB92] text-xs px-2 py-1 rounded-full uppercase tracking-wider font-bold">
              {sim.tag}
            </div>
            <div className="mt-8 mb-4">{sim.icon}</div>
            <h3 className="text-xl font-bold text-white mb-2">{sim.title}</h3>
            <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{sim.desc}</p>
          </div>
        </BorderGlow>
      </Link>
    </div>
  );
}

function ExperimentSection({ title, subtitle, simulations, gradient }) {
  return (
    <section className="py-16 px-4 max-w-7xl mx-auto relative z-10 pointer-events-none overflow-visible">
      <div className="text-center mb-12 space-y-4 pointer-events-auto">
        <h2 className="text-3xl md:text-5xl font-bold">
          {title.split(" ").slice(0, -1).join(" ")}{" "}
          <span className={`bg-gradient-to-r ${gradient} text-transparent bg-clip-text`}>
            {title.split(" ").slice(-1)}
          </span>
        </h2>
        <p className="text-gray-400 text-lg">{subtitle}</p>
      </div>
      <div className={`grid grid-cols-1 md:grid-cols-2 ${simulations.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-6 pt-4 pointer-events-none overflow-visible`}>
        {simulations.map((sim) => (
          <SimulationCard key={sim.id} sim={sim} />
        ))}
      </div>
    </section>
  );
}

function PlaygroundPromo() {
  return (
    <section className="py-16 px-4 max-w-5xl mx-auto relative z-10 pointer-events-auto">
      <div className="relative overflow-hidden rounded-2xl border border-[#9929EA]/30 p-8 md:p-12 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#9929EA]/10 via-transparent to-[#CC66DA]/10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[#9929EA] blur-[120px] opacity-10 rounded-full" />
        <div className="relative z-10 space-y-6">
          <div className="flex justify-center">
            <div className="p-3 bg-[#9929EA]/20 rounded-2xl border border-[#9929EA]/30">
              <Terminal size={40} className="text-[#FAEB92]" />
            </div>
          </div>
          <h2 className="text-2xl md:text-4xl font-bold">
            Quantum <span className="bg-gradient-to-r from-[#9929EA] via-[#CC66DA] to-[#FAEB92] text-transparent bg-clip-text">Playground</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Write Qiskit-style code, visualize quantum circuits, and simulate measurements — all in your browser. Choose from templates like Bell States, GHZ, Teleportation, and Grover's algorithm.
          </p>
          <Link
            to="/playground"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#9929EA] to-[#CC66DA] hover:from-[#CC66DA] hover:to-[#FAEB92] text-white rounded-full font-semibold transition-all shadow-[0_0_20px_rgba(153,41,234,0.3)]"
          >
            <Terminal size={18} /> Open Playground
          </Link>
        </div>
      </div>
    </section>
  );
}

function Home() {
  return (
    <>
      <Hero />
      <RoadmapPromo />
      <PlaygroundPromo />
    </>
  );
}

function Simulations() {
  return (
    <div className="pt-24 pb-12">
      <div className="text-center mb-8 px-4 relative z-10 pointer-events-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          Interactive <span className="bg-gradient-to-r from-[#FAEB92] via-[#CC66DA] to-[#9929EA] text-transparent bg-clip-text">Simulations</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Dive into our comprehensive collection of physics simulations, ranging from foundational classical mechanics to advanced quantum phenomena.
        </p>
      </div>
      <ExperimentSection
        title="Quantum Physics"
        subtitle="Interactive simulations for quantum mechanics concepts"
        simulations={quantumSimulations}
        gradient="from-[#9929EA] via-[#CC66DA] to-[#FAEB92]"
      />
      <ExperimentSection
        title="Classical Physics"
        subtitle="Foundational mechanics with 3D interactive simulations"
        simulations={classicalSimulations}
        gradient="from-[#FAEB92] via-[#ff8844] to-[#ff4444]"
      />
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-[#CC66DA] selection:text-white relative">
      <div className="fixed inset-0 z-0 pointer-events-none">
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
      <div className="relative z-10 pointer-events-auto">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/simulations" element={<Simulations />} />
          <Route path="/bloch-sphere" element={<BlochSphere />} />
          <Route path="/double-slit" element={<DoubleSlit />} />
          <Route path="/photoelectric" element={<PhotoelectricEffect />} />
          <Route path="/schrodinger" element={<SchrodingerEquation />} />
          <Route path="/projectile" element={<ProjectileMotion />} />
          <Route path="/pendulum" element={<Pendulum />} />
          <Route path="/spring" element={<SpringOscillator />} />
          <Route path="/playground" element={<QiskitPlayground />} />
          <Route path="/roadmap" element={<Roadmap />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
