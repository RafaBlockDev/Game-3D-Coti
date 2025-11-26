import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { Vector3, DoubleSide } from 'three';
import { ThreeEvent } from '@react-three/fiber';

export const Terrain: React.FC = () => {
  const setTarget = useGameStore((state) => state.setTarget);
  const isModalOpen = useGameStore((state) => state.isModalOpen);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    // Don't allow movement when modal is open
    if (isModalOpen) return;

    // Only move if we clicked the floor, not an object on top
    e.stopPropagation();

    // Calculate point just slightly above 0 y-axis to avoid clipping errors logic
    const point = e.point;
    const targetVector = new Vector3(point.x, 0, point.z);

    setTarget(targetVector);

    // Visual feedback (optional click marker logic could go here)
  };

  return (
    <group>
      {/* Main Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} onPointerDown={handlePointerDown} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#4ade80" side={DoubleSide} />
      </mesh>

      {/* Grid helper for visual reference of scale */}
      <gridHelper args={[100, 100, 0x1f2937, 0x065f46]} position={[0, 0.01, 0]} />
    </group>
  );
};