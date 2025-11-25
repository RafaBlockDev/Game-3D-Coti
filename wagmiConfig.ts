import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';

// Define COTI Mainnet compatible with Viem/Wagmi
const cotiMainnet = {
  id: 2632500,
  name: 'COTI',
  nativeCurrency: { name: 'COTI', symbol: 'COTI', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://mainnet.coti.io/rpc'] },
  },
  blockExplorers: {
    default: { name: 'CotiScan', url: 'https://mainnet.cotiscan.io' },
  },
} as const;

export const config = getDefaultConfig({
  appName: 'COTI Realms Prototype',
  projectId: 'YOUR_PROJECT_ID', // Placeholder project ID, publicly available ones work for testing sometimes, or it falls back to public providers
  chains: [cotiMainnet],
  transports: {
    [cotiMainnet.id]: http('https://mainnet.coti.io/rpc'),
  },
});