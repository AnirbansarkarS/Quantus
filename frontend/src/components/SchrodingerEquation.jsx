import React, { useRef, useState, useMemo, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Line } from "@react-three/drei";
import * as THREE from "three";
import { Link } from "react-router-dom";
import { ArrowLeft, Play, Pause } from "lucide-react";

// ─── Wave function computations ──────────────────────────────────
const GRID_SIZE = 200;
const X_MIN = -5;
const X_MAX = 5;
const dx = (X_MAX - X_MIN) / GRID_SIZE;

// Infinite square well eigenfunctions
function infiniteWellPsi(x, n, L, t) {
    const halfL = L / 2;
    if (x < -halfL || x > halfL) return { re: 0, im: 0 };
    const xShifted = x + halfL;
    const spatialPart = Math.sqrt(2 / L) * Math.sin((n * Math.PI * xShifted) / L);
    const En = (n * n * Math.PI * Math.PI) / (2 * L * L); // ℏ=m=1
    return {
        re: spatialPart * Math.cos(-En * t),
        im: spatialPart * Math.sin(-En * t),
    };
}

// Harmonic oscillator (approximate with Hermite polynomials)
function hermite(n, x) {
    if (n === 0) return 1;
    if (n === 1) return 2 * x;
    if (n === 2) return 4 * x * x - 2;
    if (n === 3) return 8 * x * x * x - 12 * x;
    if (n === 4) return 16 * x * x * x * x - 48 * x * x + 12;
    return 0;
}

function harmonicPsi(x, n, omega, t) {
    const alpha = Math.sqrt(omega); // √(mω/ℏ), m=ℏ=1
    const xi = alpha * x;
    const Hn = hermite(n, xi);
    const norm = Math.pow(alpha / Math.PI, 0.25) / Math.sqrt(Math.pow(2, n) * factorial(n));
    const spatialPart = norm * Hn * Math.exp(-xi * xi / 2);
    const En = omega * (n + 0.5);
    return {
        re: spatialPart * Math.cos(-En * t),
        im: spatialPart * Math.sin(-En * t),
    };
}

function factorial(n) {
    if (n <= 1) return 1;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
}

// Potential barrier (free particle gaussian packet scattering)
function barrierPsi(x, t, barrierPos, barrierWidth, barrierHeight) {
    // Gaussian wave packet
    const x0 = -3;
    const k0 = 3;
    const sigma0 = 0.5;
    const sigmaT = Math.sqrt(sigma0 * sigma0 + (t * t) / (4 * sigma0 * sigma0));
    const xShifted = x - x0 - k0 * t;
    const envelope = Math.pow(sigma0 / sigmaT, 0.5) * Math.exp(-xShifted * xShifted / (4 * sigmaT * sigmaT));

    // Simple transmission/reflection model
    const inBarrier = Math.abs(x - barrierPos) < barrierWidth / 2;
    const damping = inBarrier ? Math.exp(-barrierHeight * 0.5) : 1;

    return {
        re: envelope * damping * Math.cos(k0 * x - 0.5 * k0 * k0 * t),
        im: envelope * damping * Math.sin(k0 * x - 0.5 * k0 * k0 * t),
    };
}

// ─── WavePlot 3D ─────────────────────────────────────────────────
function WavePlot({ potential, energyLevel, running, speed }) {
    const lineRef = useRef();
    const probRef = useRef();
    const potRef = useRef();
    const timeRef = useRef(0);

    const xValues = useMemo(() => {
        const arr = [];
        for (let i = 0; i < GRID_SIZE; i++) arr.push(X_MIN + i * dx);
        return arr;
    }, []);

    useFrame((_, delta) => {
        if (running) timeRef.current += delta * speed;
        const t = timeRef.current;

        const realPts = [];
        const probPts = [];
        const n = energyLevel;

        xValues.forEach((x) => {
            let psi;
            if (potential === "infinite_well") {
                psi = infiniteWellPsi(x, n, 6, t);
            } else if (potential === "harmonic") {
                psi = harmonicPsi(x, n, 1.0, t);
            } else {
                psi = barrierPsi(x, t % 6, 1, 1, 3);
            }
            const prob = psi.re * psi.re + psi.im * psi.im;
            realPts.push(new THREE.Vector3(x, psi.re * 2, 0));
            probPts.push(new THREE.Vector3(x, prob * 3, 0.5));
        });

        if (lineRef.current) {
            lineRef.current.geometry.setFromPoints(realPts);
        }
        if (probRef.current) {
            probRef.current.geometry.setFromPoints(probPts);
        }
    });

    // Potential visualization
    const potentialPts = useMemo(() => {
        return xValues.map((x) => {
            let V = 0;
            if (potential === "infinite_well") {
                V = Math.abs(x) > 3 ? 3 : 0;
            } else if (potential === "harmonic") {
                V = 0.5 * x * x * 0.3;
            } else {
                V = Math.abs(x - 1) < 0.5 ? 2 : 0;
            }
            return new THREE.Vector3(x, V, -0.5);
        });
    }, [potential, xValues]);

    return (
        <group>
            {/* Real part of ψ */}
            <line ref={lineRef}>
                <bufferGeometry />
                <lineBasicMaterial color="#00ffff" linewidth={2} />
            </line>

            {/* |ψ|² */}
            <line ref={probRef}>
                <bufferGeometry />
                <lineBasicMaterial color="#CC66DA" linewidth={2} />
            </line>

            {/* Potential */}
            <Line points={potentialPts} color="#FAEB92" lineWidth={1.5} transparent opacity={0.5} />

            {/* X axis */}
            <Line points={[[X_MIN, 0, 0], [X_MAX, 0, 0]]} color="#333" lineWidth={1} />

            {/* Labels */}
            <Text position={[0, -0.6, 0]} fontSize={0.15} color="#666" anchorX="center">x</Text>
            <Text position={[-5.5, 1, 0]} fontSize={0.12} color="#00ffff" anchorX="right">Re(ψ)</Text>
            <Text position={[-5.5, 1.5, 0.5]} fontSize={0.12} color="#CC66DA" anchorX="right">|ψ|²</Text>
            <Text position={[-5.5, 0.5, -0.5]} fontSize={0.12} color="#FAEB92" anchorX="right">V(x)</Text>
        </group>
    );
}

// ─── Main Component ──────────────────────────────────────────────
export default function SchrodingerEquation() {
    const [potential, setPotential] = useState("infinite_well");
    const [energyLevel, setEnergyLevel] = useState(1);
    const [running, setRunning] = useState(true);
    const [speed, setSpeed] = useState(2);

    const maxLevel = potential === "barrier" ? 1 : 5;

    return (
        <section className="py-20 px-4 max-w-6xl mx-auto relative z-10 pointer-events-none overflow-visible pt-24">
            <div className="pointer-events-auto mb-6">
                <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#FAEB92] transition-colors text-sm mb-4">
                    <ArrowLeft size={16} /> Back to Experiments
                </Link>
            </div>
            <div className="text-center mb-10 space-y-3 pointer-events-auto">
                <h2 className="text-3xl md:text-5xl font-bold">
                    Schrödinger <span className="bg-gradient-to-r from-[#9929EA] via-[#CC66DA] to-[#FAEB92] text-transparent bg-clip-text">Equation</span>
                </h2>
                <p className="text-gray-400 text-lg">Watch wave functions evolve in real time for different potentials</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pointer-events-auto">
                <div className="lg:col-span-2">
                    <div className="w-full h-96 md:h-[520px] bg-gradient-to-br from-[#9929EA]/5 to-[#CC66DA]/5 rounded-2xl border border-[#9929EA]/30 overflow-hidden">
                        <Canvas camera={{ position: [0, 1, 10], fov: 35 }}>
                            <ambientLight intensity={0.5} />
                            <WavePlot potential={potential} energyLevel={energyLevel} running={running} speed={speed} />
                            <OrbitControls enableZoom enablePan={false} dampingFactor={0.05} enableDamping />
                        </Canvas>
                    </div>
                    <div className="flex justify-center gap-3 mt-4">
                        <button
                            onClick={() => setRunning(!running)}
                            className="px-5 py-2 bg-[#9929EA]/80 hover:bg-[#CC66DA] text-white rounded-lg transition-all flex items-center gap-2 text-sm font-semibold"
                        >
                            {running ? <Pause size={16} /> : <Play size={16} />}
                            {running ? "Pause" : "Play"}
                        </button>
                    </div>
                    <div className="flex gap-4 justify-center mt-2">
                        <div className="flex items-center gap-2 text-xs">
                            <div className="w-3 h-3 rounded-full bg-cyan-400"></div> Re(ψ)
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <div className="w-3 h-3 rounded-full bg-[#CC66DA]"></div> |ψ|²
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <div className="w-3 h-3 rounded-full bg-[#FAEB92]"></div> V(x)
                        </div>
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="bg-[#0a0a0a] border border-[#9929EA]/30 rounded-xl p-5">
                        <h3 className="text-lg font-bold text-[#FAEB92] mb-4">Potential Type</h3>
                        <div className="space-y-2">
                            {[
                                { id: "infinite_well", label: "Infinite Square Well" },
                                { id: "harmonic", label: "Quantum Harmonic Oscillator" },
                                { id: "barrier", label: "Potential Barrier" },
                            ].map(({ id, label }) => (
                                <button
                                    key={id}
                                    onClick={() => { setPotential(id); setEnergyLevel(1); }}
                                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${potential === id
                                            ? "bg-[#9929EA] text-white shadow-[0_0_10px_rgba(153,41,234,0.3)]"
                                            : "bg-[#111] text-gray-400 hover:text-white hover:bg-[#1a1a1a] border border-[#9929EA]/20"
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {potential !== "barrier" && (
                        <div className="bg-[#0a0a0a] border border-[#9929EA]/30 rounded-xl p-5">
                            <h3 className="text-sm font-bold text-[#FAEB92] mb-3">Energy Level (n)</h3>
                            <div className="grid grid-cols-5 gap-2">
                                {Array.from({ length: maxLevel }, (_, i) => i + 1).map((n) => (
                                    <button
                                        key={n}
                                        onClick={() => setEnergyLevel(n)}
                                        className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${energyLevel === n
                                                ? "bg-[#CC66DA] text-white"
                                                : "bg-[#111] text-gray-400 hover:text-white border border-[#9929EA]/20"
                                            }`}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-[#0a0a0a] border border-[#9929EA]/30 rounded-xl p-5">
                        <h3 className="text-sm font-bold text-[#FAEB92] mb-3">Animation Speed</h3>
                        <input
                            type="range" min="0.5" max="5" step="0.5" value={speed}
                            onChange={(e) => setSpeed(parseFloat(e.target.value))}
                            className="w-full accent-[#9929EA]"
                        />
                        <div className="text-xs text-gray-500 text-center mt-1">{speed.toFixed(1)}x</div>
                    </div>

                    <div className="bg-[#0a0a0a] border border-[#9929EA]/30 rounded-xl p-5">
                        <h3 className="text-sm font-bold text-[#FAEB92] mb-3">Equation</h3>
                        <div className="text-center">
                            <p className="text-[#CC66DA] font-mono text-sm">iℏ ∂ψ/∂t = Ĥψ</p>
                            <p className="text-xs text-gray-500 mt-2">
                                {potential === "infinite_well" && "Eₙ = n²π²ℏ² / (2mL²)"}
                                {potential === "harmonic" && "Eₙ = ℏω(n + ½)"}
                                {potential === "barrier" && "T = exp(-2κa), κ = √(2m(V₀-E))/ℏ"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
