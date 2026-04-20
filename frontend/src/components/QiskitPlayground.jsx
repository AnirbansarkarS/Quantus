import React, { useState, useCallback, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { Link } from "react-router-dom";
import { ArrowLeft, Play, Code2, Cpu, BarChart3, FileText, ChevronDown, Terminal } from "lucide-react";

// ─── Circuit Templates ───────────────────────────────────────────
const TEMPLATES = {
    bell: {
        name: "Bell State",
        qubits: 2,
        code: `# Bell State Circuit
# Creates maximally entangled state |Φ+⟩ = (|00⟩ + |11⟩)/√2

qc = QuantumCircuit(2, 2)
qc.h(0)      # Hadamard on qubit 0
qc.cx(0, 1)  # CNOT: control=0, target=1
qc.measure([0, 1], [0, 1])

# Expected: ~50% |00⟩, ~50% |11⟩`,
        gates: [
            { gate: "H", qubit: 0, step: 0 },
            { gate: "●", qubit: 0, step: 1, control: true, target: 1 },
            { gate: "⊕", qubit: 1, step: 1 },
            { gate: "M", qubit: 0, step: 2 },
            { gate: "M", qubit: 1, step: 2 },
        ],
        results: { "00": 500, "11": 500 },
    },
    ghz: {
        name: "GHZ State",
        qubits: 3,
        code: `# GHZ State (3 qubits)
# Creates |GHZ⟩ = (|000⟩ + |111⟩)/√2

qc = QuantumCircuit(3, 3)
qc.h(0)
qc.cx(0, 1)
qc.cx(0, 2)
qc.measure([0, 1, 2], [0, 1, 2])

# Expected: ~50% |000⟩, ~50% |111⟩`,
        gates: [
            { gate: "H", qubit: 0, step: 0 },
            { gate: "●", qubit: 0, step: 1, control: true, target: 1 },
            { gate: "⊕", qubit: 1, step: 1 },
            { gate: "●", qubit: 0, step: 2, control: true, target: 2 },
            { gate: "⊕", qubit: 2, step: 2 },
            { gate: "M", qubit: 0, step: 3 },
            { gate: "M", qubit: 1, step: 3 },
            { gate: "M", qubit: 2, step: 3 },
        ],
        results: { "000": 510, "111": 490 },
    },
    teleportation: {
        name: "Teleportation",
        qubits: 3,
        code: `# Quantum Teleportation Protocol
# Teleport state of qubit 0 to qubit 2

qc = QuantumCircuit(3, 3)

# Prepare state to teleport
qc.h(0)

# Create Bell pair (qubits 1 & 2)
qc.h(1)
qc.cx(1, 2)

# Bell measurement
qc.cx(0, 1)
qc.h(0)
qc.measure([0, 1], [0, 1])

# Conditional corrections
qc.cx(1, 2)
qc.cz(0, 2)
qc.measure(2, 2)`,
        gates: [
            { gate: "H", qubit: 0, step: 0 },
            { gate: "H", qubit: 1, step: 1 },
            { gate: "●", qubit: 1, step: 2, control: true, target: 2 },
            { gate: "⊕", qubit: 2, step: 2 },
            { gate: "●", qubit: 0, step: 3, control: true, target: 1 },
            { gate: "⊕", qubit: 1, step: 3 },
            { gate: "H", qubit: 0, step: 4 },
            { gate: "M", qubit: 0, step: 5 },
            { gate: "M", qubit: 1, step: 5 },
            { gate: "M", qubit: 2, step: 6 },
        ],
        results: { "000": 250, "001": 250, "010": 250, "011": 250 },
    },
    grover: {
        name: "Grover's Search",
        qubits: 2,
        code: `# Grover's Algorithm (2 qubits)
# Searching for |11⟩

qc = QuantumCircuit(2, 2)

# Initialize superposition
qc.h(0)
qc.h(1)

# Oracle: mark |11⟩
qc.cz(0, 1)

# Diffusion operator
qc.h(0)
qc.h(1)
qc.z(0)
qc.z(1)
qc.cz(0, 1)
qc.h(0)
qc.h(1)

qc.measure([0, 1], [0, 1])

# Expected: high probability of |11⟩`,
        gates: [
            { gate: "H", qubit: 0, step: 0 },
            { gate: "H", qubit: 1, step: 0 },
            { gate: "CZ", qubit: 0, step: 1 },
            { gate: "CZ", qubit: 1, step: 1 },
            { gate: "H", qubit: 0, step: 2 },
            { gate: "H", qubit: 1, step: 2 },
            { gate: "Z", qubit: 0, step: 3 },
            { gate: "Z", qubit: 1, step: 3 },
            { gate: "CZ", qubit: 0, step: 4 },
            { gate: "CZ", qubit: 1, step: 4 },
            { gate: "H", qubit: 0, step: 5 },
            { gate: "H", qubit: 1, step: 5 },
            { gate: "M", qubit: 0, step: 6 },
            { gate: "M", qubit: 1, step: 6 },
        ],
        results: { "00": 10, "01": 10, "10": 10, "11": 970 },
    },
    superposition: {
        name: "Superposition",
        qubits: 1,
        code: `# Single Qubit Superposition
# Apply Hadamard to create equal superposition

qc = QuantumCircuit(1, 1)
qc.h(0)
qc.measure(0, 0)

# Expected: ~50% |0⟩, ~50% |1⟩`,
        gates: [
            { gate: "H", qubit: 0, step: 0 },
            { gate: "M", qubit: 0, step: 1 },
        ],
        results: { "0": 510, "1": 490 },
    },
};

// ─── Circuit Diagram SVG ─────────────────────────────────────────
function CircuitDiagram({ data }) {
    if (!data) return null;
    const { qubits, gates } = data;
    const maxStep = gates.length > 0 ? Math.max(...gates.map((g) => g.step)) + 1 : 1;
    const cellW = 60;
    const cellH = 50;
    const padLeft = 60;
    const padTop = 30;
    const svgW = padLeft + maxStep * cellW + 40;
    const svgH = padTop + qubits * cellH + 20;

    return (
        <div className="overflow-x-auto">
            <svg width={svgW} height={svgH} className="mx-auto">
                {/* Qubit lines */}
                {Array.from({ length: qubits }).map((_, q) => (
                    <g key={`q-${q}`}>
                        <text x={15} y={padTop + q * cellH + 5} fill="#FAEB92" fontSize={12} fontFamily="monospace">
                            q{q}
                        </text>
                        <line
                            x1={padLeft - 10}
                            y1={padTop + q * cellH}
                            x2={padLeft + maxStep * cellW}
                            y2={padTop + q * cellH}
                            stroke="#444"
                            strokeWidth={1}
                        />
                    </g>
                ))}

                {/* Gates */}
                {gates.map((g, i) => {
                    const x = padLeft + g.step * cellW + cellW / 2;
                    const y = padTop + g.qubit * cellH;

                    // CNOT connections
                    if (g.control && g.target !== undefined) {
                        const ty = padTop + g.target * cellH;
                        return (
                            <g key={i}>
                                <line x1={x} y1={y} x2={x} y2={ty} stroke="#00ffff" strokeWidth={1.5} />
                                <circle cx={x} cy={y} r={5} fill="#00ffff" />
                            </g>
                        );
                    }

                    if (g.gate === "⊕") {
                        return (
                            <g key={i}>
                                <circle cx={x} cy={y} r={12} fill="none" stroke="#00ffff" strokeWidth={1.5} />
                                <line x1={x - 8} y1={y} x2={x + 8} y2={y} stroke="#00ffff" strokeWidth={1.5} />
                                <line x1={x} y1={y - 8} x2={x} y2={y + 8} stroke="#00ffff" strokeWidth={1.5} />
                            </g>
                        );
                    }

                    if (g.gate === "M") {
                        return (
                            <g key={i}>
                                <rect x={x - 15} y={y - 15} width={30} height={30} rx={3} fill="#333" stroke="#FAEB92" strokeWidth={1} />
                                <text x={x} y={y + 4} fill="#FAEB92" fontSize={11} fontFamily="monospace" textAnchor="middle">
                                    M
                                </text>
                            </g>
                        );
                    }

                    // Standard gate box
                    const isSpecial = g.gate === "CZ";
                    return (
                        <g key={i}>
                            <rect
                                x={x - 16} y={y - 16} width={32} height={32} rx={4}
                                fill={isSpecial ? "#1a1a2e" : "#1a0a2e"}
                                stroke="#9929EA"
                                strokeWidth={1.5}
                            />
                            <text x={x} y={y + 5} fill="white" fontSize={12} fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                                {g.gate}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

// ─── Histogram ───────────────────────────────────────────────────
function Histogram({ results }) {
    const total = Object.values(results).reduce((a, b) => a + b, 0);
    const maxVal = Math.max(...Object.values(results));
    const entries = Object.entries(results).sort(([a], [b]) => a.localeCompare(b));
    const colors = ["#9929EA", "#CC66DA", "#FAEB92", "#00ffff", "#ff8844", "#40ff40", "#ff4444", "#8888ff"];

    return (
        <div className="space-y-2">
            {entries.map(([state, count], i) => {
                const pct = ((count / total) * 100).toFixed(1);
                const barW = (count / maxVal) * 100;
                return (
                    <div key={state} className="flex items-center gap-3">
                        <span className="text-xs font-mono text-white w-12 text-right">|{state}⟩</span>
                        <div className="flex-1 bg-[#1a1a1a] rounded h-6 overflow-hidden relative">
                            <div
                                className="h-full rounded transition-all duration-700"
                                style={{
                                    width: `${barW}%`,
                                    background: `linear-gradient(90deg, ${colors[i % colors.length]}, ${colors[(i + 1) % colors.length]})`,
                                }}
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white/70 font-mono">
                                {pct}%
                            </span>
                        </div>
                        <span className="text-xs text-gray-500 font-mono w-12">{count}</span>
                    </div>
                );
            })}
            <p className="text-xs text-gray-600 text-center mt-2">Total shots: {total}</p>
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────
export default function QiskitPlayground() {
    const [activeTemplate, setActiveTemplate] = useState("bell");
    const [code, setCode] = useState(TEMPLATES.bell.code);
    const [output, setOutput] = useState(null);
    const [terminalOutput, setTerminalOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [pyodideInstance, setPyodideInstance] = useState(null);
    const [engineStatus, setEngineStatus] = useState("loading");
    const [isRealtimeRunning, setIsRealtimeRunning] = useState(false);
    const [dynamicCircuit, setDynamicCircuit] = useState(null);
    const [terminalCommand, setTerminalCommand] = useState("");
    const [terminalHistory, setTerminalHistory] = useState([]);
    const [isTerminalBusy, setIsTerminalBusy] = useState(false);
    const realtimeRunRef = useRef(0);

    useEffect(() => {
        let disposed = false;

        const initPyodide = async () => {
            try {
                const { loadPyodide } = await import("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.mjs");
                const py = await loadPyodide({
                    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/",
                });

                py.runPython(`
import json

_circuits = []

class QuantumCircuit:
    def __init__(self, num_qubits, num_clbits=0, *args, **kwargs):
        if isinstance(num_qubits, list):
            self.num_qubits = len(num_qubits)
        else:
            self.num_qubits = num_qubits
            
        self.gates = []
        self._qubit_steps = [0] * self.num_qubits
        global _circuits
        _circuits.append(self)
        
    def _add_gate(self, name, qubits, control=None, target=None):
        step = max((self._qubit_steps[q] for q in qubits if q < self.num_qubits), default=0)
        if control is not None:
            self.gates.append({"gate": name, "qubit": control, "step": step, "control": True, "target": target})
            self.gates.append({"gate": "⊕", "qubit": target, "step": step})
        elif name == "CZ":
            self.gates.append({"gate": "CZ", "qubit": qubits[0], "step": step})
            self.gates.append({"gate": "CZ", "qubit": qubits[1], "step": step})
        else:
            for q in qubits:
                self.gates.append({"gate": name, "qubit": q, "step": step})
                
        for q in qubits:
            if q < self.num_qubits:
                self._qubit_steps[q] = step + 1

    def h(self, qubit): self._add_gate("H", [qubit])
    def z(self, qubit): self._add_gate("Z", [qubit])
    def x(self, qubit): self._add_gate("X", [qubit])
    def y(self, qubit): self._add_gate("Y", [qubit])
    def cy(self, control, target): self._add_gate("CY", [control, target])
    def cx(self, control, target): self._add_gate("●", [control, target], control=control, target=target)
    def cz(self, control, target): self._add_gate("CZ", [control, target])
    
    def measure(self, qubit, clbit=None):
        if isinstance(qubit, list):
            self._add_gate("M", qubit)
        else:
            self._add_gate("M", [qubit])

def _get_last_circuit_json():
    global _circuits
    if not _circuits: return "{}"
    last = _circuits[-1]
    return json.dumps({"qubits": last.num_qubits, "gates": last.gates})
                `);

                if (!disposed) {
                    setPyodideInstance(py);
                    setEngineStatus("ready");
                    setTerminalOutput("Python engine ready. Try: print(\"hello\") and click Run Circuit.");
                }
            } catch (error) {
                if (!disposed) {
                    setEngineStatus("error");
                    setTerminalOutput(`Python engine failed to load: ${error?.message || String(error)}`);
                }
            }
        };

        initPyodide();

        return () => {
            disposed = true;
        };
    }, []);

    const template = TEMPLATES[activeTemplate];

    const addTerminalLog = useCallback((line) => {
        setTerminalHistory((prev) => [...prev, line]);
    }, []);

    const executePythonCode = useCallback(async (sourceCode) => {
        if (!pyodideInstance) {
            return engineStatus === "error"
                ? "Python engine is unavailable. Check the error above and refresh the page."
                : "Python engine is still loading, please wait a moment and run again.";
        }

        try {
            pyodideInstance.runPython(`
import sys
import io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
if '_circuits' in globals():
    _circuits.clear()
            `);

            await pyodideInstance.runPythonAsync(sourceCode);

            const stdout = pyodideInstance.runPython("sys.stdout.getvalue()");
            const stderr = pyodideInstance.runPython("sys.stderr.getvalue()");
            return [stdout, stderr].filter(Boolean).join("\n") || "Simulation completed successfully (no print output).";
        } catch (error) {
            return error?.toString?.() || String(error);
        }
    }, [pyodideInstance, engineStatus]);

    useEffect(() => {
        if (!code?.trim()) {
            setTerminalOutput("");
            return;
        }

        const runId = ++realtimeRunRef.current;
        setIsRealtimeRunning(true);

        const timer = setTimeout(async () => {
            const result = await executePythonCode(code);
            if (runId === realtimeRunRef.current) {
                setTerminalOutput(result);
                
                try {
                    if (pyodideInstance) {
                        const jsonStr = pyodideInstance.runPython("_get_last_circuit_json()");
                        if (jsonStr && jsonStr !== "{}" && jsonStr !== "null") {
                            setDynamicCircuit(JSON.parse(jsonStr));
                        } else {
                            setDynamicCircuit({ qubits: 0, gates: [] });
                        }
                    }
                } catch (err) {
                    console.warn("Could not parse circuit data dynamically:", err);
                }
                
                setIsRealtimeRunning(false);
            }
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, [code, executePythonCode]);

    const selectTemplate = (key) => {
        setActiveTemplate(key);
        setCode(TEMPLATES[key].code);
        setDynamicCircuit(null);
        setOutput(null);
        setTerminalOutput("");
        setShowTemplates(false);
    };

    const runCircuit = useCallback(async () => {
        setIsRunning(true);
        setOutput(null);
        setTerminalOutput("Running circuit...");

        const pythonResult = await executePythonCode(code);

        try {
            if (pyodideInstance) {
                const jsonStr = pyodideInstance.runPython("_get_last_circuit_json()");
                if (jsonStr && jsonStr !== "{}" && jsonStr !== "null") {
                    setDynamicCircuit(JSON.parse(jsonStr));
                } else {
                    setDynamicCircuit({ qubits: 0, gates: [] });
                }
            }
        } catch (err) {
            console.warn("Could not parse circuit data dynamically:", err);
        }

        setTimeout(() => {
            const baseResults = { ...TEMPLATES[activeTemplate].results };
            const noisy = {};
            const total = Object.values(baseResults).reduce((a, b) => a + b, 0);

            Object.entries(baseResults).forEach(([state, count]) => {
                const noise = Math.floor((Math.random() - 0.5) * total * 0.05);
                noisy[state] = Math.max(1, count + noise);
            });

            setOutput({
                results: noisy,
                template: TEMPLATES[activeTemplate],
            });
            setTerminalOutput(pythonResult);
            setIsRunning(false);
        }, 800);
    }, [activeTemplate, code, executePythonCode]);

    const runTerminalCommand = useCallback(async () => {
        const command = terminalCommand.trim();
        if (!command || isTerminalBusy) {
            return;
        }

        addTerminalLog(`$ ${command}`);
        setTerminalCommand("");
        setIsTerminalBusy(true);

        if (!pyodideInstance) {
            addTerminalLog("Python engine is not ready yet.");
            setIsTerminalBusy(false);
            return;
        }

        try {
            if (command.startsWith("pip install ")) {
                const packages = command
                    .slice("pip install ".length)
                    .split(/\s+/)
                    .map((pkg) => pkg.trim())
                    .filter(Boolean);

                if (packages.length === 0) {
                    addTerminalLog("Usage: pip install <package> [package2 ...]");
                    setIsTerminalBusy(false);
                    return;
                }

                addTerminalLog("Installing packages...");
                await pyodideInstance.loadPackage("micropip");

                for (const pkg of packages) {
                    if (pkg.toLowerCase() === "qiskit") {
                        addTerminalLog("Note: full qiskit may fail in browser runtime due to native dependencies.");
                    }

                    const safePkg = pkg.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
                    await pyodideInstance.runPythonAsync(`
import micropip
await micropip.install("${safePkg}")
                    `);
                    addTerminalLog(`Installed: ${pkg}`);
                }
            } else if (command === "pip list") {
                const result = await executePythonCode(`
import importlib.metadata as md
for d in sorted(md.distributions(), key=lambda x: (x.metadata.get('Name') or '').lower()):
    name = d.metadata.get('Name') or 'unknown'
    print(f"{name}=={d.version}")
                `);
                addTerminalLog(result);
            } else if (command === "clear") {
                setTerminalHistory([]);
            } else {
                const result = await executePythonCode(command);
                addTerminalLog(result);
            }
        } catch (error) {
            addTerminalLog(error?.toString?.() || String(error));
        } finally {
            setIsTerminalBusy(false);
        }
    }, [terminalCommand, isTerminalBusy, pyodideInstance, addTerminalLog, executePythonCode]);

    return (
        <section className="py-20 px-4 max-w-7xl mx-auto relative z-10 pointer-events-none overflow-visible pt-24">
            <div className="pointer-events-auto mb-6">
                <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#FAEB92] transition-colors text-sm mb-4">
                    <ArrowLeft size={16} /> Back to Experiments
                </Link>
            </div>
            <div className="text-center mb-10 space-y-3 pointer-events-auto">
                <h2 className="text-3xl md:text-5xl font-bold">
                    Quantum <span className="bg-gradient-to-r from-[#9929EA] via-[#CC66DA] to-[#FAEB92] text-transparent bg-clip-text">Playground</span>
                </h2>
                <p className="text-gray-400 text-lg">Write Qiskit-style code, visualize circuits, and simulate measurements</p>
            </div>

            <div className="pointer-events-auto">
                {/* Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    {/* Template Selector */}
                    <div className="relative">
                        <button
                            onClick={() => setShowTemplates(!showTemplates)}
                            className="px-4 py-2 bg-[#0a0a0a] border border-[#9929EA]/30 hover:border-[#CC66DA] rounded-lg text-sm text-white flex items-center gap-2 transition-all"
                        >
                            <FileText size={14} />
                            {template.name}
                            <ChevronDown size={14} className={`transition-transform ${showTemplates ? "rotate-180" : ""}`} />
                        </button>
                        {showTemplates && (
                            <div className="absolute top-full mt-2 left-0 z-50 bg-[#0a0a0a] border border-[#9929EA]/30 rounded-lg overflow-hidden min-w-[200px] shadow-[0_0_30px_rgba(153,41,234,0.2)]">
                                {Object.entries(TEMPLATES).map(([key, t]) => (
                                    <button
                                        key={key}
                                        onClick={() => selectTemplate(key)}
                                        className={`w-full text-left px-4 py-2.5 text-sm transition-all ${activeTemplate === key
                                                ? "bg-[#9929EA]/20 text-[#FAEB92]"
                                                : "text-gray-400 hover:bg-[#9929EA]/10 hover:text-white"
                                            }`}
                                    >
                                        {t.name}
                                        <span className="text-xs text-gray-600 ml-2">({t.qubits}q)</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Run Button */}
                    <button
                        onClick={runCircuit}
                        disabled={isRunning}
                        className="px-6 py-2.5 bg-gradient-to-r from-[#9929EA] to-[#CC66DA] hover:from-[#CC66DA] hover:to-[#FAEB92] disabled:opacity-50 text-white rounded-lg transition-all flex items-center gap-2 text-sm font-semibold shadow-[0_0_15px_rgba(153,41,234,0.3)]"
                    >
                        {isRunning ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Simulating...
                            </>
                        ) : (
                            <>
                                <Play size={16} fill="white" /> Run Circuit
                            </>
                        )}
                    </button>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {/* Code Editor and Terminal */}
                    <div className="flex flex-col gap-4">
                        <div className="bg-[#0a0a0a] border border-[#9929EA]/30 rounded-xl overflow-hidden flex-1">
                            <div className="px-4 py-2 border-b border-[#9929EA]/20 flex items-center justify-between text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                    <Code2 size={14} /> Editor
                                </div>
                                <span className={`text-[10px] ${
                                    engineStatus === "ready"
                                        ? "text-green-400"
                                        : engineStatus === "error"
                                            ? "text-red-400"
                                            : "text-yellow-400"
                                }`}>
                                    {engineStatus === "ready"
                                        ? "Python Ready"
                                        : engineStatus === "error"
                                            ? "Engine Error"
                                            : "Loading Engine..."}
                                </span>
                            </div>
                            <Editor
                                height="320px"
                                defaultLanguage="python"
                                value={code}
                                onChange={(v) => setCode(v || "")}
                                theme="vs-dark"
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 13,
                                    lineNumbers: "on",
                                    scrollBeyondLastLine: false,
                                    padding: { top: 12 },
                                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                    wordWrap: "on",
                                    suggest: { showWords: false },
                                }}
                            />
                        </div>

                        {/* Terminal Output */}
                        <div className="bg-[#0a0a0a] border border-[#9929EA]/30 rounded-xl overflow-hidden h-[180px] flex flex-col">
                            <div className="px-4 py-2 border-b border-[#9929EA]/20 flex items-center justify-between gap-2 text-sm text-gray-400 bg-[#121212]">
                                <div className="flex items-center gap-2">
                                    <Terminal size={14} /> Output Console (Jupyter-style)
                                </div>
                                <span className={`text-[10px] ${isRealtimeRunning ? "text-yellow-400" : "text-green-400"}`}>
                                    {isRealtimeRunning ? "Live compiling..." : "Live mode on"}
                                </span>
                            </div>
                            <div className="p-4 overflow-y-auto font-mono text-sm whitespace-pre-wrap flex-1 text-gray-300">
                                {terminalOutput || (
                                    <span className="text-gray-600 italic">Run python code to see stdout here...</span>
                                )}
                            </div>
                        </div>

                        <div className="bg-[#0a0a0a] border border-[#9929EA]/30 rounded-xl overflow-hidden h-[220px] flex flex-col">
                            <div className="px-4 py-2 border-b border-[#9929EA]/20 flex items-center justify-between gap-2 text-sm text-gray-400 bg-[#121212]">
                                <div className="flex items-center gap-2">
                                    <Terminal size={14} /> Package Terminal
                                </div>
                                <span className={`text-[10px] ${isTerminalBusy ? "text-yellow-400" : "text-gray-500"}`}>
                                    {isTerminalBusy ? "Running command..." : "Use: pip install, pip list, clear"}
                                </span>
                            </div>

                            <div className="px-4 py-3 overflow-y-auto font-mono text-xs whitespace-pre-wrap flex-1 text-gray-300 space-y-1">
                                {terminalHistory.length > 0 ? (
                                    terminalHistory.map((line, idx) => (
                                        <div key={`${line}-${idx}`}>{line}</div>
                                    ))
                                ) : (
                                    <span className="text-gray-600 italic">Try: pip install numpy</span>
                                )}
                            </div>

                            <div className="p-3 border-t border-[#9929EA]/20 flex items-center gap-2">
                                <span className="font-mono text-xs text-[#FAEB92]">$</span>
                                <input
                                    type="text"
                                    value={terminalCommand}
                                    onChange={(e) => setTerminalCommand(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            runTerminalCommand();
                                        }
                                    }}
                                    placeholder="pip install qiskit"
                                    className="flex-1 bg-[#121212] border border-[#9929EA]/30 rounded px-3 py-2 text-xs text-gray-200 outline-none focus:border-[#CC66DA]"
                                />
                                <button
                                    onClick={runTerminalCommand}
                                    disabled={isTerminalBusy || !terminalCommand.trim()}
                                    className="px-3 py-2 rounded text-xs font-semibold bg-[#9929EA] hover:bg-[#CC66DA] disabled:opacity-50 text-white transition-colors"
                                >
                                    Run
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Output Panel */}
                    <div className="space-y-4">
                        {/* Circuit Diagram */}
                        <div className="bg-[#0a0a0a] border border-[#9929EA]/30 rounded-xl overflow-hidden">
                            <div className="px-4 py-2 border-b border-[#9929EA]/20 flex items-center gap-2 text-sm text-gray-400">
                                <Cpu size={14} /> Circuit Diagram
                            </div>
                            <div className="p-4">
                                <CircuitDiagram data={dynamicCircuit || template} />
                            </div>
                        </div>

                        {/* Results */}
                        <div className="bg-[#0a0a0a] border border-[#9929EA]/30 rounded-xl overflow-hidden">
                            <div className="px-4 py-2 border-b border-[#9929EA]/20 flex items-center gap-2 text-sm text-gray-400">
                                <BarChart3 size={14} /> Measurement Results
                            </div>
                            <div className="p-4">
                                {output ? (
                                    <Histogram results={output.results} />
                                ) : (
                                    <div className="text-center py-8 text-gray-600 text-sm">
                                        Click <span className="text-[#FAEB92] font-bold">Run Circuit</span> to simulate
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="mt-6 bg-[#0a0a0a] border border-[#9929EA]/30 rounded-xl p-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <h4 className="text-[#FAEB92] font-bold mb-1">📝 Write</h4>
                            <p className="text-gray-500 text-xs">Write Qiskit-style Python code or pick a template from the library</p>
                        </div>
                        <div>
                            <h4 className="text-[#CC66DA] font-bold mb-1">🔀 Visualize</h4>
                            <p className="text-gray-500 text-xs">See the quantum circuit diagram with gates, qubits, and measurements</p>
                        </div>
                        <div>
                            <h4 className="text-[#9929EA] font-bold mb-1">📊 Simulate</h4>
                            <p className="text-gray-500 text-xs">Run 1000 shots and view the measurement histogram with probability distribution</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
