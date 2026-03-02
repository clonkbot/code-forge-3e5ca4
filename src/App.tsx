import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, Text, MeshDistortMaterial, Stars, Html } from '@react-three/drei'
import { useRef, useState, useMemo, Suspense } from 'react'
import * as THREE from 'three'

// Sample HTML and JSON outputs
const sampleOutputs = {
  html: `<!DOCTYPE html>
<html>
<head>
  <title>Space Shooter</title>
  <style>
    canvas { background: #000; }
    .score { color: #0ff; }
  </style>
</head>
<body>
  <canvas id="game"></canvas>
  <script>
    // Game logic here
    const ship = { x: 400, y: 500 };
    function update() {
      // Move & render
    }
  </script>
</body>
</html>`,
  json: `{
  "game": {
    "name": "Space Shooter",
    "version": "1.0.0",
    "settings": {
      "difficulty": "medium",
      "lives": 3,
      "powerups": true
    },
    "levels": [
      { "id": 1, "enemies": 10 },
      { "id": 2, "enemies": 25 }
    ]
  }
}`
}

// Floating code block component
function CodeBlock({ position, rotation, code, color, delay }: {
  position: [number, number, number]
  rotation: [number, number, number]
  code: string
  color: string
  delay: number
}) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3 + delay) * 0.1
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + delay) * 0.3
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh
        ref={meshRef}
        position={position}
        rotation={rotation}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.1 : 1}
      >
        <planeGeometry args={[3, 2]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={hovered ? 0.9 : 0.6}
          side={THREE.DoubleSide}
        />
        <Html
          transform
          occlude
          position={[0, 0, 0.01]}
          style={{
            width: '280px',
            height: '180px',
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            padding: '8px',
            borderRadius: '4px',
            border: `1px solid ${color}`,
            height: '100%',
            boxSizing: 'border-box',
            boxShadow: `0 0 20px ${color}40`,
          }}>
            <pre style={{
              color: color,
              fontSize: '6px',
              fontFamily: 'JetBrains Mono, monospace',
              margin: 0,
              overflow: 'hidden',
              lineHeight: 1.3,
            }}>
              {code.slice(0, 400)}
            </pre>
          </div>
        </Html>
      </mesh>
    </Float>
  )
}

// Central core processor
function CoreProcessor({ isProcessing }: { isProcessing: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const ringRef1 = useRef<THREE.Mesh>(null!)
  const ringRef2 = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    const speed = isProcessing ? 3 : 1
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01 * speed
      meshRef.current.rotation.x += 0.005 * speed
    }
    if (ringRef1.current) {
      ringRef1.current.rotation.z += 0.02 * speed
      ringRef1.current.rotation.x += 0.01 * speed
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.z -= 0.015 * speed
      ringRef2.current.rotation.y += 0.01 * speed
    }
  })

  return (
    <group>
      {/* Main core */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 1]} />
        <MeshDistortMaterial
          color={isProcessing ? "#00ff88" : "#00ffff"}
          emissive={isProcessing ? "#00ff44" : "#00aaff"}
          emissiveIntensity={isProcessing ? 2 : 0.8}
          distort={isProcessing ? 0.6 : 0.3}
          speed={isProcessing ? 5 : 2}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Inner glow */}
      <mesh scale={0.8}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color={isProcessing ? "#00ff88" : "#00ffff"} transparent opacity={0.3} />
      </mesh>

      {/* Orbiting rings */}
      <mesh ref={ringRef1}>
        <torusGeometry args={[1.8, 0.03, 16, 100]} />
        <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={1} />
      </mesh>
      <mesh ref={ringRef2}>
        <torusGeometry args={[2.2, 0.02, 16, 100]} />
        <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}

// Particle system for energy effect
function EnergyParticles({ count = 500 }) {
  const points = useRef<THREE.Points>(null!)

  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 5 + Math.random() * 10
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)
    }
    return positions
  }, [count])

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.05
      points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1
    }
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#00ffff" transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}

// 3D Scene
function Scene({ isProcessing, outputType }: { isProcessing: boolean; outputType: 'html' | 'json' }) {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />
      <spotLight position={[0, 10, 0]} intensity={1} color="#ffffff" angle={0.3} penumbra={1} />

      <CoreProcessor isProcessing={isProcessing} />

      {/* Floating code blocks */}
      <CodeBlock
        position={[-4, 1, -2]}
        rotation={[0, 0.5, 0]}
        code={sampleOutputs.html}
        color="#00ff88"
        delay={0}
      />
      <CodeBlock
        position={[4, 0, -1]}
        rotation={[0, -0.3, 0]}
        code={sampleOutputs.json}
        color="#ff00ff"
        delay={2}
      />
      <CodeBlock
        position={[-3, -1.5, 2]}
        rotation={[0, 0.8, 0]}
        code={outputType === 'html' ? sampleOutputs.html : sampleOutputs.json}
        color="#ffff00"
        delay={4}
      />
      <CodeBlock
        position={[3, 2, 1]}
        rotation={[0, -0.6, 0]}
        code="<div class='game'>\n  <canvas id='canvas'>\n  </canvas>\n  <script>\n    // Your game\n  </script>\n</div>"
        color="#00ffff"
        delay={6}
      />

      {/* Title text */}
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
        <Text
          position={[0, 4, 0]}
          fontSize={0.6}
          color="#00ffff"
          font="/fonts/JetBrainsMono-Bold.woff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          CODE FORGE
        </Text>
      </Float>

      <EnergyParticles count={800} />
      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={20}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  )
}

// Main App
export default function App() {
  const [inputText, setInputText] = useState('')
  const [outputType, setOutputType] = useState<'html' | 'json'>('html')
  const [isProcessing, setIsProcessing] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')

  const handleGenerate = () => {
    if (!inputText.trim()) return

    setIsProcessing(true)
    setGeneratedCode('')

    // Simulate processing with typing effect
    setTimeout(() => {
      const output = outputType === 'html' ? sampleOutputs.html : sampleOutputs.json
      let i = 0
      const typeInterval = setInterval(() => {
        if (i < output.length) {
          setGeneratedCode(output.slice(0, i + 1))
          i++
        } else {
          clearInterval(typeInterval)
          setIsProcessing(false)
        }
      }, 10)
    }, 1000)
  }

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 2, 10], fov: 60 }}>
        <Suspense fallback={null}>
          <Scene isProcessing={isProcessing} outputType={outputType} />
        </Suspense>
      </Canvas>

      {/* Scan lines overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 2px)',
          mixBlendMode: 'overlay',
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.8) 100%)',
        }}
      />

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-widest"
              style={{
                color: '#00ffff',
                textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 40px #00ffff',
              }}>
              CODE FORGE
            </h1>
            <p className="text-xs md:text-sm mt-1" style={{ color: '#ff00ff' }}>
              English to Code in 10 Minutes
            </p>
          </div>

          {/* Output type toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setOutputType('html')}
              className="px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm font-bold tracking-wider transition-all duration-300"
              style={{
                background: outputType === 'html' ? 'rgba(0,255,136,0.2)' : 'transparent',
                border: `2px solid ${outputType === 'html' ? '#00ff88' : '#333'}`,
                color: outputType === 'html' ? '#00ff88' : '#666',
                boxShadow: outputType === 'html' ? '0 0 20px rgba(0,255,136,0.5)' : 'none',
              }}
            >
              HTML/GAME
            </button>
            <button
              onClick={() => setOutputType('json')}
              className="px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm font-bold tracking-wider transition-all duration-300"
              style={{
                background: outputType === 'json' ? 'rgba(255,0,255,0.2)' : 'transparent',
                border: `2px solid ${outputType === 'json' ? '#ff00ff' : '#333'}`,
                color: outputType === 'json' ? '#ff00ff' : '#666',
                boxShadow: outputType === 'json' ? '0 0 20px rgba(255,0,255,0.5)' : 'none',
              }}
            >
              JSON
            </button>
          </div>
        </div>
      </header>

      {/* Input Panel */}
      <div className="absolute bottom-20 md:bottom-16 left-4 right-4 md:left-8 md:right-8 z-20">
        <div
          className="p-3 md:p-4 rounded-lg"
          style={{
            background: 'rgba(0,0,0,0.85)',
            border: '1px solid #00ffff',
            boxShadow: '0 0 30px rgba(0,255,255,0.3), inset 0 0 30px rgba(0,255,255,0.05)',
          }}
        >
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs mb-2 tracking-wider" style={{ color: '#00ffff' }}>
                &gt; DESCRIBE YOUR GAME OR DATA STRUCTURE_
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Example: Create a space shooter game with a player ship that can move left/right and shoot lasers at enemy aliens..."
                className="w-full h-20 md:h-24 p-3 text-sm md:text-base resize-none rounded outline-none transition-all duration-300 focus:ring-2"
                style={{
                  background: 'rgba(0,20,20,0.9)',
                  border: '1px solid #333',
                  color: '#00ff88',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              />
            </div>
            <div className="flex flex-row md:flex-col gap-2 md:justify-end">
              <button
                onClick={handleGenerate}
                disabled={isProcessing || !inputText.trim()}
                className="flex-1 md:flex-none px-6 py-3 md:py-4 text-sm md:text-base font-bold tracking-wider transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: isProcessing ? 'rgba(255,255,0,0.3)' : 'linear-gradient(135deg, #00ff88 0%, #00ffff 100%)',
                  border: 'none',
                  color: isProcessing ? '#ffff00' : '#000',
                  boxShadow: isProcessing ? '0 0 30px rgba(255,255,0,0.5)' : '0 0 30px rgba(0,255,136,0.5)',
                  clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
                }}
              >
                {isProcessing ? 'FORGING...' : 'FORGE CODE'}
              </button>
            </div>
          </div>

          {/* Generated code output */}
          {generatedCode && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs tracking-wider" style={{ color: outputType === 'html' ? '#00ff88' : '#ff00ff' }}>
                  &gt; OUTPUT_{outputType.toUpperCase()}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(generatedCode)}
                  className="px-3 py-1 text-xs tracking-wider transition-all duration-300 hover:opacity-80"
                  style={{
                    background: 'transparent',
                    border: '1px solid #666',
                    color: '#666',
                  }}
                >
                  COPY
                </button>
              </div>
              <pre
                className="p-3 text-xs md:text-sm max-h-32 md:max-h-40 overflow-auto rounded"
                style={{
                  background: 'rgba(0,10,10,0.9)',
                  border: `1px solid ${outputType === 'html' ? '#00ff88' : '#ff00ff'}40`,
                  color: outputType === 'html' ? '#00ff88' : '#ff00ff',
                }}
              >
                {generatedCode}
                {isProcessing && <span className="animate-pulse">_</span>}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Timer badge */}
      <div
        className="absolute top-4 right-4 md:top-6 md:right-6 z-20 px-3 py-2 rounded"
        style={{
          background: 'rgba(255,255,0,0.1)',
          border: '1px solid #ffff00',
          boxShadow: '0 0 15px rgba(255,255,0,0.3)',
        }}
      >
        <span className="text-xs md:text-sm font-bold tracking-wider" style={{ color: '#ffff00' }}>
          10 MIN BUILD
        </span>
      </div>

      {/* Status indicator */}
      <div className="absolute top-20 md:top-6 left-4 md:left-auto md:right-40 z-20 flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{
            background: isProcessing ? '#ffff00' : '#00ff88',
            boxShadow: `0 0 10px ${isProcessing ? '#ffff00' : '#00ff88'}`,
          }}
        />
        <span className="text-xs tracking-wider" style={{ color: isProcessing ? '#ffff00' : '#00ff88' }}>
          {isProcessing ? 'PROCESSING' : 'READY'}
        </span>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-3 md:bottom-4 left-0 right-0 z-20 text-center">
        <p className="text-xs" style={{ color: 'rgba(100,100,100,0.8)' }}>
          Requested by @web-user · Built by @clonkbot
        </p>
      </footer>
    </div>
  )
}
