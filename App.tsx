import React, { Suspense, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stats, SoftShadows } from '@react-three/drei';
import { useGameStore } from './store/gameStore';

// Providers
import { WagmiProvider, useAccount } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { config } from './wagmiConfig';

// Components
import { Terrain } from './components/World/Terrain';
import { Player } from './components/Player/Player';
import { Interface } from './components/UI/Interface';
import { Decor } from './components/World/Decor';
import { Chest } from './components/Interactables/Chest';
import { WalletConnect } from './components/UI/WalletConnect';
import { Onboarding } from './components/UI/Onboarding';

const queryClient = new QueryClient();

function SceneContent() {
  // Generate random chest positions
  const chests = useMemo(() => {
    return Array.from({ length: 5 }).map((_, i) => ({
      id: `chest-${i}`,
      position: [
        (Math.random() - 0.5) * 40,
        0,
        (Math.random() - 0.5) * 40
      ] as [number, number, number]
    }));
  }, []);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[20, 30, 10]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize={[1024, 1024]}
      >
        <orthographicCamera attach="shadow-camera" args={[-50, 50, 50, -50]} />
      </directionalLight>

      {/* Game Entities */}
      <Player />
      <Terrain />
      <Decor count={40} mapSize={80} />
      
      {chests.map(chest => (
        <Chest key={chest.id} id={chest.id} position={chest.position} />
      ))}
      
      {/* Effects */}
      <SoftShadows />
    </>
  );
}

function GameRoot() {
  const isConnected = useGameStore((state) => state.isConnected);
  const isOnboarded = useGameStore((state) => state.isOnboarded);
  const setConnected = useGameStore((state) => state.setConnected);

  // Wagmi hooks
  const { address, isConnected: wagmiIsConnected } = useAccount();

  // Sync Wagmi state with Game Store
  useEffect(() => {
    if (wagmiIsConnected && address) {
      // Only set connected if we aren't already (prevents loop)
      setConnected(address);
    }
  }, [wagmiIsConnected, address, setConnected]);

  return (
    <div className="relative w-full h-screen bg-slate-900 no-select">
      {!isConnected ? (
        <WalletConnect />
      ) : !isOnboarded ? (
        <Onboarding />
      ) : (
        <>
          <Canvas shadows camera={{ position: [10, 10, 10], fov: 40 }}>
            <Suspense fallback={null}>
              <SceneContent />
            </Suspense>
            {/* Helper for dev performance monitoring */}
            <Stats className="!left-auto !right-0" />
          </Canvas>
          <Interface />
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()} modalSize="compact">
          <GameRoot />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;