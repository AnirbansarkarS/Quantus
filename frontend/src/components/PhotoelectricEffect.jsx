import React, { useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import { Link } from "react-router-dom";
import { ArrowLeft, Sun, Zap } from "lucide-react";

// Frequency to visible color
function freqToColor(freq) {
    // freq in PHz (0.4 - 2.0 range)
    const f = Math.max(0.4, Math.min(2.0, freq));
    let r = 0, g = 0, b = 0;
    if (f < 0.5) { r = 1; g = (f - 0.4) * 10; } // red-orange
    else if (f < 0.6) { r = 1; g = 0.5 + (f - 0.5) * 5; } // orange-yellow
    else if (f < 0.7) { r = 1 - (f - 0.6) * 10; g = 1; } // yellow-green
    else if (f < 0.8) { g = 1; b = (f - 0.7) * 10; } // green-cyan
    else if (f < 1.0) { g = 1 - (f - 0.8) * 5; b = 1; } // cyan-blue
    else if (f < 1.4) { r = (f - 1.0) * 2.5; b = 1; } // blue-violet
    else { r = 0.5; b = 1; } // UV
    return new THREE.Color(r, g, b);
}

function MetalPlate({ workFunction }) {
    const meshRef = useRef();
    useFrame(({ clock }) => {
        if (meshRef.current) {
            meshRef.current.material.emissiveIntensity = 0.2 + Math.sin(clock.elapsedTime * 2) * 0.1;
        }
    });
    return (
        <group position={[0, 0, 0]}>
            <mesh ref={meshRef}>
                <boxGeometry args={[3, 2, 0.15]} />
                <meshStandardMaterial color="#555" metalness={0.9} roughness={0.2} emissive="#9929EA" emissiveIntensity={0.2} />
            </mesh>
            <Text position={[0, -1.3, 0]} fontSize={0.15} color="#FAEB92" anchorX="center">
                Metal Plate (Φ = {workFunction.toFixed(2)} eV)
            </Text>
        </group>
    );
}

function Photons({ frequency, intensity, running }) {
    const ref = useRef();
    const photonsRef = useRef([]);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const color = useMemo(() => freqToColor(frequency), [frequency]);
    const frameCount = useRef(0);

    useFrame(() => {
        if (!running || !ref.current) return;
        frameCount.current++;

        // Spawn photons
        if (frameCount.current % Math.max(1, Math.floor(8 / intensity)) === 0) {
            for (let i = 0; i < 2; i++) {
                photonsRef.current.push({
                    x: -5 + Math.random() * 0.3,
                    y: (Math.random() - 0.5) * 1.5,
                    z: (Math.random() - 0.5) * 0.3,
                    vx: 0.08,
                    alive: true,
                });
            }
        }

        if (photonsRef.current.length > 500) {
            photonsRef.current = photonsRef.current.slice(-500);
        }

        photonsRef.current.forEach((p) => {
            if (!p.alive) return;
            p.x += p.vx;
            if (p.x > -0.1) p.alive = false; // hit plate
        });

        const alive = photonsRef.current.filter((p) => p.alive);
        alive.forEach((p, i) => {
            dummy.position.set(p.x, p.y, p.z);
            dummy.scale.setScalar(0.06);
            dummy.updateMatrix();
            ref.current.setMatrixAt(i, dummy.matrix);
        });
        // Hide rest
        for (let i = alive.length; i < 500; i++) {
            dummy.position.set(0, -100, 0);
            dummy.scale.setScalar(0);
            dummy.updateMatrix();
            ref.current.setMatrixAt(i, dummy.matrix);
        }
        ref.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={ref} args={[null, null, 500]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial color={color} transparent opacity={0.9} />
        </instancedMesh>
    );
}

function Electrons({ frequency, workFunction, running }) {
    const ref = useRef();
    const electronsRef = useRef([]);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const frameCount = useRef(0);
    const canEmit = frequency > workFunction;

    useFrame(() => {
        if (!running || !ref.current) return;
        frameCount.current++;

        if (canEmit && frameCount.current % 8 === 0) {
            const ke = frequency - workFunction;
            const speed = 0.03 + ke * 0.04;
            electronsRef.current.push({
                x: 0.2,
                y: (Math.random() - 0.5) * 1.2,
                z: (Math.random() - 0.5) * 0.3,
                vx: speed * (0.5 + Math.random() * 0.5),
                vy: (Math.random() - 0.5) * speed * 0.5,
                alive: true,
                life: 0,
            });
        }

        if (electronsRef.current.length > 300) {
            electronsRef.current = electronsRef.current.slice(-300);
        }

        electronsRef.current.forEach((e) => {
            if (!e.alive) return;
            e.x += e.vx;
            e.y += e.vy;
            e.life++;
            if (e.life > 120) e.alive = false;
        });

        const alive = electronsRef.current.filter((e) => e.alive);
        alive.forEach((e, i) => {
            dummy.position.set(e.x, e.y, e.z);
            dummy.scale.setScalar(0.04);
            dummy.updateMatrix();
            ref.current.setMatrixAt(i, dummy.matrix);
        });
        for (let i = alive.length; i < 300; i++) {
            dummy.position.set(0, -100, 0);
            dummy.scale.setScalar(0);
            dummy.updateMatrix();
            ref.current.setMatrixAt(i, dummy.matrix);
        }
        ref.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={ref} args={[null, null, 300]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial color="#00ff88" />
        </instancedMesh>
    );
}

function LightSource({ frequency }) {
    const color = freqToColor(frequency);
    return (
        <group position={[-5, 0, 0]}>
            <mesh>
                <cylinderGeometry args={[0.3, 0.4, 0.8, 16]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
            </mesh>
            <pointLight color={color} intensity={2} distance={5} />
        </group>
    );
}

export default function PhotoelectricEffect() {
    const [running, setRunning] = useState(true);
    const [frequency, setFrequency] = useState(1.0);
    const [workFunction, setWorkFunction] = useState(0.8);
    const [intensity, setIntensity] = useState(3);
    const canEmit = frequency > workFunction;
    const ke = canEmit ? frequency - workFunction : 0;

    return (
        <section className="py-20 px-4 max-w-6xl mx-auto relative z-10 pointer-events-none overflow-visible pt-24">
            <div className="pointer-events-auto mb-6">
                <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#FAEB92] transition-colors text-sm mb-4">
                    <ArrowLeft size={16} /> Back to Experiments
                </Link>
            </div>
            <div className="text-center mb-10 space-y-3 pointer-events-auto">
                <h2 className="text-3xl md:text-5xl font-bold">
                    Photoelectric <span className="bg-gradient-to-r from-[#9929EA] via-[#CC66DA] to-[#FAEB92] text-transparent bg-clip-text">Effect</span>
                </h2>
                <p className="text-gray-400 text-lg">Experiment with photon frequency, intensity, and work functions</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pointer-events-auto">
                <div className="lg:col-span-2">
                    <div className="w-full h-96 md:h-[520px] bg-gradient-to-br from-[#9929EA]/5 to-[#CC66DA]/5 rounded-2xl border border-[#9929EA]/30 overflow-hidden">
                        <Canvas camera={{ position: [0, 0, 8], fov: 40 }}>
                            <ambientLight intensity={0.3} />
                            <pointLight position={[3, 3, 3]} intensity={0.5} />
                            <LightSource frequency={frequency} />
                            <MetalPlate workFunction={workFunction} />
                            <Photons frequency={frequency} intensity={intensity} running={running} />
                            <Electrons frequency={frequency} workFunction={workFunction} running={running} />
                            <OrbitControls enableZoom={false} enablePan={false} dampingFactor={0.05} enableDamping />
                        </Canvas>
                    </div>

                    {/* Status */}
                    <div className="flex justify-center mt-4">
                        <div className={`px-4 py-2 rounded-full text-sm font-bold ${canEmit ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}>
                            {canEmit ? (
                                <span className="flex items-center gap-2"><Zap size={14} /> Electrons Ejected — KE = {ke.toFixed(2)} eV</span>
                            ) : (
                                <span>Below threshold — No emission (f &lt; Φ)</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="bg-[#0a0a0a] border border-[#9929EA]/30 rounded-xl p-5">
                        <h3 className="text-lg font-bold text-[#FAEB92] mb-4 flex items-center gap-2">
                            <Sun size={18} /> Light Properties
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 flex justify-between">
                                    Frequency (f) <span className="text-white font-mono">{frequency.toFixed(2)} PHz</span>
                                </label>
                                <input
                                    type="range" min="0.4" max="2.0" step="0.05" value={frequency}
                                    onChange={(e) => setFrequency(parseFloat(e.target.value))}
                                    className="w-full mt-1 accent-[#CC66DA]"
                                />
                                <div className="h-2 mt-1 rounded-full" style={{
                                    background: "linear-gradient(to right, #ff0000, #ffaa00, #ffff00, #00ff00, #00ffff, #0000ff, #8800ff)"
                                }} />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 flex justify-between">
                                    Intensity <span className="text-white font-mono">{intensity}</span>
                                </label>
                                <input
                                    type="range" min="1" max="5" step="1" value={intensity}
                                    onChange={(e) => setIntensity(parseFloat(e.target.value))}
                                    className="w-full mt-1 accent-[#FAEB92]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0a0a0a] border border-[#9929EA]/30 rounded-xl p-5">
                        <h3 className="text-sm font-bold text-[#FAEB92] mb-3">Metal Properties</h3>
                        <div>
                            <label className="text-sm text-gray-400 flex justify-between">
                                Work Function (Φ) <span className="text-white font-mono">{workFunction.toFixed(2)} eV</span>
                            </label>
                            <input
                                type="range" min="0.3" max="1.8" step="0.05" value={workFunction}
                                onChange={(e) => setWorkFunction(parseFloat(e.target.value))}
                                className="w-full mt-1 accent-[#9929EA]"
                            />
                        </div>
                    </div>

                    <div className="bg-[#0a0a0a] border border-[#9929EA]/30 rounded-xl p-5">
                        <h3 className="text-sm font-bold text-[#FAEB92] mb-3">Physics</h3>
                        <div className="space-y-2 text-xs text-gray-400 leading-relaxed">
                            <p>Einstein's photoelectric equation:</p>
                            <p className="text-[#CC66DA] font-mono text-center text-sm">KE = hf - Φ</p>
                            <p>Electrons are only ejected when <span className="text-white">f &gt; Φ/h</span> (threshold frequency).</p>
                            <p>Increasing intensity increases the number of electrons but not their kinetic energy.</p>
                        </div>
                    </div>

                    <div className="bg-[#0a0a0a] border border-[#9929EA]/30 rounded-xl p-5">
                        <h3 className="text-sm font-bold text-[#FAEB92] mb-3">Measurements</h3>
                        <div className="grid grid-cols-2 gap-3 text-center text-sm font-mono">
                            <div>
                                <span className="text-gray-500 block text-xs">Frequency</span>
                                <span className="text-[#CC66DA]">{frequency.toFixed(2)} PHz</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-xs">Work Func.</span>
                                <span className="text-[#9929EA]">{workFunction.toFixed(2)} eV</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-xs">KE</span>
                                <span className="text-green-400">{ke.toFixed(2)} eV</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-xs">Status</span>
                                <span className={canEmit ? "text-green-400" : "text-red-400"}>{canEmit ? "Emitting" : "Blocked"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
