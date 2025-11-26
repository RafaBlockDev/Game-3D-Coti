import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGameStore } from '../../store/gameStore';
import * as THREE from 'three';

export const Player: React.FC = () => {
  const meshRef = useRef<THREE.Group>(null);

  const target = useGameStore((state) => state.target);
  const isMoving = useGameStore((state) => state.isMoving);
  const stopMoving = useGameStore((state) => state.stopMoving);
  const updatePosition = useGameStore((state) => state.updatePosition);
  const isModalOpen = useGameStore((state) => state.isModalOpen);

  const { camera } = useThree();

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Movement Logic - Disabled when modal is open
    if (isMoving && !isModalOpen) {
      const currentPos = meshRef.current.position;
      const distance = currentPos.distanceTo(target);

      if (distance > 0.1) {
        // Calculate direction
        const direction = new THREE.Vector3().subVectors(target, currentPos).normalize();
        
        // Move towards target
        const speed = 6; // Units per second
        const moveStep = direction.multiplyScalar(speed * delta);
        
        meshRef.current.position.add(moveStep);
        
        // Face target
        meshRef.current.lookAt(target.x, currentPos.y, target.z);
        
        // Sync with store for other components to know where player is
        updatePosition(meshRef.current.position.clone());
      } else {
        stopMoving();
      }
    }

    // Camera Follow Logic (Isometric Style)
    // We maintain a fixed offset from the player
    const offset = new THREE.Vector3(10, 10, 10); 
    const cameraTargetPos = meshRef.current.position.clone().add(offset);
    
    // Smooth camera lerp
    camera.position.lerp(cameraTargetPos, delta * 4);
    camera.lookAt(meshRef.current.position);
  });

  return (
    <group ref={meshRef} position={[0, 0, 0]}>
      {/* Player Model - Simple Capsule */}
      <mesh position={[0, 1, 0]} castShadow>
        <capsuleGeometry args={[0.3, 1, 4, 8]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      
      {/* Player Shadow/Indicator */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <ringGeometry args={[0.4, 0.5, 32]} />
        <meshBasicMaterial color="#60a5fa" opacity={0.5} transparent />
      </mesh>
    </group>
  );
};