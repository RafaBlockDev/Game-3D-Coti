import React, { useMemo } from 'react';
import { Instance, Instances } from '@react-three/drei';
import { DecorObject, EntityType } from '../../types';

interface DecorProps {
  count: number;
  mapSize: number;
}

export const Decor: React.FC<DecorProps> = ({ count, mapSize }) => {
  // Procedurally generate decor positions once
  const items = useMemo(() => {
    const tempItems: DecorObject[] = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * mapSize;
      const z = (Math.random() - 0.5) * mapSize;
      
      // Avoid spawn area
      if (Math.abs(x) < 5 && Math.abs(z) < 5) continue;

      tempItems.push({
        id: `decor-${i}`,
        type: Math.random() > 0.3 ? EntityType.TREE : EntityType.ROCK,
        position: [x, 0, z],
        scale: 0.5 + Math.random() * 0.8,
        rotation: Math.random() * Math.PI * 2,
      });
    }
    return tempItems;
  }, [count, mapSize]);

  const trees = items.filter(i => i.type === EntityType.TREE);
  const rocks = items.filter(i => i.type === EntityType.ROCK);

  return (
    <group>
      {/* Trees System */}
      <Instances range={trees.length}>
        <cylinderGeometry args={[0.2, 0.4, 1]} />
        <meshStandardMaterial color="#78350f" />
        {trees.map((data, i) => (
          <group key={data.id} position={data.position} rotation={[0, data.rotation, 0]} scale={data.scale}>
             {/* Trunk */}
            <Instance position={[0, 0.5, 0]} /> 
            {/* Leaves (Visual Only, attached to trunk logically) */}
            <mesh position={[0, 1.5, 0]}>
                <coneGeometry args={[1, 2, 8]} />
                <meshStandardMaterial color="#166534" />
            </mesh>
          </group>
        ))}
      </Instances>

      {/* Rocks System */}
      <Instances range={rocks.length}>
        <dodecahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color="#64748b" flatShading />
        {rocks.map((data, i) => (
          <Instance 
            key={data.id} 
            position={[data.position[0], 0.3, data.position[2]]} 
            scale={data.scale} 
            rotation={[data.rotation, data.rotation, data.rotation]} 
          />
        ))}
      </Instances>
    </group>
  );
};