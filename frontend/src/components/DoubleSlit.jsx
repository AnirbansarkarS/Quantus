import React, { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Line } from "@react-three/drei";
import * as THREE from "three";
import { Link } from "react-router-dom";
import { ArrowLeft, Play, Pause, RotateCcw } from "lucide-react";

// ─── Physics constants ───────────────────────────────────────────
const SLIT_Y = -2;
const DETECTOR_Y = 4;
const EMITTER_Y = -5;

function Barrier({ slitWidth, slitSep }) {
    const hw = slitSep / 2;
    const sw = slitWidth / 2;
    const barW = 8;
    const thick = 0.08;
    const depth = 0.3;

    // Segments: left, center, right
    const segments = useMemo(() => {
        const leftEnd = -(hw + sw);
        const centerLeft = -(hw - sw);
        const centerRight = hw - sw;
        const rightStart = hw + sw;
        return [
            { x: (-barW + leftEnd) / 2, w: leftEnd + barW },
            { x: (centerLeft + centerRight) / 2, w: centerRight - centerLeft },
            { x: (rightStart + barW) / 2, w: barW - rightStart },
        ];
    }, [slitWidth, slitSep]);

    return (
        <group position={[0, SLIT_Y, 0]}>
            {segments.map((seg, i) => (
                <mesh key={i} position={[seg.x, 0, 0]}>
                    <boxGeometry args={[seg.w, thick, depth]} />
                    <meshStandardMaterial color="#9929EA" emissive="#9929EA" emissiveIntensity={0.5} />
                </mesh>
            ))}
        </group>
    );
}

function DetectorScreen({ hitMap }) {
    const meshRef = useRef();
    const geometry = useMemo(() => new THREE.PlaneGeometry(8, 0.3, 200, 1), []);

    useFrame(() => {
        if (!meshRef.current) return;
        const colors = geometry.attributes.position.array;
        const colorArr = new Float32Array((colors.length / 3) * 3);

        const maxHit = Math.max(1, ...Object.values(hitMap));
        for (let i = 0; i < colors.length / 3; i++) {
            const x = colors[i * 3];
            const bin = Math.floor((x + 4) * 25); // 200 bins across width 8
            const val = (hitMap[bin] || 0) / maxHit;
            // Purple gradient
            colorArr[i * 3] = 0.6 * val + 0.05;
            colorArr[i * 3 + 1] = 0.15 * val;
            colorArr[i * 3 + 2] = 0.92 * val + 0.05;
        }
        geometry.setAttribute("color", new THREE.Float32BufferAttribute(colorArr, 3));
        geometry.attributes.color.needsUpdate = true;
    });

    return (
        <mesh ref={meshRef} geometry={geometry} position={[0, DETECTOR_Y, 0]}>
            <meshBasicMaterial vertexColors side={THREE.DoubleSide} />
        </mesh>
    );
}

function Particles({ particles }) {
    const ref = useRef();
    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame(() => {
        if (!ref.current) return;
        particles.forEach((p, i) => {
            dummy.position.set(p.x, p.y, p.z || 0);
            dummy.scale.setScalar(p.alive ? 0.04 : 0);
            dummy.updateMatrix();
            ref.current.setMatrixAt(i, dummy.matrix);
        });
        ref.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={ref} args={[null, null, particles.length]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial color="#00ffff" />
        </instancedMesh>
    );
}

function Simulation({ running, slitWidth, slitSep, wavelength, rate }) {
    const particlesRef = useRef([]);
    const hitMapRef = useRef({});
    const [hitMap, setHitMap] = useState({});
    const frameCount = useRef(0);

    // Reset on param change
    useEffect(() => {
        particlesRef.current = [];
        hitMapRef.current = {};
        setHitMap({});
    }, [slitWidth, slitSep, wavelength]);

    useFrame(() => {
        if (!running) return;
        frameCount.current++;

        // Spawn particles
        if (frameCount.current % Math.max(1, Math.floor(6 / rate)) === 0) {
            for (let i = 0; i < 3; i++) {
                const x = (Math.random() - 0.5) * 0.5;
                particlesRef.current.push({
                    x,
                    y: EMITTER_Y,
                    z: (Math.random() - 0.5) * 0.1,
                    vx: 0,
                    vy: 0.08,
                    alive: true,
                    passedSlit: false,
                });
            }
        }

        // Limit particle count
        if (particlesRef.current.length > 2000) {
            particlesRef.current = particlesRef.current.slice(-2000);
        }

        const hw = slitSep / 2;
        const sw = slitWidth / 2;
        const lambda = wavelength;

        particlesRef.current.forEach((p) => {
            if (!p.alive) return;

            p.y += p.vy;
            p.x += p.vx;

            // At slit level — apply diffraction
            if (!p.passedSlit && p.y >= SLIT_Y) {
                p.passedSlit = true;

                // Double slit diffraction probability
                // Pick which slit (or block)
                const distToSlit1 = Math.abs(p.x - (-hw));
                const distToSlit2 = Math.abs(p.x - hw);

                if (distToSlit1 > sw && distToSlit2 > sw) {
                    // Blocked by barrier
                    p.alive = false;
                    return;
                }

                // Calculate diffraction angle using sinc pattern
                // θ = random weighted by interference pattern
                const d = slitSep;
                const a = slitWidth;
                const targetX = (Math.random() - 0.5) * 8;
                const sinTheta = targetX / Math.sqrt(targetX * targetX + (DETECTOR_Y - SLIT_Y) ** 2);

                // Intensity = cos²(πd·sinθ/λ) · sinc²(πa·sinθ/λ)
                const phase1 = Math.PI * d * sinTheta / lambda;
                const phase2 = Math.PI * a * sinTheta / lambda;
                const envelopeTerm = phase2 === 0 ? 1 : Math.sin(phase2) / phase2;
                const intensity = Math.cos(phase1) ** 2 * envelopeTerm ** 2;

                // Accept/reject sampling
                if (Math.random() < intensity) {
                    p.x = targetX;
                    p.y = SLIT_Y + 0.1;
                    p.vy = 0.06;
                    p.vx = 0;
                } else {
                    p.alive = false;
                }
            }

            // Hit detector
            if (p.y >= DETECTOR_Y) {
                p.alive = false;
                const bin = Math.floor((p.x + 4) * 25);
                if (bin >= 0 && bin < 200) {
                    hitMapRef.current[bin] = (hitMapRef.current[bin] || 0) + 1;
                }
            }
        });

        // Update hitmap for rendering every 10 frames
        if (frameCount.current % 10 === 0) {
            setHitMap({ ...hitMapRef.current });
        }
    });

    const aliveParticles = particlesRef.current.filter((p) => p.alive);

    return (
        <>
            <Barrier slitWidth={slitWidth} slitSep={slitSep} />
            <DetectorScreen hitMap={hitMap} />
            <Particles particles={aliveParticles.length > 0 ? aliveParticles : [{ x: 0, y: -10, z: 0, alive: false }]} />

            {/* Labels */}
            <Text position={[0, EMITTER_Y - 0.5, 0]} fontSize={0.2} color="#FAEB92" anchorX="center">
                Particle Emitter
            </Text>
            <Text position={[0, DETECTOR_Y + 0.5, 0]} fontSize={0.2} color="#CC66DA" anchorX="center">
                Detector Screen
            </Text>

            {/* Emitter glow */}
            <mesh position={[0, EMITTER_Y, 0]}>
                <boxGeometry args={[1, 0.1, 0.3]} />
                <meshStandardMaterial color="#FAEB92" emissive="#FAEB92" emissiveIntensity={0.8} />
            </mesh>
        </>
    );
}

// ─── Main Component ──────────────────────────────────────────────
export default function DoubleSlit() {
    const [running, setRunning] = useState(true);
    const [slitWidth, setSlitWidth] = useState(0.3);
    const [slitSep, setSlitSep] = useState(1.2);
    const [wavelength, setWavelength] = useState(0.5);
    const [rate, setRate] = useState(2);

    const reset = () => {
        setRunning(false);
        setTimeout(() => setRunning(true), 100);
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
                    Double-Slit <span className="bg-gradient-to-r from-[#9929EA] via-[#CC66DA] to-[#FAEB92] text-transparent bg-clip-text">Interference</span>
                </h2>
                <p className="text-gray-400 text-lg">Watch quantum particles build up an interference pattern one at a time</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pointer-events-auto">
                {/* 3D Scene */}
                <div className="lg:col-span-2">
                    <div className="w-full h-96 md:h-[520px] bg-gradient-to-br from-[#9929EA]/5 to-[#CC66DA]/5 rounded-2xl border border-[#9929EA]/30 overflow-hidden">
                        <Canvas camera={{ position: [0, 0, 12], fov: 45 }}>
                            <ambientLight intensity={0.4} />
                            <pointLight position={[5, 5, 5]} intensity={0.6} />
                            <Simulation running={running} slitWidth={slitWidth} slitSep={slitSep} wavelength={wavelength} rate={rate} />
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
                        <button
                            onClick={reset}
                            className="px-5 py-2 border border-[#FAEB92]/40 hover:border-[#FAEB92] text-[#FAEB92] rounded-lg transition-all flex items-center gap-2 text-sm font-semibold"
                        >
                            <RotateCcw size={16} /> Reset
                        </button>
                    </div>
                </div>

                {/* Controls */}
                <div className="space-y-5">
                    <div className="bg-[#0a0a0a] border border-[#9929EA]/30 rounded-xl p-5">
                        <h3 className="text-lg font-bold text-[#FAEB92] mb-4">Parameters</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 flex justify-between">
                                    Slit Width <span className="text-white font-mono">{slitWidth.toFixed(2)}</span>
                                </label>
                                <input
                                    type="range" min="0.1" max="1" step="0.05" value={slitWidth}
                                    onChange={(e) => setSlitWidth(parseFloat(e.target.value))}
                                    className="w-full mt-1 accent-[#9929EA]"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 flex justify-between">
                                    Slit Separation <span className="text-white font-mono">{slitSep.toFixed(2)}</span>
                                </label>
                                <input
                                    type="range" min="0.5" max="3" step="0.1" value={slitSep}
                                    onChange={(e) => setSlitSep(parseFloat(e.target.value))}
                                    className="w-full mt-1 accent-[#9929EA]"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 flex justify-between">
                                    Wavelength λ <span className="text-white font-mono">{wavelength.toFixed(2)}</span>
                                </label>
                                <input
                                    type="range" min="0.1" max="2" step="0.05" value={wavelength}
                                    onChange={(e) => setWavelength(parseFloat(e.target.value))}
                                    className="w-full mt-1 accent-[#CC66DA]"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 flex justify-between">
                                    Particle Rate <span className="text-white font-mono">{rate.toFixed(0)}</span>
                                </label>
                                <input
                                    type="range" min="1" max="5" step="1" value={rate}
                                    onChange={(e) => setRate(parseFloat(e.target.value))}
                                    className="w-full mt-1 accent-[#FAEB92]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0a0a0a] border border-[#9929EA]/30 rounded-xl p-5">
                        <h3 className="text-sm font-bold text-[#FAEB92] mb-3">How It Works</h3>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Individual particles are fired through two narrow slits. Each particle arrives at a single point on the detector, but over time, an interference pattern emerges — evidence of wave-particle duality. The pattern follows:
                        </p>
                        <p className="text-xs text-[#CC66DA] font-mono mt-2 text-center">
                            I(θ) = cos²(πd·sinθ/λ) · sinc²(πa·sinθ/λ)
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
