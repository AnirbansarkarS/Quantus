import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Line } from "@react-three/drei";
import * as THREE from "three";
import { Link } from "react-router-dom";
import { ArrowLeft, Play, Pause, RotateCcw } from "lucide-react";

function Spring({ extension, restLength }) {
    const totalLength = restLength + extension;
    const coils = 15;
    const radius = 0.15;
    const points = [];

    // Anchor at top
    points.push([0, 3.5, 0]);
    points.push([0, 3.3, 0]);

    // Coil
    const coilStart = 3.3;
    const coilEnd = coilStart - totalLength + 0.3;
    for (let i = 0; i <= coils * 20; i++) {
        const t = i / (coils * 20);
        const y = coilStart - t * (coilStart - coilEnd);
        const x = Math.sin(t * coils * Math.PI * 2) * radius;
        const z = Math.cos(t * coils * Math.PI * 2) * radius;
        points.push([x, y, z]);
    }

    // Connect to mass
    const massY = coilEnd - 0.1;
    points.push([0, massY + 0.1, 0]);

    return (
        <group>
            {/* Spring */}
            <Line points={points} color="#FAEB92" lineWidth={2} />

            {/* Anchor */}
            <mesh position={[0, 3.5, 0]}>
                <boxGeometry args={[0.8, 0.1, 0.3]} />
                <meshStandardMaterial color="#555" metalness={0.8} />
            </mesh>

            {/* Mass */}
            <mesh position={[0, massY - 0.15, 0]}>
                <boxGeometry args={[0.4, 0.3, 0.4]} />
                <meshStandardMaterial color="#CC66DA" emissive="#CC66DA" emissiveIntensity={0.4} metalness={0.5} roughness={0.3} />
            </mesh>
            <mesh position={[0, massY - 0.15, 0]}>
                <boxGeometry args={[0.5, 0.4, 0.5]} />
                <meshBasicMaterial color="#CC66DA" transparent opacity={0.1} />
            </mesh>
        </group>
    );
}

function SpringSimulation({ springK, mass, damping, running, initialDisp }) {
    const posRef = useRef(initialDisp);
    const velRef = useRef(0);
    const timeRef = useRef(0);
    const historyRef = useRef([]);
    const [displayPos, setDisplayPos] = useState(initialDisp);
    const [history, setHistory] = useState([]);

    React.useEffect(() => {
        posRef.current = initialDisp;
        velRef.current = 0;
        timeRef.current = 0;
        historyRef.current = [];
    }, [initialDisp, springK, mass, damping]);

    useFrame((_, delta) => {
        if (!running) return;
        const dt = Math.min(delta, 0.03);
        timeRef.current += dt;

        // Spring ODE: x'' = -(k/m)x - (c/m)x'
        const dampCoeff = damping;
        const accel = -(springK / mass) * posRef.current - (dampCoeff / mass) * velRef.current;
        velRef.current += accel * dt;
        posRef.current += velRef.current * dt;

        setDisplayPos(posRef.current);

        // Record history for plot
        historyRef.current.push({ t: timeRef.current, x: posRef.current });
        if (historyRef.current.length > 300) historyRef.current.shift();

        if (Math.floor(timeRef.current * 60) % 3 === 0) {
            setHistory([...historyRef.current]);
        }
    });

    const restLength = 1.5;

    // Displacement plot
    const plotPoints = history.map((h, i) => {
        const px = -3 + (i / 300) * 6;
        const py = -1.5 + h.x * 0.8;
        return [px, py, 2];
    });

    return (
        <group>
            <Spring extension={displayPos} restLength={restLength} />

            {/* Displacement vs time plot */}
            {plotPoints.length > 2 && (
                <group>
                    <Line points={plotPoints} color="#00ffff" lineWidth={1.5} />
                    {/* Axes */}
                    <Line points={[[-3, -1.5, 2], [3, -1.5, 2]]} color="#333" lineWidth={0.5} />
                    <Line points={[[-3, -2.5, 2], [-3, -0.5, 2]]} color="#333" lineWidth={0.5} />
                    <Text position={[0, -2.8, 2]} fontSize={0.1} color="#666" anchorX="center">time →</Text>
                    <Text position={[-3.3, -1.5, 2]} fontSize={0.1} color="#00ffff" anchorX="right">x(t)</Text>
                </group>
            )}

            {/* Equilibrium dashed line */}
            <Line
                points={[[-0.5, 3.3 - restLength, 0], [0.5, 3.3 - restLength, 0]]}
                color="#FAEB92"
                lineWidth={0.5}
                dashed
                dashSize={0.05}
                gapSize={0.05}
            />
            <Text position={[0.8, 3.3 - restLength, 0]} fontSize={0.1} color="#FAEB92" anchorX="left">
                equilibrium
            </Text>
        </group>
    );
}

function SpringScene(props) {
    return (
        <>
            <ambientLight intensity={0.4} />
            <pointLight position={[5, 5, 5]} intensity={0.6} />
            <SpringSimulation {...props} />
            <OrbitControls enableZoom enablePan={false} dampingFactor={0.05} enableDamping />
        </>
    );
}

export default function SpringOscillator() {
    const [springK, setSpringK] = useState(5);
    const [mass, setMass] = useState(2);
    const [damping, setDamping] = useState(0);
    const [initialDisp, setInitialDisp] = useState(0.8);
    const [running, setRunning] = useState(true);
    const [key, setKey] = useState(0);

    const omega = Math.sqrt(springK / mass);
    const period = (2 * Math.PI) / omega;

    const reset = () => {
        setKey((k) => k + 1);
        setRunning(true);
    };

    return (
        <section className="py-20 px-4 max-w-6xl mx-auto relative z-10 pointer-events-none overflow-visible pt-24">
            <div className="pointer-events-auto mb-6">
                <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#FAEB92] transition-colors text-sm mb-4">
                    <ArrowLeft size={16} /> Back to Experiments
                </Link>
            </div>
            <div className="text-center mb-10 space-y-3 pointer-events-auto">
                <h2 className="text-3xl md:text-5xl font-bold">
                    Spring <span className="bg-gradient-to-r from-[#FAEB92] via-[#ff8844] to-[#ff4444] text-transparent bg-clip-text">Oscillator</span>
                </h2>
                <p className="text-gray-400 text-lg">Explore simple harmonic motion with a spring-mass system</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pointer-events-auto">
                <div className="lg:col-span-2">
                    <div className="w-full h-96 md:h-[520px] bg-gradient-to-br from-[#9929EA]/5 to-[#CC66DA]/5 rounded-2xl border border-[#9929EA]/30 overflow-hidden">
                        <Canvas key={key} camera={{ position: [0, 1, 6], fov: 40 }}>
                            <SpringScene springK={springK} mass={mass} damping={damping} initialDisp={initialDisp} running={running} />
                        </Canvas>
                    </div>
                    <div className="flex justify-center gap-3 mt-4">
                        <button onClick={() => setRunning(!running)}
                            className="px-5 py-2 bg-[#9929EA]/80 hover:bg-[#CC66DA] text-white rounded-lg transition-all flex items-center gap-2 text-sm font-semibold">
                            {running ? <Pause size={16} /> : <Play size={16} />}
                            {running ? "Pause" : "Play"}
                        </button>
                        <button onClick={reset}
                            className="px-5 py-2 border border-[#FAEB92]/40 hover:border-[#FAEB92] text-[#FAEB92] rounded-lg transition-all flex items-center gap-2 text-sm font-semibold">
                            <RotateCcw size={16} /> Reset
                        </button>
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="bg-[#0a0a0a] border border-[#9929EA]/30 rounded-xl p-5">
                        <h3 className="text-lg font-bold text-[#FAEB92] mb-4">Parameters</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 flex justify-between">
                                    Spring Constant (k) <span className="text-white font-mono">{springK} N/m</span>
                                </label>
                                <input type="range" min="1" max="20" step="0.5" value={springK}
                                    onChange={(e) => setSpringK(parseFloat(e.target.value))}
                                    className="w-full mt-1 accent-[#FAEB92]" />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 flex justify-between">
                                    Mass <span className="text-white font-mono">{mass} kg</span>
                                </label>
                                <input type="range" min="0.5" max="10" step="0.5" value={mass}
                                    onChange={(e) => setMass(parseFloat(e.target.value))}
                                    className="w-full mt-1 accent-[#CC66DA]" />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 flex justify-between">
                                    Damping <span className="text-white font-mono">{damping.toFixed(1)}</span>
                                </label>
                                <input type="range" min="0" max="3" step="0.1" value={damping}
                                    onChange={(e) => setDamping(parseFloat(e.target.value))}
                                    className="w-full mt-1 accent-[#9929EA]" />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 flex justify-between">
                                    Initial Displacement <span className="text-white font-mono">{initialDisp.toFixed(1)} m</span>
                                </label>
                                <input type="range" min="0.2" max="1.5" step="0.1" value={initialDisp}
                                    onChange={(e) => setInitialDisp(parseFloat(e.target.value))}
                                    className="w-full mt-1 accent-[#ff8844]" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0a0a0a] border border-[#9929EA]/30 rounded-xl p-5">
                        <h3 className="text-sm font-bold text-[#FAEB92] mb-3">Computed</h3>
                        <div className="grid grid-cols-2 gap-3 text-center text-sm font-mono">
                            <div>
                                <span className="text-gray-500 block text-xs">ω</span>
                                <span className="text-[#CC66DA]">{omega.toFixed(3)} rad/s</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-xs">Period T</span>
                                <span className="text-[#FAEB92]">{period.toFixed(3)} s</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0a0a0a] border border-[#9929EA]/30 rounded-xl p-5">
                        <h3 className="text-sm font-bold text-[#FAEB92] mb-3">Equations</h3>
                        <div className="space-y-1 text-xs text-gray-400 font-mono text-center">
                            <p className="text-[#CC66DA]">F = -kx (Hooke's Law)</p>
                            <p className="text-[#CC66DA]">x'' + (c/m)x' + (k/m)x = 0</p>
                            <p className="text-[#FAEB92]">ω = √(k/m)</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
