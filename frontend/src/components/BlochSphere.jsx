import React, { useRef, useState, useMemo, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Line } from "@react-three/drei";
import * as THREE from "three";
import { Link } from "react-router-dom";
import { ArrowLeft, RotateCw } from "lucide-react";

// ─── Quantum math ───────────────────────────────────────────────
const complex = (r, i = 0) => ({ real: r, imag: i });
const cmul = (a, b) => {
  const ar = typeof a === "number" ? a : a.real;
  const ai = typeof a === "number" ? 0 : a.imag;
  const br = typeof b === "number" ? b : b.real;
  const bi = typeof b === "number" ? 0 : b.imag;
  return { real: ar * br - ai * bi, imag: ar * bi + ai * br };
};
const cadd = (a, b) => {
  const ar = typeof a === "number" ? a : a.real;
  const ai = typeof a === "number" ? 0 : a.imag;
  const br = typeof b === "number" ? b : b.real;
  const bi = typeof b === "number" ? 0 : b.imag;
  return { real: ar + br, imag: ai + bi };
};
const cmag = (c) => {
  const r = typeof c === "number" ? c : c.real || 0;
  const i = typeof c === "number" ? 0 : c.imag || 0;
  return Math.sqrt(r * r + i * i);
};

const GATES = {
  I: [[1, 0], [0, 1]],
  X: [[0, 1], [1, 0]],
  Y: [[0, complex(0, -1)], [complex(0, 1), 0]],
  Z: [[1, 0], [0, -1]],
  H: [[1 / Math.sqrt(2), 1 / Math.sqrt(2)], [1 / Math.sqrt(2), -1 / Math.sqrt(2)]],
  S: [[1, 0], [0, complex(0, 1)]],
  T: [[1, 0], [0, complex(Math.cos(Math.PI / 4), Math.sin(Math.PI / 4))]],
};

const applyGate = (state, gate) => {
  const r = [complex(0), complex(0)];
  for (let i = 0; i < 2; i++)
    for (let j = 0; j < 2; j++)
      r[i] = cadd(r[i], cmul(gate[i][j], state[j]));
  return r;
};

const stateToBloch = (state) => {
  const [a, b] = state;
  const ar = typeof a === "number" ? a : a.real || 0;
  const ai = typeof a === "number" ? 0 : a.imag || 0;
  const br = typeof b === "number" ? b : b.real || 0;
  const bi = typeof b === "number" ? 0 : b.imag || 0;
  return {
    x: 2 * (ar * br + ai * bi),
    y: 2 * (ai * br - ar * bi),
    z: (ar * ar + ai * ai) - (br * br + bi * bi),
  };
};

// ─── 3D Scene Components ─────────────────────────────────────────
function GlowingSphere() {
  const meshRef = useRef();
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.material.opacity = 0.12 + Math.sin(clock.elapsedTime * 1.5) * 0.04;
    }
  });
  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 24]} />
      <meshBasicMaterial color="#9929EA" wireframe transparent opacity={0.15} />
    </mesh>
  );
}

function InnerGlow() {
  return (
    <mesh>
      <sphereGeometry args={[0.98, 32, 32]} />
      <meshBasicMaterial color="#9929EA" transparent opacity={0.03} side={THREE.BackSide} />
    </mesh>
  );
}

function Axes() {
  const len = 1.35;
  return (
    <group>
      <Line points={[[-len, 0, 0], [len, 0, 0]]} color="#CC66DA" lineWidth={1.5} />
      <Line points={[[0, -len, 0], [0, len, 0]]} color="#FAEB92" lineWidth={1.5} />
      <Line points={[[0, 0, -len], [0, 0, len]]} color="#40ff40" lineWidth={1.5} />
      {/* Labels */}
      <Text position={[len + 0.15, 0, 0]} fontSize={0.12} color="#CC66DA" anchorX="left">X</Text>
      <Text position={[0, len + 0.15, 0]} fontSize={0.12} color="#FAEB92" anchorX="center">Y</Text>
      <Text position={[0, 0, len + 0.15]} fontSize={0.14} color="#40ff40" anchorX="center">|0⟩</Text>
      <Text position={[0, 0, -len - 0.15]} fontSize={0.14} color="#ff6060" anchorX="center">|1⟩</Text>
    </group>
  );
}

function EquatorCircle() {
  const pts = useMemo(() => {
    const p = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      p.push([Math.cos(angle), 0, Math.sin(angle)]);
    }
    return p;
  }, []);
  return <Line points={pts} color="#9929EA" lineWidth={0.8} transparent opacity={0.3} />;
}

function MeridianCircle({ axis = "xz" }) {
  const pts = useMemo(() => {
    const p = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      if (axis === "xz") p.push([Math.cos(angle), Math.sin(angle), 0]);
      else p.push([0, Math.cos(angle), Math.sin(angle)]);
    }
    return p;
  }, [axis]);
  return <Line points={pts} color="#9929EA" lineWidth={0.5} transparent opacity={0.15} />;
}

function StateArrow({ targetBloch }) {
  const groupRef = useRef();
  const currentDir = useRef(new THREE.Vector3(0, 0, 1));
  const targetDir = useRef(new THREE.Vector3(0, 0, 1));
  const trailRef = useRef([]);
  const trailMeshRef = useRef();

  // Update target when bloch changes
  React.useEffect(() => {
    targetDir.current.set(targetBloch.x, targetBloch.y, targetBloch.z).normalize();
  }, [targetBloch]);

  useFrame(() => {
    // Smooth slerp interpolation
    const q1 = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      currentDir.current
    );
    const q2 = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      targetDir.current
    );
    q1.slerp(q2, 0.08);
    currentDir.current.set(0, 1, 0).applyQuaternion(q1).normalize();

    if (groupRef.current) {
      // Build arrow transform
      const dir = currentDir.current.clone();
      const quat = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        dir
      );
      groupRef.current.quaternion.copy(quat);
    }

    // Trail
    const tip = currentDir.current.clone();
    trailRef.current.push(tip);
    if (trailRef.current.length > 80) trailRef.current.shift();
  });

  return (
    <>
      <group ref={groupRef}>
        {/* Shaft */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.9} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 0.85, 0]}>
          <coneGeometry args={[0.06, 0.15, 8]} />
          <meshBasicMaterial color="#00ffff" />
        </mesh>
        {/* Glow */}
        <mesh position={[0, 0.85, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.3} />
        </mesh>
      </group>
    </>
  );
}

function BlochScene({ bloch }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <GlowingSphere />
      <InnerGlow />
      <EquatorCircle />
      <MeridianCircle axis="xz" />
      <MeridianCircle axis="yz" />
      <Axes />
      <StateArrow targetBloch={bloch} />
      <OrbitControls enableZoom={false} enablePan={false} dampingFactor={0.05} enableDamping />
    </>
  );
}

// ─── Main Component ──────────────────────────────────────────────
export default function BlochSphere() {
  const [state, setState] = useState([complex(1), complex(0)]);
  const bloch = useMemo(() => stateToBloch(state), [state]);
  const mag0 = cmag(state[0]);
  const mag1 = cmag(state[1]);

  const applyQuantumGate = useCallback((name) => {
    const gate = GATES[name];
    if (!gate) return;
    setState((prev) => applyGate(prev, gate));
  }, []);

  const resetState = useCallback(() => {
    setState([complex(1), complex(0)]);
  }, []);

  const formatComplex = (c) => {
    const r = (typeof c === "number" ? c : c.real || 0).toFixed(3);
    const i = typeof c === "number" ? 0 : c.imag || 0;
    if (Math.abs(i) < 0.0005) return r;
    return i > 0 ? `${r} + ${i.toFixed(3)}i` : `${r} - ${Math.abs(i).toFixed(3)}i`;
  };

  return (
    <section className="py-20 px-4 max-w-6xl mx-auto relative z-10 pointer-events-none overflow-visible pt-24">
      {/* Header */}
      <div className="pointer-events-auto mb-6">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#FAEB92] transition-colors text-sm mb-4">
          <ArrowLeft size={16} /> Back to Experiments
        </Link>
      </div>
      <div className="text-center mb-10 space-y-3 pointer-events-auto">
        <h2 className="text-3xl md:text-5xl font-bold">
          Bloch <span className="bg-gradient-to-r from-[#9929EA] via-[#CC66DA] to-[#FAEB92] text-transparent bg-clip-text">Sphere</span>
        </h2>
        <p className="text-gray-400 text-lg">Interactive qubit visualization — apply quantum gates and watch the state evolve</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pointer-events-auto">
        {/* 3D Visualization */}
        <div className="lg:col-span-2">
          <div className="w-full h-96 md:h-[520px] bg-gradient-to-br from-[#9929EA]/5 to-[#CC66DA]/5 rounded-2xl border border-[#9929EA]/30 overflow-hidden">
            <Canvas camera={{ position: [2.5, 1.8, 2.5], fov: 40 }}>
              <BlochScene bloch={bloch} />
            </Canvas>
          </div>
          <p className="text-gray-500 text-sm mt-2 text-center">Drag to orbit • Apply gates to rotate the state vector</p>
        </div>

        {/* Right Panel */}
        <div className="space-y-5">
          {/* Quantum Gates */}
          <div className="bg-[#0a0a0a] border border-[#9929EA]/30 rounded-xl p-5">
            <h3 className="text-lg font-bold text-[#FAEB92] mb-4 flex items-center gap-2">
              <RotateCw size={18} /> Quantum Gates
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {["X", "Y", "Z", "H", "S", "T"].map((g) => (
                <button
                  key={g}
                  onClick={() => applyQuantumGate(g)}
                  className="px-3 py-2.5 bg-[#9929EA]/80 hover:bg-[#CC66DA] text-white text-sm font-bold rounded-lg transition-all hover:shadow-[0_0_15px_rgba(153,41,234,0.4)] active:scale-95"
                >
                  {g}
                </button>
              ))}
            </div>
            <button
              onClick={resetState}
              className="w-full mt-4 px-3 py-2 bg-transparent border border-[#FAEB92]/40 hover:border-[#FAEB92] text-[#FAEB92] text-sm font-bold rounded-lg transition-all"
            >
              Reset to |0⟩
            </button>
          </div>

          {/* State Vector */}
          <div className="bg-[#0a0a0a] border border-[#9929EA]/30 rounded-xl p-5">
            <h3 className="text-sm font-bold text-[#FAEB92] mb-3">State Vector |ψ⟩</h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-gray-500">α (|0⟩)</span>
                <span className="text-white">{formatComplex(state[0])}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">β (|1⟩)</span>
                <span className="text-white">{formatComplex(state[1])}</span>
              </div>
            </div>
          </div>

          {/* Probabilities */}
          <div className="bg-[#0a0a0a] border border-[#9929EA]/30 rounded-xl p-5">
            <h3 className="text-sm font-bold text-[#FAEB92] mb-3">Measurement Probabilities</h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-500">P(|0⟩)</span>
                  <span className="text-white font-mono">{(mag0 * mag0 * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-[#9929EA]/10 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#9929EA] to-[#CC66DA] rounded-full transition-all duration-500"
                    style={{ width: `${mag0 * mag0 * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-500">P(|1⟩)</span>
                  <span className="text-white font-mono">{(mag1 * mag1 * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-[#9929EA]/10 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#CC66DA] to-[#FAEB92] rounded-full transition-all duration-500"
                    style={{ width: `${mag1 * mag1 * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bloch Vector */}
          <div className="bg-[#0a0a0a] border border-[#9929EA]/30 rounded-xl p-5">
            <h3 className="text-sm font-bold text-[#FAEB92] mb-3">Bloch Coordinates</h3>
            <div className="grid grid-cols-3 gap-3 text-center text-sm font-mono">
              <div>
                <span className="text-gray-500 block text-xs">X</span>
                <span className="text-[#CC66DA]">{bloch.x.toFixed(3)}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Y</span>
                <span className="text-[#FAEB92]">{bloch.y.toFixed(3)}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Z</span>
                <span className="text-green-400">{bloch.z.toFixed(3)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
