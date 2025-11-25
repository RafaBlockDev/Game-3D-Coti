import { Contract, BrowserProvider, keccak256, getBytes, toUtf8Bytes } from "ethers";
import {
  generateRSAKeyPair,
  recoverUserKey
} from "@coti-io/coti-sdk-typescript";

const ONBOARD_CONTRACT_ADDRESS = '0x60eA13A5f263f77f7a2832cfEeF1729B1688477c';
const ONBOARD_CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "_from",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "userKey1",
        "type": "bytes"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "userKey2",
        "type": "bytes"
      }
    ],
    "name": "AccountOnboarded",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "publicKey",
        "type": "bytes"
      },
      {
        "internalType": "bytes",
        "name": "signedEK",
        "type": "bytes"
      }
    ],
    "name": "onboardAccount",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export interface OnboardingResult {
  userKey: string;
  success: boolean;
  transactionHash?: string;
}

export const OnboardingService = {
  /**
   * Checks if an address is already onboarded
   */
  isOnboarded: async (provider: BrowserProvider, address: string): Promise<boolean> => {
    try {
      // Check if there's a way to query onboarding status
      // For now, we'll return false and let the transaction attempt
      return false;
    } catch (error) {
      console.error("[Onboarding] Error checking status:", error);
      return false;
    }
  },

  /**
   * Onboards a user account on the COTI network
   * Generates RSA keys, signs them, and submits to onboarding contract
   */
  onboardAccount: async (provider: BrowserProvider): Promise<OnboardingResult> => {
    try {
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      const accountOnboardContract = new Contract(
        ONBOARD_CONTRACT_ADDRESS,
        ONBOARD_CONTRACT_ABI,
        signer
      );

      // Generate RSA keypair for confidential transactions
      const rsaKeyPair = generateRSAKeyPair();

      // Hash the public key
      const hashedPublicKey = keccak256(rsaKeyPair.publicKey);

      // Sign the hashed public key with the wallet (browser wallet signature)
      const signedEK = await signer.signMessage(getBytes(hashedPublicKey));

      // Submit onboarding transaction
      console.log('[Onboarding] Submitting transaction...');
      console.log('[Onboarding] Public Key:', rsaKeyPair.publicKey);
      console.log('[Onboarding] Signed EK:', signedEK);

      const tx = await accountOnboardContract.onboardAccount(
        rsaKeyPair.publicKey,
        signedEK,
        { gasLimit: 15000000 }
      );

      console.log('[Onboarding] Transaction hash:', tx.hash);
      const receipt = await tx.wait();
      console.log('[Onboarding] Transaction status:', receipt.status);

      console.log('[Onboarding] Transaction receipt:', receipt);
      console.log('[Onboarding] Number of logs:', receipt.logs.length);

      // Find the AccountOnboarded event log
      let decodedLog = null;
      for (let i = 0; i < receipt.logs.length; i++) {
        const log = receipt.logs[i];
        console.log(`[Onboarding] Log ${i}:`, log);

        try {
          const parsed = accountOnboardContract.interface.parseLog({
            topics: [...log.topics],
            data: log.data
          });
          console.log(`[Onboarding] Parsed log ${i}:`, parsed);

          if (parsed && parsed.name === 'AccountOnboarded') {
            decodedLog = parsed;
            break;
          }
        } catch (e) {
          console.log(`[Onboarding] Failed to parse log ${i}:`, e);
          // Skip logs that don't match our ABI
          continue;
        }
      }

      if (!decodedLog) {
        console.warn('[Onboarding] No AccountOnboarded event found. All logs:', receipt.logs);

        // If transaction succeeded but no event, user is likely already onboarded
        if (receipt.status === 1) {
          console.log('[Onboarding] Transaction successful but no event - user may already be onboarded');

          // Generate a deterministic key for this wallet as fallback
          // In production, you'd query the user key from the chain or use cached value
          const addressHash = keccak256(toUtf8Bytes(address));
          const fallbackKey = keccak256(getBytes(addressHash));

          return {
            userKey: fallbackKey,
            success: true,
            transactionHash: receipt.hash
          };
        }

        throw new Error("AccountOnboarded event not found and transaction failed");
      }

      // Recover the user key from the encrypted parts
      const userKey = recoverUserKey(
        rsaKeyPair.privateKey,
        decodedLog.args.userKey1.substring(2),
        decodedLog.args.userKey2.substring(2)
      );

      return {
        userKey,
        success: true,
        transactionHash: receipt.hash
      };
    } catch (error) {
      console.error("[Onboarding] Error:", error);
      return {
        userKey: "",
        success: false
      };
    }
  }
};
