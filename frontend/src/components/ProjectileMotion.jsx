import React, { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Line, Grid } from "@react-three/drei";
import * as THREE from "three";
import { Link } from "react-router-dom";
import { ArrowLeft, Play, RotateCcw, Rocket } from "lucide-react";

function Ground() {
    return (
        <group>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
                <planeGeometry args={[30, 30]} />
                <meshStandardMaterial color="#111" transparent opacity={0.5} />
            </mesh>
            <gridHelper args={[30, 30, "#9929EA", "#1a1a1a"]} position={[0, 0, 0]} />
        </group>
    );
}

function Projectile({ trajectory, currentIdx }) {
    const meshRef = useRef();
    const glowRef = useRef();

    useFrame(({ clock }) => {
        if (glowRef.current) {
            glowRef.current.material.opacity = 0.2 + Math.sin(clock.elapsedTime * 4) * 0.1;
        }
    });

    const pos = trajectory[currentIdx] || { x: 0, y: 0, z: 0 };

    return (
        <group position={[pos.x, pos.y, pos.z]}>
            <mesh ref={meshRef}>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshStandardMaterial color="#FAEB92" emissive="#FAEB92" emissiveIntensity={0.8} metalness={0.3} />
            </mesh>
            <mesh ref={glowRef}>
                <sphereGeometry args={[0.25, 16, 16]} />
                <meshBasicMaterial color="#FAEB92" transparent opacity={0.2} />
            </mesh>
        </group>
    );
}

function TrajectoryTrail({ trajectory, currentIdx }) {
    const points = useMemo(() => {
        return trajectory.slice(0, currentIdx + 1).map((p) => [p.x, p.y, p.z]);
    }, [trajectory, currentIdx]);

    if (points.length < 2) return null;

    return <Line points={points} color="#CC66DA" lineWidth={2} transparent opacity={0.7} />;
}

function ProjectileScene({ trajectory, currentIdx, maxHeight, range }) {
    return (
        <>
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={0.8} />
            <directionalLight position={[5, 8, 3]} intensity={0.5} />
            <Ground />
            <Projectile trajectory={trajectory} currentIdx={currentIdx} />
            <TrajectoryTrail trajectory={trajectory} currentIdx={currentIdx} />

            {/* Height marker */}
            {maxHeight > 0 && (
                <group>
                    <Line points={[[0, 0, 0.5], [0, maxHeight, 0.5]]} color="#FAEB92" lineWidth={1} dashed dashSize={0.1} gapSize={0.1} />
                    <Text position={[-0.5, maxHeight / 2, 0.5]} fontSize={0.15} color="#FAEB92" anchorX="right">
                        H = {maxHeight.toFixed(1)}m
                    </Text>
                </group>
            )}

            {/* Range marker */}
            {range > 0 && (
                <group>
                    <Line points={[[0, 0.05, 0], [range, 0.05, 0]]} color="#CC66DA" lineWidth={1} dashed dashSize={0.1} gapSize={0.1} />
                    <Text position={[range / 2, -0.3, 0]} fontSize={0.15} color="#CC66DA" anchorX="center">
                        R = {range.toFixed(1)}m
                    </Text>
                </group>
            )}

            <OrbitControls enableZoom enablePan dampingFactor={0.05} enableDamping />
        </>
    );
}

export default function ProjectileMotion() {
    const [angle, setAngle] = useState(45);
    const [velocity, setVelocity] = useState(10);
    const [gravity, setGravity] = useState(9.81);
    const [running, setRunning] = useState(false);
    const [currentIdx, setCurrentIdx] = useState(0);
    const animRef = useRef(null);

    const trajectory = useMemo(() => {
        const pts = [];
        const rad = (angle * Math.PI) / 180;
        const vx = velocity * Math.cos(rad);
        const vy = velocity * Math.sin(rad);
        const dt = 0.02;
        let t = 0;

        while (true) {
            const x = vx * t;
            const y = vy * t - 0.5 * gravity * t * t;
            if (y < 0 && t > 0) break;
            pts.push({ x: x * 0.3, y: Math.max(0, y * 0.3), z: 0 });
            t += dt;
            if (pts.length > 2000) break;
        }
        return pts;
    }, [angle, velocity, gravity]);

    const maxHeight = useMemo(() => {
        const rad = (angle * Math.PI) / 180;
        return ((velocity * Math.sin(rad)) ** 2) / (2 * gravity);
    }, [angle, velocity, gravity]);

    const range = useMemo(() => {
        const rad = (angle * Math.PI) / 180;
        return (velocity * velocity * Math.sin(2 * rad)) / gravity;
    }, [angle, velocity, gravity]);

    const flightTime = useMemo(() => {
        const rad = (angle * Math.PI) / 180;
        return (2 * velocity * Math.sin(rad)) / gravity;
    }, [angle, velocity, gravity]);

    const fire = () => {
        setCurrentIdx(0);
        setRunning(true);
        if (animRef.current) cancelAnimationFrame(animRef.current);

        let idx = 0;
        const step = () => {
            if (idx >= trajectory.length - 1) {
                setRunning(false);
                return;
            }
            idx += 2;
            setCurrentIdx(Math.min(idx, trajectory.length - 1));
            animRef.current = requestAnimationFrame(step);
        };
        animRef.current = requestAnimationFrame(step);
    };

    const reset = () => {
        if (animRef.current) cancelAnimationFrame(animRef.current);
        setRunning(false);
        setCurrentIdx(0);
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
                    Projectile <span className="bg-gradient-to-r from-[#FAEB92] via-[#ff8844] to-[#ff4444] text-transparent bg-clip-text">Motion</span>
                </h2>
                <p className="text-gray-400 text-lg">Launch projectiles and study parabolic trajectories in 3D</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pointer-events-auto">
                <div className="lg:col-span-2">
                    <div className="w-full h-96 md:h-[520px] bg-gradient-to-br from-[#9929EA]/5 to-[#CC66DA]/5 rounded-2xl border border-[#9929EA]/30 overflow-hidden">
                        <Canvas camera={{ position: [3, 3, 8], fov: 40 }}>
                            <ProjectileScene trajectory={trajectory} currentIdx={currentIdx} maxHeight={maxHeight * 0.3} range={range * 0.3} />
                        </Canvas>
                    </div>
                    <div className="flex justify-center gap-3 mt-4">
                        <button
                            onClick={fire}
                            disabled={running}
                            className="px-6 py-2.5 bg-gradient-to-r from-[#ff8844] to-[#ff4444] hover:from-[#ff9955] hover:to-[#ff5555] disabled:opacity-50 text-white rounded-lg transition-all flex items-center gap-2 text-sm font-semibold"
                        >
                            <Rocket size={16} /> Fire!
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
                        <h3 className="text-lg font-bold text-[#FAEB92] mb-4 flex items-center gap-2">
                            <Rocket size={18} /> Launch Parameters
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 flex justify-between">
                                    Angle <span className="text-white font-mono">{angle}°</span>
                                </label>
                                <input type="range" min="5" max="85" step="1" value={angle}
                                    onChange={(e) => { setAngle(parseInt(e.target.value)); reset(); }}
                                    className="w-full mt-1 accent-[#ff8844]" />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 flex justify-between">
                                    Velocity <span className="text-white font-mono">{velocity} m/s</span>
                                </label>
                                <input type="range" min="1" max="25" step="0.5" value={velocity}
                                    onChange={(e) => { setVelocity(parseFloat(e.target.value)); reset(); }}
                                    className="w-full mt-1 accent-[#ff4444]" />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 flex justify-between">
                                    Gravity <span className="text-white font-mono">{gravity.toFixed(1)} m/s²</span>
                                </label>
                                <input type="range" min="1" max="20" step="0.1" value={gravity}
                                    onChange={(e) => { setGravity(parseFloat(e.target.value)); reset(); }}
                                    className="w-full mt-1 accent-[#FAEB92]" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0a0a0a] border border-[#9929EA]/30 rounded-xl p-5">
                        <h3 className="text-sm font-bold text-[#FAEB92] mb-3">Computed Values</h3>
                        <div className="grid grid-cols-2 gap-3 text-center text-sm font-mono">
                            <div>
                                <span className="text-gray-500 block text-xs">Max Height</span>
                                <span className="text-[#FAEB92]">{maxHeight.toFixed(2)} m</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-xs">Range</span>
                                <span className="text-[#CC66DA]">{range.toFixed(2)} m</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-xs">Flight Time</span>
                                <span className="text-green-400">{flightTime.toFixed(2)} s</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-xs">Vx</span>
                                <span className="text-white">{(velocity * Math.cos((angle * Math.PI) / 180)).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0a0a0a] border border-[#9929EA]/30 rounded-xl p-5">
                        <h3 className="text-sm font-bold text-[#FAEB92] mb-3">Equations</h3>
                        <div className="space-y-1 text-xs text-gray-400 font-mono text-center">
                            <p className="text-[#CC66DA]">x(t) = v₀·cosθ · t</p>
                            <p className="text-[#CC66DA]">y(t) = v₀·sinθ · t - ½gt²</p>
                            <p className="text-[#FAEB92]">R = v₀²·sin(2θ) / g</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
