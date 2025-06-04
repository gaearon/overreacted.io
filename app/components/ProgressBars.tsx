'use client'

import { Canvas } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
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
  Mesh
} from 'three'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

interface EmotionSection {
  value: number
  label: string
  percentage: number
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
    delay: index * 200,
    config: { duration: 1000 },
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
        const currentRadius = radius * 0.85 * (0.3 + 0.7 * progress)
        
        // Update text position
        textRef.current.position.set(
          Math.cos(midAngle) * currentRadius,
          Math.sin(midAngle) * currentRadius,
          0
        )
        
        // Update material opacity
        if (textRef.current.material) {
          (textRef.current.material as MeshBasicMaterial).opacity = progress
        }
        
        // Calculate the shortest rotation path
        let startRotation = midAngle + Math.PI / 2
        // Normalize the angle to be between -PI and PI
        while (startRotation > Math.PI) startRotation -= 2 * Math.PI
        while (startRotation < -Math.PI) startRotation += 2 * Math.PI
        
        // Use the normalized angle for interpolation
        textRef.current.rotation.z = startRotation * (1 - progress)
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
    color: '#9FEF00',
    transparent: true,
    opacity: 0.9,
    toneMapped: false
  }), [])

  const fillMaterial = useMemo(() => new MeshBasicMaterial({
    color: '#9FEF00',
    side: DoubleSide,
    transparent: true,
    opacity: 0.3,
    toneMapped: false
  }), [])

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
        color="#efd949"
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

const EmotionWheel = () => {
  const emotions: EmotionSection[] = [
    { value: 13, label: "Learn Loop", percentage: 60 },
    { value: 10, label: "Arxivist", percentage: 40 },
    { value: 3, label: "ATypo", percentage: 30 },
    { value: 10, label: "Boxs Alpha", percentage: 10 },
  ]

  const totalValue = emotions.reduce((sum, emotion) => sum + emotion.value, 0)
  const radius = 4.5
  const innerRadius = 1.5

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
    <div className="flex flex-col gap-2">
      <h2 className="text-xl font-bold text-[#efd949]">Projects</h2>
      <div className="w-[300px] h-[300px] bg-[#1a1a1a] rounded-lg overflow-hidden">
        <Canvas camera={{ position: [0, 0, 6] }}>
          <color attach="background" args={['#1a1a1a']} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 2 - 0.1}
            maxPolarAngle={Math.PI / 2 + 0.1}
            minAzimuthAngle={-0.1}
            maxAzimuthAngle={0.1}
            rotateSpeed={0.5}
          />
          <EmotionWheel />
          <EffectComposer>
            <Bloom
              intensity={2}
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
              mipmapBlur={true}
              radius={0.8}
            />
          </EffectComposer>
        </Canvas>
      </div>
    </div>
  )
}