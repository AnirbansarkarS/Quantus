import React from 'react';

const Roadmap = () => {
  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-white">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-[#FAEB92] via-[#CC66DA] to-[#9929EA] text-transparent bg-clip-text text-center">
        Quantum Computing Roadmap
      </h1>
      
      <p className="text-gray-300 mb-8 text-lg">
        To teach quantum computing effectively, you need a structured roadmap that transitions students from classical foundations to hands-on programming. Based on the IBM Quantum Learning and Qiskit curricula, here is a detailed pedagogical roadmap.
      </p>

      <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#9929EA] before:to-transparent">
        
        {/* Step 1 */}
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0F172A] bg-[#9929EA] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:left-1/2 -ml-5 md:ml-0">
            1
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#1A1A2E]/80 border border-[#9929EA]/30 p-6 rounded-xl shadow-lg hover:shadow-[0_0_15px_rgba(153,41,234,0.3)] transition-all ml-12 md:ml-0">
            <h2 className="text-2xl font-bold text-[#FAEB92] mb-3">1. Foundation: The Prerequisite Toolkit (Weeks 1–4)</h2>
            <p className="text-gray-400 mb-4">Before diving into "quantum," students must be comfortable with the languages used to describe it.</p>
            <ul className="list-disc pl-5 space-y-2 text-gray-300">
              <li><strong>Linear Algebra:</strong> Focus on vectors, matrices, complex numbers, and inner products. Explain that quantum states are just vectors in a complex vector space.</li>
              <li><strong>Python Programming:</strong> Ensure students can use NumPy and basic object-oriented programming. Python is the industry standard for frameworks like Qiskit.</li>
              <li><strong>Classical Logic:</strong> Briefly review bits, logic gates (AND, OR, NOT), and how classical computers process information as a baseline for comparison.</li>
            </ul>
          </div>
        </div>

        {/* Step 2 */}
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0F172A] bg-[#CC66DA] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:left-1/2 -ml-5 md:ml-0">
            2
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#1A1A2E]/80 border border-[#CC66DA]/30 p-6 rounded-xl shadow-lg hover:shadow-[0_0_15px_rgba(204,102,218,0.3)] transition-all ml-12 md:ml-0">
            <h2 className="text-2xl font-bold text-[#FAEB92] mb-3">2. Quantum Fundamentals (Weeks 5–8)</h2>
            <p className="text-gray-400 mb-4">Introduce the core principles that distinguish quantum systems.</p>
            <ul className="list-disc pl-5 space-y-2 text-gray-300">
              <li><strong>The Qubit:</strong> Define the basic unit of quantum information and its mathematical representation.</li>
              <li><strong>Key Principles:</strong> Teach Superposition (being in multiple states), Entanglement (correlated qubits), and Interference.</li>
              <li><strong>Quantum Gates:</strong> Introduce the Bloch Sphere and gates like Hadamard (H), Pauli-X, and CNOT. Show how these gates manipulate qubit probabilities.</li>
            </ul>
          </div>
        </div>

        {/* Step 3 */}
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0F172A] bg-[#9929EA] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:left-1/2 -ml-5 md:ml-0">
            3
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#1A1A2E]/80 border border-[#9929EA]/30 p-6 rounded-xl shadow-lg hover:shadow-[0_0_15px_rgba(153,41,234,0.3)] transition-all ml-12 md:ml-0">
            <h2 className="text-2xl font-bold text-[#FAEB92] mb-3">3. Hands-on Programming with Qiskit (Weeks 9–12)</h2>
            <p className="text-gray-400 mb-4">Move from theory to code using the Qiskit patterns framework.</p>
            <ul className="list-disc pl-5 space-y-2 text-gray-300 text-sm">
              <li><strong>Circuit Building:</strong> Use the IBM Quantum Composer for visual building before moving to the Qiskit SDK.</li>
              <li><strong>The 4-Step Workflow:</strong>
                <ol className="list-decimal pl-5 mt-2 space-y-1">
                  <li><strong>Map:</strong> Convert the problem into circuits and operators.</li>
                  <li><strong>Optimize:</strong> Use transpilation to fit the circuit to specific hardware.</li>
                  <li><strong>Execute:</strong> Run on simulators first, then real hardware via Qiskit Runtime.</li>
                  <li><strong>Post-process:</strong> Interpret and visualize the results.</li>
                </ol>
              </li>
            </ul>
          </div>
        </div>

        {/* Step 4 */}
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0F172A] bg-[#CC66DA] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:left-1/2 -ml-5 md:ml-0">
            4
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#1A1A2E]/80 border border-[#CC66DA]/30 p-6 rounded-xl shadow-lg hover:shadow-[0_0_15px_rgba(204,102,218,0.3)] transition-all ml-12 md:ml-0">
            <h2 className="text-2xl font-bold text-[#FAEB92] mb-3">4. Essential Quantum Algorithms (Weeks 13–16)</h2>
            <p className="text-gray-400 mb-4">Demonstrate "Quantum Advantage" through classic algorithms.</p>
            <ul className="list-disc pl-5 space-y-2 text-gray-300">
              <li><strong>Oracular Algorithms:</strong> Deutsch-Jozsa and Bernstein-Vazirani to show speedups in specific logic tasks.</li>
              <li><strong>Search & Factoring:</strong> Grover's Algorithm (unstructured search) and Shor's Algorithm (integer factorization).</li>
              <li><strong>Near-term (NISQ) Applications:</strong> Introduce Variational Quantum Eigensolver (VQE) for chemistry simulations and QAOA for optimization.</li>
            </ul>
          </div>
        </div>

      </div>

      <div className="mt-16 bg-[#1A1A2E]/80 border border-[#9929EA]/30 p-8 rounded-xl">
         <h2 className="text-2xl font-bold text-[#FAEB92] mb-4">Recommended Teaching Resources</h2>
         <ul className="list-disc pl-5 space-y-3 text-gray-300">
           <li><strong>Textbooks:</strong> <a href="https://www.amazon.in/Learn-Quantum-Computing-Python-IBM/dp/1803244801" target="_blank" rel="noreferrer" className="text-[#CC66DA] hover:underline">Learn Quantum Computing with Python and IBM Quantum</a> (Packt Publishing) is updated for the latest Qiskit 1.x features.</li>
           <li><strong>Interactive Tools:</strong> Use IBM Quantum Learning for lab modules and NPTEL for structured university-level courses.</li>
           <li><strong>Hardware Roadmap:</strong> Keep students engaged by showing the IBM Quantum Roadmap, targeting first fault-tolerant systems by 2029.</li>
         </ul>
      </div>

    </div>
  );
};

export default Roadmap;