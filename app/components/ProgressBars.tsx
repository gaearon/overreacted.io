'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useMemo, useEffect } from 'react'
import { Text, OrbitControls } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import { 
  BufferGeometry, 
  Float32BufferAttribute,
  LineBasicMaterial,
  MeshBasicMaterial,
  Vector3,
  Shape,
  ShapeGeometry,
  DoubleSide,
  Line,
  Mesh,
  PerspectiveCamera,
  Group
} from 'three'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

interface EmotionSection {
  value: number
  label: string
  percentage: number
  color: string
}

const AnimatedSection = ({ emotion, startAngle, endAngle, radius, innerRadius, index }) => {
  const fillRef = useRef<Mesh>(null)
  const textRef = useRef<Mesh>(null)
  const segments = 32
  const segmentAngle = (endAngle - startAngle) / segments
  const midAngle = startAngle + (endAngle - startAngle) / 2
  
  useSpring({
    from: { progress: 0 },
    to: { progress: 1 },
    delay: index * 100,
    config: { duration: 800 },
    onChange: ({ value: { progress } }) => {
      if (fillRef.current) {
        const fillRadius = innerRadius + (radius - innerRadius) * (emotion.percentage / 100) * progress
        const fillShape = new Shape()
        
        fillShape.moveTo(
          Math.cos(startAngle) * innerRadius,
          Math.sin(startAngle) * innerRadius
        )

        // Draw inner arc
        for (let i = 0; i <= segments; i++) {
          const angle = startAngle + i * segmentAngle
          fillShape.lineTo(
            Math.cos(angle) * innerRadius,
            Math.sin(angle) * innerRadius
          )
        }

        // Draw outer arc at current progress radius
        for (let i = segments; i >= 0; i--) {
          const angle = startAngle + i * segmentAngle
          fillShape.lineTo(
            Math.cos(angle) * fillRadius,
            Math.sin(angle) * fillRadius
          )
        }

        fillRef.current.geometry = new ShapeGeometry(fillShape)
      }

      if (textRef.current) {
        const textRadius = radius * 0.85
        
        // Position text at final position
        textRef.current.position.set(
          Math.cos(midAngle) * textRadius,
          Math.sin(midAngle) * textRadius,
          0
        )
        
        // Update material opacity for fade in
        if (textRef.current.material) {
          (textRef.current.material as MeshBasicMaterial).opacity = progress
        }
        
        // Keep text horizontal (no rotation)
        textRef.current.rotation.z = 0
      }
    }
  })

  const outlineVertices = useMemo(() => {
    const vertices = []
    // Outer arc
    for (let i = 0; i <= segments; i++) {
      const angle = startAngle + i * segmentAngle
      vertices.push(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0
      )
    }
    // Inner arc (reverse)
    for (let i = segments; i >= 0; i--) {
      const angle = startAngle + i * segmentAngle
      vertices.push(
        Math.cos(angle) * innerRadius,
        Math.sin(angle) * innerRadius,
        0
      )
    }
    return vertices
  }, [startAngle, endAngle, radius, innerRadius])

  const outlineGeometry = useMemo(() => {
    const geometry = new BufferGeometry()
    geometry.setAttribute(
      'position',
      new Float32BufferAttribute(outlineVertices, 3)
    )
    return geometry
  }, [outlineVertices])

  const initialFillShape = useMemo(() => {
    const shape = new Shape()
    shape.moveTo(
      Math.cos(startAngle) * innerRadius,
      Math.sin(startAngle) * innerRadius
    )

    // Draw inner arc
    for (let i = 0; i <= segments; i++) {
      const angle = startAngle + i * segmentAngle
      shape.lineTo(
        Math.cos(angle) * innerRadius,
        Math.sin(angle) * innerRadius
      )
    }

    // Draw outer arc at initial radius
    for (let i = segments; i >= 0; i--) {
      const angle = startAngle + i * segmentAngle
      shape.lineTo(
        Math.cos(angle) * innerRadius,
        Math.sin(angle) * innerRadius
      )
    }

    return new ShapeGeometry(shape)
  }, [startAngle, endAngle, innerRadius])

  const outlineMaterial = useMemo(() => new LineBasicMaterial({
    color: emotion.color,
    transparent: true,
    opacity: 0.6,
    toneMapped: false
  }), [emotion.color])

  const fillMaterial = useMemo(() => new MeshBasicMaterial({
    color: emotion.color,
    side: DoubleSide,
    transparent: true,
    opacity: 0.3,
    toneMapped: false
  }), [emotion.color])

  const labelPosition = useMemo(() => new Vector3(
    Math.cos(midAngle) * (radius * 0.85),
    Math.sin(midAngle) * (radius * 0.85),
    0
  ), [midAngle, radius])

  return (
    <group>
      <primitive object={new Line(outlineGeometry, outlineMaterial)} />
      <mesh ref={fillRef} geometry={initialFillShape} material={fillMaterial} />
      <Text
        ref={textRef}
        position={[0, 0, 0]}
        fontSize={0.3}
        color={emotion.color}
        anchorX="center"
        anchorY="middle"
        maxWidth={2}
        material-transparent={true}
        material-opacity={0}
      >
        {`${emotion.label}\n${emotion.percentage}%`}
      </Text>
    </group>
  )
}

const CameraAnimation = () => {
  const controlsRef = useRef(null)
  const timeRef = useRef<number>(0)
  const animatingRef = useRef<boolean>(false)
  const returningRef = useRef<boolean>(false)
  const lastPositionRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 6 })
  
  useEffect(() => {
    // Start animation after 4 seconds
    const timer = setTimeout(() => {
      animatingRef.current = true
      timeRef.current = 0
    }, 4000)
    
    return () => clearTimeout(timer)
  }, [])
  
  useFrame((state, delta) => {
    if (animatingRef.current && controlsRef.current) {
      timeRef.current += delta
      const t = timeRef.current
      
      // Start return transition at 20 seconds
      if (t > 20 && !returningRef.current) {
        returningRef.current = true
        timeRef.current = 0
        lastPositionRef.current = {
          x: state.camera.position.x,
          y: state.camera.position.y,
          z: state.camera.position.z
        }
        return
      }

      // Handle return transition
      if (returningRef.current) {
        const returnDuration = 2.5 // Increased duration for smoother return
        const progress = Math.min(timeRef.current / returnDuration, 1)
        // Smoother easing function
        const eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2
        
        // Interpolate back to center with easing
        state.camera.position.set(
          lastPositionRef.current.x * (1 - eased),
          lastPositionRef.current.y * (1 - eased),
          7 + (lastPositionRef.current.z - 7) * (1 - eased)
        )

        // End animation when return is complete
        if (progress === 1) {
          animatingRef.current = false
          returningRef.current = false
          timeRef.current = 0
        }
        return
      }

      // Regular animation movement with smoother transitions
      const angle = t * Math.PI / 3 // Faster frequency for more movement
      const radius = 0.7 // Larger radius for more noticeable movement
      
      // Calculate new camera position with smoother variations
      const x = Math.sin(angle * 0.6) * radius
      const y = Math.cos(angle * 0.8) * radius * 0.5
      const z = 7 + Math.sin(angle * 0.4) * 0.4 // Increased zoom range
      
      // Apply smooth easing to the movement
      state.camera.position.x += (x - state.camera.position.x) * 0.03
      state.camera.position.y += (y - state.camera.position.y) * 0.03
      state.camera.position.z += (z - state.camera.position.z) * 0.03
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={false}
      enablePan={false}
      minPolarAngle={Math.PI / 2 - 0.1}
      maxPolarAngle={Math.PI / 2 + 0.1}
      minAzimuthAngle={-0.1}
      maxAzimuthAngle={0.1}
      rotateSpeed={0.5}
    />
  )
}

const EmotionWheel = () => {
  const emotions: EmotionSection[] = [
    { value: 13, label: "Brainloop v01", percentage: 80, color: '#fff157' }, // Brighter Citizen Sleeper Yellow
    { value: 10, label: "Arxivist v01", percentage: 40, color: '#00ffff' }, // Bright Cyan
    { value: 3, label: "BOXS ATypo", percentage: 30, color: '#ff71a4' }, // Brighter Hot Pink
    { value: 10, label: "BOXS v01", percentage: 70, color: '#45ffb3' }, // Brighter Neon Green
  ]

  const totalValue = emotions.reduce((sum, emotion) => sum + emotion.value, 0)
  const radius = 4.2
  const innerRadius = 1.4

  return (
    <group>
      {emotions.map((emotion, index) => {
        const startAngle = emotions
          .slice(0, index)
          .reduce((sum, e) => sum + (e.value / totalValue) * Math.PI * 2, 0)
        const endAngle = startAngle + (emotion.value / totalValue) * Math.PI * 2

        return (
          <AnimatedSection
            key={emotion.label}
            emotion={emotion}
            startAngle={startAngle}
            endAngle={endAngle}
            radius={radius}
            innerRadius={innerRadius}
            index={index}
          />
        )
      })}
    </group>
  )
}

export default function EmotionDisplay() {
  return (
    <div className="w-[330px] h-[330px] bg-[#151619] rounded-lg overflow-hidden">
      <Canvas camera={{ position: [0, 0, 7] }}>
        <color attach="background" args={['#151619']} />
        <CameraAnimation />
        <EmotionWheel />
        <EffectComposer>
          <Bloom
            intensity={0.8}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            mipmapBlur={true}
            radius={0.8}
          />
        </EffectComposer>
      </Canvas>
    </div>
  )
}