import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RotateCw, RotateCcw } from "lucide-react";

// Quantum gate implementations
const quantumGates = {
  I: [[1, 0], [0, 1]], // Identity
  X: [[0, 1], [1, 0]], // Pauli X
  Y: [[0, { real: 0, imag: -1 }], [{ real: 0, imag: 1 }, 0]], // Pauli Y
  Z: [[1, 0], [0, -1]], // Pauli Z
  H: [[1/Math.sqrt(2), 1/Math.sqrt(2)], [1/Math.sqrt(2), -1/Math.sqrt(2)]], // Hadamard
  S: [[1, 0], [0, { real: 0, imag: 1 }]], // S gate
  T: [[1, 0], [0, { real: Math.cos(Math.PI/4), imag: Math.sin(Math.PI/4) }]], // T gate
};

// Complex number operations
const complexOps = {
  mult: (a, b) => {
    if (typeof a === "number" && typeof b === "number") return a * b;
    const aReal = typeof a === "number" ? a : a.real;
    const aImag = typeof a === "number" ? 0 : a.imag;
    const bReal = typeof b === "number" ? b : b.real;
    const bImag = typeof b === "number" ? 0 : b.imag;
    return {
      real: aReal * bReal - aImag * bImag,
      imag: aReal * bImag + aImag * bReal,
    };
  },
  add: (a, b) => {
    const aReal = typeof a === "number" ? a : a.real;
    const aImag = typeof a === "number" ? 0 : a.imag;
    const bReal = typeof b === "number" ? b : b.real;
    const bImag = typeof b === "number" ? 0 : b.imag;
    return {
      real: aReal + bReal,
      imag: aImag + bImag,
    };
  },
  magnitude: (c) => {
    const real = typeof c === "number" ? c : c.real || 0;
    const imag = typeof c === "number" ? 0 : c.imag || 0;
    return Math.sqrt(real * real + imag * imag);
  },
};

// Apply gate to state vector
const applyGate = (state, gate) => {
  const result = [{ real: 0, imag: 0 }, { real: 0, imag: 0 }];
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      result[i] = complexOps.add(result[i], complexOps.mult(gate[i][j], state[j]));
    }
  }
  return result;
};

// Convert state vector to Bloch coordinates
const stateToBloch = (state) => {
  // |ψ⟩ = α|0⟩ + β|1⟩
  const alpha = state[0];
  const beta = state[1];

  const alphaReal = typeof alpha === "number" ? alpha : alpha.real || 0;
  const alphaImag = typeof alpha === "number" ? 0 : alpha.imag || 0;
  const betaReal = typeof beta === "number" ? beta : beta.real || 0;
  const betaImag = typeof beta === "number" ? 0 : beta.imag || 0;

  // Compute Bloch vector components
  // X = ⟨σ_x⟩ = 2Re(α*β)
  // Y = ⟨σ_y⟩ = 2Im(α*β)
  // Z = ⟨σ_z⟩ = |α|² - |β|²

  const alpha_conj_beta_real = alphaReal * betaReal + alphaImag * betaImag;
  const alpha_conj_beta_imag = alphaImag * betaReal - alphaReal * betaImag;

  const x = 2 * alpha_conj_beta_real;
  const y = 2 * alpha_conj_beta_imag;
  const z = (alphaReal * alphaReal + alphaImag * alphaImag) - (betaReal * betaReal + betaImag * betaImag);

  return { x, y, z };
};

export default function BlochSphere() {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const sphereRef = useRef(null);
  const arrowRef = useRef(null);
  const targetDirRef = useRef(new THREE.Vector3(0, 0, 1));
  const currentDirRef = useRef(new THREE.Vector3(0, 0, 1));
  const [state, setState] = useState([
    { real: 1, imag: 0 }, // |0⟩ state
    { real: 0, imag: 0 },
  ]);
  const [bloch, setBloch] = useState({ x: 0, y: 0, z: 1 });
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 3;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0.1);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Group objects to rotate together
    const pivot = new THREE.Group();
    scene.add(pivot);

    // Bloch sphere (wireframe)
    const sphereGeometry = new THREE.IcosahedronGeometry(1, 16);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x9929ea,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    pivot.add(sphere);
    sphereRef.current = sphere;

    // Axes
    const axesLength = 1.3;
    const xAxis = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-axesLength, 0, 0),
        new THREE.Vector3(axesLength, 0, 0),
      ]),
      new THREE.LineBasicMaterial({ color: 0xcc66da })
    );
    const yAxis = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, -axesLength, 0),
        new THREE.Vector3(0, axesLength, 0),
      ]),
      new THREE.LineBasicMaterial({ color: 0xfaeb92 })
    );
    const zAxis = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, -axesLength),
        new THREE.Vector3(0, 0, axesLength),
      ]),
      new THREE.LineBasicMaterial({ color: 0x40ff40 })
    );
    pivot.add(xAxis, yAxis, zAxis);

    // State vector arrow
    const arrowHelper = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, 0),
      1,
      0x00ffff
    );
    pivot.add(arrowHelper);
    arrowRef.current = arrowHelper;

    // Add OrbitControls for perfect drag, rotate, and hold interaction
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false; // Prevents zooming in/out to keep the sphere fixed size
    controls.enablePan = false; // Disable right click pan

    // Animation loop
    const baseVector = new THREE.Vector3(0, 1, 0); // ArrowHelper default direction points up
    
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update(); // Required for damping

      // Smoothly interpolate the arrow direction using quaternions
      if (arrowRef.current && targetDirRef.current && currentDirRef.current) {
        // We use slerp on currentDir to targetDir
        currentDirRef.current.lerp(targetDirRef.current, 0.05).normalize();
        arrowRef.current.setDirection(currentDirRef.current);
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update arrow based on state
  useEffect(() => {
    const blochCoords = stateToBloch(state);
    setBloch(blochCoords);

    if (targetDirRef.current) {
      targetDirRef.current.set(blochCoords.x, blochCoords.y, blochCoords.z).normalize();
    }
  }, [state]);

  const applyQuantumGate = (gateName) => {
    const gate = quantumGates[gateName];
    if (!gate) return;
    const newState = applyGate(state, gate);
    setState(newState);
  };

  const resetState = () => {
    setState([
      { real: 1, imag: 0 },
      { real: 0, imag: 0 },
    ]);
    setRotation({ x: 0, y: 0 });
  };

  const formatComplex = (c) => {
    const real = typeof c === "number" ? c : c.real || 0;
    const imag = typeof c === "number" ? 0 : c.imag || 0;
    const realStr = real.toFixed(3);
    const imagStr = imag.toFixed(3);
    if (imag === 0) return realStr;
    if (imag > 0) return `${realStr} + ${imagStr}i`;
    return `${realStr} - ${Math.abs(imag).toFixed(3)}i`;
  };

  const magnitude0 = complexOps.magnitude(state[0]);
  const magnitude1 = complexOps.magnitude(state[1]);

  return (
    <section className="py-20 px-4 max-w-6xl mx-auto relative z-10 pointer-events-none overflow-visible pt-32">
      <div className="text-center mb-12 space-y-4 pointer-events-auto">
        <h2 className="text-3xl md:text-5xl font-bold">Bloch Sphere</h2>
        <p className="text-gray-400 text-lg">Interactive qubit visualization and quantum gate operations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pointer-events-auto">
        {/* 3D Visualization */}
        <div className="lg:col-span-2">
          <div
            ref={containerRef}
            className="w-full h-96 md:h-[500px] bg-gradient-to-br from-[#9929EA]/10 to-[#CC66DA]/10 rounded-2xl border border-[#9929EA]/30 overflow-hidden"
          />
          <p className="text-gray-400 text-sm mt-2">Drag to rotate the Bloch sphere</p>
        </div>

        {/* Controls and Info */}
        <div className="space-y-6 pointer-events-auto">
          {/* State Vector */}
          <div className="bg-[#0a0a0a] border border-[#9929EA]/30 rounded-xl p-4">
            <h3 className="text-lg font-bold text-[#FAEB92] mb-4">State Vector</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-400">α (|0⟩):</p>
                <p className="text-white font-mono">{formatComplex(state[0])}</p>
              </div>
              <div>
                <p className="text-gray-400">β (|1⟩):</p>
                <p className="text-white font-mono">{formatComplex(state[1])}</p>
              </div>
            </div>
          </div>

          {/* Probabilities */}
          <div className="bg-[#0a0a0a] border border-[#9929EA]/30 rounded-xl p-4">
            <h3 className="text-lg font-bold text-[#FAEB92] mb-4">Measurement</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-400">P(|0⟩):</p>
                <p className="text-white">{(magnitude0 * magnitude0 * 100).toFixed(1)}%</p>
                <div className="w-full bg-[#9929EA]/20 h-2 rounded mt-1 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#9929EA] to-[#CC66DA]"
                    style={{ width: `${magnitude0 * magnitude0 * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <p className="text-gray-400">P(|1⟩):</p>
                <p className="text-white">{(magnitude1 * magnitude1 * 100).toFixed(1)}%</p>
                <div className="w-full bg-[#9929EA]/20 h-2 rounded mt-1 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#CC66DA] to-[#FAEB92]"
                    style={{ width: `${magnitude1 * magnitude1 * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bloch Coordinates */}
          <div className="bg-[#0a0a0a] border border-[#9929EA]/30 rounded-xl p-4">
            <h3 className="text-lg font-bold text-[#FAEB92] mb-4">Bloch Vector</h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="text-gray-400">
                X: <span className="text-[#CC66DA]">{bloch.x.toFixed(3)}</span>
              </div>
              <div className="text-gray-400">
                Y: <span className="text-[#FAEB92]">{bloch.y.toFixed(3)}</span>
              </div>
              <div className="text-gray-400">
                Z: <span className="text-green-400">{bloch.z.toFixed(3)}</span>
              </div>
            </div>
          </div>

          {/* Quantum Gates */}
          <div className="bg-[#0a0a0a] border border-[#9929EA]/30 rounded-xl p-4">
            <h3 className="text-lg font-bold text-[#FAEB92] mb-4">Quantum Gates</h3>
            <div className="grid grid-cols-2 gap-2">
              {["X", "Y", "Z", "H", "S", "T"].map((gate) => (
                <button
                  key={gate}
                  onClick={() => applyQuantumGate(gate)}
                  className="px-3 py-2 bg-[#9929EA] hover:bg-[#CC66DA] text-white text-sm font-bold rounded-lg transition-all"
                >
                  {gate}
                </button>
              ))}
            </div>
            <button
              onClick={resetState}
              className="w-full mt-4 px-3 py-2 bg-[#000000] border border-[#FAEB92]/50 hover:border-[#FAEB92] text-[#FAEB92] text-sm font-bold rounded-lg transition-all"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
