/**
 * COTI BLOCKCHAIN INTEGRATION SERVICE
 * 
 * Handles interaction with placeholder data and Guest Mode.
 * Wallet connection logic is now handled by RainbowKit/Wagmi in App.tsx.
 */

export const CotiService = {
  /**
   * Simulates a connection for Development/Guest mode
   */
  connectGuest: async (): Promise<{ address: string; connected: boolean }> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ 
                address: "0xGuestDevWallet123456789", 
                connected: true 
            });
        }, 800);
    });
  },

  /**
   * Requests a token reward minting or transfer when a chest is opened.
   * Placeholder for future smart contract interaction.
   */
  requestTokenRewardPlaceholder: async (chestId: string): Promise<number> => {
    console.log(`[COTI Hook] Requesting reward for chest ${chestId}...`);
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock random reward
        const reward = Math.floor(Math.random() * 50) + 10; 
        resolve(reward);
      }, 800);
    });
  },

  /**
   * Fetches the current user balance from the chain.
   * Placeholder for `provider.getBalance(address)`.
   */
  getBalancePlaceholder: async (): Promise<number> => {
    console.log("[COTI Hook] Fetching on-chain balance...");
    return Promise.resolve(0);
  }
};