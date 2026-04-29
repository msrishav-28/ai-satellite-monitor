"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, PerspectiveCamera, Stars, Sparkles, Environment } from "@react-three/drei";
import * as THREE from "three";

function Scene() {
  const { mouse, camera } = useThree();
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    // Smooth camera parallax
    camera.position.x += (mouse.x * 2 - camera.position.x) * 0.05;
    camera.position.y += (mouse.y * 2 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={groupRef}>
      <FloatingObject position={[5, 2, -2]} color="#FF0000" speed={2} size={1.2} distort={0.5} />
      <FloatingObject position={[-6, -3, -4]} color="#ffffff" speed={1} size={0.8} distort={0.3} />
      <FloatingObject position={[3, -5, 1]} color="#ffffff" speed={1.5} size={0.4} distort={0.6} />

      <Artifact position={[-4, 4, -2]} rotation={[0.5, 0.5, 0.5]} />
      <Artifact position={[6, -2, -5]} rotation={[0.2, 0.8, 0.1]} />
      <Artifact position={[0, 6, -8]} rotation={[0.1, 0.1, 0.1]} />
    </group>
  );
}

function FloatingObject({ position, color, speed, size, distort = 0.4 }: { position: [number, number, number], color: string, speed: number, size: number, distort?: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = Math.sin(time / 4) * 0.2;
    meshRef.current.rotation.y = Math.cos(time / 4) * 0.2;
  });

  return (
    <Float speed={speed} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[size, 64, 64]} />
        <MeshDistortMaterial
          color={color}
          speed={speed}
          distort={distort}
          radius={1}
          metalness={1}
          roughness={0}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>
    </Float>
  );
}

function Artifact({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += 0.005;
    meshRef.current.rotation.z += 0.002;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={position} rotation={rotation}>
        <octahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial
          color="#ffffff"
          metalness={1}
          roughness={0}
          wireframe
          opacity={0.2}
          transparent
        />
      </mesh>
    </Float>
  );
}

export function Space3D() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none opacity-50"
      role="img"
      aria-label="3D space visualization with floating celestial objects"
    >
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={50} />
        <ambientLight intensity={0.5} />
        <spotLight position={[15, 20, 5]} angle={0.3} penumbra={1} intensity={2} color="#ffffff" castShadow />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#ff0000" />

        <Stars radius={100} depth={50} count={7000} factor={4} saturation={0} fade speed={0.5} />
        <Sparkles count={150} scale={20} size={1} speed={0.3} color="#ffffff" />

        <Scene />

        <Environment preset="night" />
      </Canvas>
    </div>
  );
}

