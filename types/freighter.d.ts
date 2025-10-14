// Freighter Wallet API type definitions
export interface FreighterAPI {
  isConnected: () => Promise<{ isConnected: boolean }>;
  isAllowed: () => Promise<{ isAllowed: boolean }>;
  setAllowed: () => Promise<{ isAllowed: boolean }>;
  requestAccess: () => Promise<{ address?: string; error?: string }>;
  getAddress: () => Promise<{ address?: string; error?: string }>;
  getNetwork: () => Promise<{ network: string; networkPassphrase: string }>;
  getNetworkDetails: () => Promise<{
    networkUrl: string;
    sorobanRpcUrl: string;
    network: string;
    networkPassphrase: string;
  }>;
  signTransaction: (
    xdr: string,
    opts?: {
      network?: string;
      networkPassphrase?: string;
      address?: string;
    }
  ) => Promise<{ signedTxXdr: string }>;
  signAuthEntry: (
    authEntry: string,
    opts?: { address?: string }
  ) => Promise<{ signedAuthEntry: string }>;
  signMessage: (
    message: string,
    opts?: { address?: string }
  ) => Promise<{ signedMessage: string }>;
}

// Extend Window interface
declare global {
  interface Window {
    freighterApi?: FreighterAPI;
  }
}

export {};
