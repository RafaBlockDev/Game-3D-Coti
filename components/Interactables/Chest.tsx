import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/gameStore';
import { CotiService } from '../../services/future-blockchain-hooks/cotiService';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface ChestProps {
  id: string;
  position: [number, number, number];
}

export const Chest: React.FC<ChestProps> = ({ id, position }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const groupRef = useRef<THREE.Group>(null);
  const lidRef = useRef<THREE.Mesh>(null);
  
  const playerPosition = useGameStore((state) => state.position);
  const addLog = useGameStore((state) => state.addLog);
  const incrementBalance = useGameStore((state) => state.incrementBalance);

  useFrame((state, delta) => {
    // Floating animation when hovered/idle
    if (groupRef.current && !isOpen) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.25;
    }

    // Opening animation
    if (lidRef.current) {
        const targetRotation = isOpen ? -Math.PI / 1.5 : 0;
        lidRef.current.rotation.x = THREE.MathUtils.lerp(lidRef.current.rotation.x, targetRotation, delta * 5);
    }
  });

  const handleInteraction = async (e: any) => {
    e.stopPropagation();
    if (isOpen || loading) return;

    // Proximity check (must be within 5 units)
    const chestPos = new THREE.Vector3(...position);
    if (chestPos.distanceTo(playerPosition) > 5) {
      addLog("Too far away to open!");
      return;
    }

    setLoading(true);
    setIsOpen(true);
    addLog("Opening chest... (Simulating Blockchain TX)");

    // Simulate Blockchain Latency
    try {
      const reward = await CotiService.requestTokenRewardPlaceholder(id);
      incrementBalance(reward);
      addLog(`Received ${reward} Mock Tokens!`);
      addLog("// TODO: In future, this verifies via COTI Smart Contract");
    } catch (error) {
      addLog("Failed to loot chest.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <group 
        ref={groupRef} 
        position={position} 
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
        onClick={handleInteraction}
    >
      {/* Base */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.8, 0.5, 0.5]} />
        <meshStandardMaterial color={isHovered ? "#fbbf24" : "#b45309"} />
      </mesh>

      {/* Lid */}
      <mesh ref={lidRef} position={[0, 0.5, -0.25]}>
         {/* Offset pivot for lid */}
         <group position={[0, 0, 0.25]}> 
            <mesh position={[0, 0.1, 0]} rotation={[0, 0, Math.PI/2]}>
                <cylinderGeometry args={[0.4, 0.4, 0.8, 4, 1, false, Math.PI * 0.25, Math.PI * 1.5]} />
                <meshStandardMaterial color={isHovered ? "#fcd34d" : "#d97706"} />
            </mesh>
         </group>
      </mesh>
      
      {/* Label on hover */}
      {isHovered && !isOpen && (
        <Html position={[0, 1.5, 0]} center>
           <div className="bg-black/70 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
             Click to Open
           </div>
        </Html>
      )}
    </group>
  );
};