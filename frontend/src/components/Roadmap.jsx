import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const roadmapData = [
  {
    id: "foundation",
    step: "01",
    title: "Foundation: The Prerequisite Toolkit",
    duration: "Weeks 1–4",
    desc: "Before diving into quantum computing, you must be comfortable with the classical languages used to describe it.",
    points: [
      "Linear Algebra: Focus on vectors, matrices, complex numbers.",
      "Python Programming: NumPy and basic object-oriented programming.",
      "Classical Logic: Bits, logic gates (AND, OR, NOT) as a baseline."
    ],
    color: "#9929EA",
  },
  {
    id: "fundamentals",
    step: "02",
    title: "Quantum Fundamentals",
    duration: "Weeks 5–8",
    desc: "Introduce the core physical and mathematical principles that distinguish quantum systems from classical ones.",
    points: [
      "The Qubit: Mathematical representation and basics.",
      "Key Principles: Superposition, Entanglement, and Interference.",
      "Quantum Gates: Bloch Sphere, Hadamard, Pauli-X, CNOT."
    ],
    color: "#CC66DA",
  },
  {
    id: "qiskit",
    step: "03",
    title: "Hands-on Programming with Qiskit",
    duration: "Weeks 9–12",
    desc: "Move from abstract theory directly into code using the IBM Qiskit framework.",
    points: [
      "Circuit Building: Using IBM Quantum Composer.",
      "Optimization: Hardware-specific transpilation.",
      "Execution: Simulators vs. Real Hardware via Qiskit Runtime."
    ],
    color: "#FAEB92",
  },
  {
    id: "algorithms",
    step: "04",
    title: "Essential Quantum Algorithms",
    duration: "Weeks 13–16",
    desc: "Demonstrate true 'Quantum Advantage' through classical algorithms running on quantum simulators.",
    points: [
      "Oracular Algorithms: Deutsch-Jozsa and Bernstein-Vazirani.",
      "Search & Factoring: Grover's unstructured search and Shor's algorithm.",
      "Near-term Applications: VQE and QAOA."
    ],
    color: "#ff8844",
  }
];

const Roadmap = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, type: "spring", stiffness: 300, damping: 30 }
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.5, type: "spring", stiffness: 300, damping: 30 }
    })
  };

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => (prev + newDirection + roadmapData.length) % roadmapData.length);
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-white overflow-hidden">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Interactive <span className="bg-gradient-to-r from-[#FAEB92] via-[#CC66DA] to-[#9929EA] text-transparent bg-clip-text">Roadmap</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Swipe through our structured curriculum from classical foundations to quantum algorithms.
        </p>
      </div>

      <div className="relative h-[550px] md:h-[450px] flex items-center justify-center">
        {/* Navigation Buttons */}
        <button 
          onClick={() => paginate(-1)}
          className="absolute left-0 md:-left-12 z-20 p-3 bg-[#1A1A2E]/80 border border-[#9929EA]/50 rounded-full hover:bg-[#9929EA]/30 transition-all focus:outline-none backdrop-blur-md"
        >
          <ChevronLeft size={32} className="text-[#FAEB92]" />
        </button>

        <button 
          onClick={() => paginate(1)}
          className="absolute right-0 md:-right-12 z-20 p-3 bg-[#1A1A2E]/80 border border-[#9929EA]/50 rounded-full hover:bg-[#9929EA]/30 transition-all focus:outline-none backdrop-blur-md"
        >
          <ChevronRight size={32} className="text-[#FAEB92]" />
        </button>

        {/* Swipeable Carousel */}
        <div className="w-full h-full relative flex items-center justify-center perspective-[1000px]">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = offset.x;
                if (swipe < -100) paginate(1);
                else if (swipe > 100) paginate(-1);
              }}
              className="absolute w-full max-w-3xl"
            >
              <div 
                className="bg-[#1A1A2E]/90 backdrop-blur-xl border-2 p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden group"
                style={{ borderColor: `${roadmapData[currentIndex].color}40` }}
              >
                {/* Background glow */}
                <div 
                  className="absolute -top-24 -right-24 w-64 h-64 blur-[100px] opacity-30 group-hover:opacity-50 transition-opacity duration-700" 
                  style={{ backgroundColor: roadmapData[currentIndex].color }}
                />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-6xl font-black text-white/10" style={{ color: `${roadmapData[currentIndex].color}40` }}>
                      {roadmapData[currentIndex].step}
                    </span>
                    <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-white/5 border border-white/10" style={{ color: roadmapData[currentIndex].color }}>
                      {roadmapData[currentIndex].duration}
                    </span>
                  </div>

                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                    {roadmapData[currentIndex].title}
                  </h2>
                  <p className="text-gray-300 text-lg mb-8">
                    {roadmapData[currentIndex].desc}
                  </p>

                  <ul className="space-y-4 mb-8">
                    {roadmapData[currentIndex].points.map((point, idx) => (
                      <li key={idx} className="flex items-start">
                        <div className="mr-3 mt-1.5 rounded-full w-2 h-2 shrink-0" style={{ backgroundColor: roadmapData[currentIndex].color }} />
                        <span className="text-gray-400">{point}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-6 border-t border-white/10">
                    <Link
                      to={`/roadmap/${roadmapData[currentIndex].id}`}
                      className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-black transition-all hover:scale-105"
                      style={{ backgroundColor: roadmapData[currentIndex].color, boxShadow: `0 0 20px ${roadmapData[currentIndex].color}60` }}
                    >
                      Start Module <ArrowRight size={20} />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-3 mt-12">
        {roadmapData.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'w-10 bg-[#FAEB92]' : 'bg-gray-600 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Roadmap;
