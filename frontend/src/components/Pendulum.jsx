import React, { useRef, useState, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Line } from "@react-three/drei";
import * as THREE from "three";
import { Link } from "react-router-dom";
import { ArrowLeft, Play, Pause, RotateCcw } from "lucide-react";

function PendulumBody({ length, angle, mass }) {
    const pivotY = 3;
    const bobX = Math.sin(angle) * length;
    const bobY = pivotY - Math.cos(angle) * length;
    const bobRadius = 0.1 + mass * 0.04;

    return (
        <group>
            {/* Pivot */}
            <mesh position={[0, pivotY, 0]}>
                <sphereGeometry args={[0.06, 16, 16]} />
                <meshStandardMaterial color="#666" metalness={0.8} />
            </mesh>

            {/* Rod */}
            <Line
                points={[[0, pivotY, 0], [bobX, bobY, 0]]}
                color="#888"
                lineWidth={2}
            />

            {/* Bob */}
            <mesh position={[bobX, bobY, 0]}>
                <sphereGeometry args={[bobRadius, 24, 24]} />
                <meshStandardMaterial
                    color="#CC66DA"
                    emissive="#CC66DA"
                    emissiveIntensity={0.4}
                    metalness={0.5}
                    roughness={0.3}
                />
            </mesh>

            {/* Bob glow */}
            <mesh position={[bobX, bobY, 0]}>
                <sphereGeometry args={[bobRadius + 0.05, 16, 16]} />
                <meshBasicMaterial color="#CC66DA" transparent opacity={0.15} />
            </mesh>

            {/* Angle arc */}
            <Line
                points={[[0, pivotY, 0], [0, pivotY - length * 0.4, 0]]}
                color="#FAEB92"
                lineWidth={0.5}
                transparent
                opacity={0.3}
                dashed
                dashSize={0.05}
                gapSize={0.05}
            />
        </group>
    );
}

function PendulumSimulation({ length, mass, initialAngle, gravity, damping, running }) {
    const angleRef = useRef(initialAngle * Math.PI / 180);
    const velRef = useRef(0);
    const currentAngle = useRef(initialAngle * Math.PI / 180);
    const energyRef = useRef({ ke: 0, pe: 0 });

    // Reset on parameter change
    React.useEffect(() => {
        angleRef.current = initialAngle * Math.PI / 180;
        velRef.current = 0;
    }, [initialAngle, length, gravity, mass, damping]);

    useFrame((_, delta) => {
        if (!running) return;
        const dt = Math.min(delta, 0.05);

        // Simple pendulum ODE: θ'' = -(g/L)sin(θ) - c·θ'
        const dampCoeff = damping ? 0.05 : 0;
        const accel = -(gravity / length) * Math.sin(angleRef.current) - dampCoeff * velRef.current;
        velRef.current += accel * dt;
        angleRef.current += velRef.current * dt;

        currentAngle.current = angleRef.current;

        // Energy
        const h = length * (1 - Math.cos(angleRef.current));
        energyRef.current = {
            ke: 0.5 * mass * (length * velRef.current) ** 2,
            pe: mass * gravity * h,
        };
    });

    return (
        <group>
            <PendulumBody length={length} angle={currentAngle.current} mass={mass} />
            <PendulumUpdater angleRef={angleRef} length={length} mass={mass} />
        </group>
    );
}

// Separate component to drive re-renders for the visual
function PendulumUpdater({ angleRef, length, mass }) {
    const [displayAngle, setDisplayAngle] = useState(0);

    useFrame(() => {
        setDisplayAngle(angleRef.current);
    });

    return <PendulumBody length={length} angle={displayAngle} mass={mass} />;
}

function PendulumScene({ length, mass, initialAngle, gravity, damping, running }) {
    return (
        <>
            <ambientLight intensity={0.4} />
            <pointLight position={[5, 5, 5]} intensity={0.6} />
            <directionalLight position={[2, 4, 3]} intensity={0.4} />

            {/* Background grid */}
            <gridHelper args={[10, 10, "#1a1a1a", "#0d0d0d"]} rotation={[Math.PI / 2, 0, 0]} position={[0, 1.5, -1]} />

            <PendulumSimulation
                length={length}
                mass={mass}
                initialAngle={initialAngle}
                gravity={gravity}
                damping={damping}
                running={running}
            />

            <OrbitControls enableZoom enablePan={false} dampingFactor={0.05} enableDamping />
        </>
    );
}

export default function Pendulum() {
    const [length, setLength] = useState(2.5);
    const [mass, setMass] = useState(3);
    const [initialAngle, setInitialAngle] = useState(30);
    const [gravity, setGravity] = useState(9.81);
    const [damping, setDamping] = useState(false);
    const [running, setRunning] = useState(true);
    const [key, setKey] = useState(0);

    const period = (2 * Math.PI * Math.sqrt(length / gravity)).toFixed(3);

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
                    Simple <span className="bg-gradient-to-r from-[#FAEB92] via-[#ff8844] to-[#ff4444] text-transparent bg-clip-text">Pendulum</span>
                </h2>
                <p className="text-gray-400 text-lg">Study harmonic motion with adjustable parameters</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pointer-events-auto">
                <div className="lg:col-span-2">
                    <div className="w-full h-96 md:h-[520px] bg-gradient-to-br from-[#9929EA]/5 to-[#CC66DA]/5 rounded-2xl border border-[#9929EA]/30 overflow-hidden">
                        <Canvas key={key} camera={{ position: [0, 1.5, 6], fov: 40 }}>
                            <PendulumScene
                                length={length}
                                mass={mass}
                                initialAngle={initialAngle}
                                gravity={gravity}
                                damping={damping}
                                running={running}
                            />
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
                        <button
                            onClick={reset}
                            className="px-5 py-2 border border-[#FAEB92]/40 hover:border-[#FAEB92] text-[#FAEB92] rounded-lg transition-all flex items-center gap-2 text-sm font-semibold"
                        >
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
                                    Length <span className="text-white font-mono">{length.toFixed(1)} m</span>
                                </label>
                                <input type="range" min="0.5" max="4" step="0.1" value={length}
                                    onChange={(e) => setLength(parseFloat(e.target.value))}
                                    className="w-full mt-1 accent-[#CC66DA]" />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 flex justify-between">
                                    Mass <span className="text-white font-mono">{mass} kg</span>
                                </label>
                                <input type="range" min="1" max="10" step="1" value={mass}
                                    onChange={(e) => setMass(parseInt(e.target.value))}
                                    className="w-full mt-1 accent-[#9929EA]" />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 flex justify-between">
                                    Initial Angle <span className="text-white font-mono">{initialAngle}°</span>
                                </label>
                                <input type="range" min="5" max="80" step="1" value={initialAngle}
                                    onChange={(e) => setInitialAngle(parseInt(e.target.value))}
                                    className="w-full mt-1 accent-[#ff8844]" />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 flex justify-between">
                                    Gravity <span className="text-white font-mono">{gravity.toFixed(1)} m/s²</span>
                                </label>
                                <input type="range" min="1" max="20" step="0.1" value={gravity}
                                    onChange={(e) => setGravity(parseFloat(e.target.value))}
                                    className="w-full mt-1 accent-[#FAEB92]" />
                            </div>
                            <label className="flex items-center gap-3 text-sm text-gray-400 cursor-pointer">
                                <input type="checkbox" checked={damping} onChange={(e) => setDamping(e.target.checked)}
                                    className="accent-[#9929EA] w-4 h-4" />
                                Enable Damping
                            </label>
                        </div>
                    </div>

                    <div className="bg-[#0a0a0a] border border-[#9929EA]/30 rounded-xl p-5">
                        <h3 className="text-sm font-bold text-[#FAEB92] mb-3">Computed</h3>
                        <div className="grid grid-cols-2 gap-3 text-center text-sm font-mono">
                            <div>
                                <span className="text-gray-500 block text-xs">Period T</span>
                                <span className="text-[#CC66DA]">{period} s</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-xs">Frequency</span>
                                <span className="text-[#FAEB92]">{(1 / parseFloat(period)).toFixed(3)} Hz</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0a0a0a] border border-[#9929EA]/30 rounded-xl p-5">
                        <h3 className="text-sm font-bold text-[#FAEB92] mb-3">Equations</h3>
                        <div className="space-y-1 text-xs text-gray-400 font-mono text-center">
                            <p className="text-[#CC66DA]">θ'' = -(g/L)·sin(θ)</p>
                            <p className="text-[#FAEB92]">T = 2π√(L/g)</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
