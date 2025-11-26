import { Contract, BrowserProvider } from '@coti-io/coti-ethers';
import ERC20_ABI_JSON from '../erc20ABI.json';

/**
 * COTI Network Configuration
 */
export const COTI_CONFIG = {
  NETWORK: {
    chainId: 2632500,
    name: 'COTI Mainnet',
    rpcUrl: 'https://mainnet.coti.io/rpc',
  },
  CONTRACTS: {
    ONBOARDING: '0x60eA13A5f263f77f7a2832cfEeF1729B1688477c',
    GAME_TOKEN: '0xaEe8b3F761b2128066dC844dB9571f3A02F29363',
  },
  GAS_LIMIT: 12000000,
} as const;

/**
 * Private ERC-20 Token ABI from COTI
 */
export const TOKEN_ABI = ERC20_ABI_JSON.abi;

/**
 * Creates a COTI Game Token contract instance
 * @param provider - COTI BrowserProvider instance
 * @param userKey - User's AES key from onboarding
 * @returns Contract instance for the game token
 */
export async function getGameTokenContract(provider: BrowserProvider, userKey: string): Promise<Contract> {
  const signer = await provider.getSigner();
  signer.setAesKey(userKey);
  return new Contract(COTI_CONFIG.CONTRACTS.GAME_TOKEN, TOKEN_ABI, signer);
}

/**
 * Gets a read-only contract instance (no signer required)
 * @param provider - COTI BrowserProvider instance
 * @returns Read-only contract instance
 */
export async function getGameTokenContractReadOnly(provider: BrowserProvider): Promise<Contract> {
  return new Contract(COTI_CONFIG.CONTRACTS.GAME_TOKEN, TOKEN_ABI, provider);
}
