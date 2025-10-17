import * as StellarSdk from '@stellar/stellar-sdk';
import { ContractResponse, PlayerScore } from '@/types/contract';

// Configuration
const NETWORK = 'TESTNET';
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
const SOROBAN_RPC_URL = 'https://soroban-testnet.stellar.org';

// Contract ID - Replace this after deployment
export const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID || 'YOUR_CONTRACT_ID_HERE';

// Initialize Soroban Server
const sorobanServer = new StellarSdk.SorobanRpc.Server(SOROBAN_RPC_URL);

/**
 * Submit a score to the smart contract with username and game type
 */
export async function submitScore(
  playerAddress: string,
  username: string,
  score: number,
  gameType: 'snake' | 'pong'
): Promise<ContractResponse> {
  try {
    // Load account from Soroban RPC
    const sourceAccount = await sorobanServer.getAccount(playerAddress);
    
    // Build the contract call
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    
    // Convert game type to Symbol
    const gameSymbol = StellarSdk.nativeToScVal(gameType, { type: 'symbol' });
    
    // Build transaction with contract call (now with username and game type)
    const builtTransaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          'submit_score',
          StellarSdk.Address.fromString(playerAddress).toScVal(),
          StellarSdk.nativeToScVal(username, { type: 'string' }),
          StellarSdk.nativeToScVal(score, { type: 'u32' }),
          gameSymbol
        )
      )
      .setTimeout(30)
      .build();

    // Simulate the transaction first
    const preparedTransaction = await sorobanServer.prepareTransaction(builtTransaction);
    
    // Convert to XDR for signing
    const xdr = preparedTransaction.toXDR();

    // Sign with Freighter
    if (!window.freighterApi) {
      throw new Error('Freighter wallet not found');
    }

    const signedTx = await window.freighterApi.signTransaction(xdr, {
      network: NETWORK,
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    // Parse the signed transaction
    const transaction = StellarSdk.TransactionBuilder.fromXDR(
      signedTx.signedTxXdr,
      NETWORK_PASSPHRASE
    );

    // Submit transaction
    const txResult = await sorobanServer.sendTransaction(transaction);

    // Check if transaction was accepted
    if (txResult.status === 'ERROR') {
      return {
        success: false,
        error: 'Transaction was rejected by the network',
      };
    }

    // Return success immediately (transaction is processing)
    return {
      success: true,
      data: {
        hash: txResult.hash,
        status: txResult.status,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get the top score from the contract for a specific game
 */
export async function getTopScore(gameType: 'snake' | 'pong'): Promise<ContractResponse> {
  try {
    // We need a source account for simulation (can be any funded account)
    // Using a public testnet account for read-only operations
    const sourceKeypair = StellarSdk.Keypair.random();
    const sourceAccount = new StellarSdk.Account(sourceKeypair.publicKey(), '0');
    
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const gameSymbol = StellarSdk.nativeToScVal(gameType, { type: 'symbol' });
    
    // Build transaction to call get_top_score
    const builtTransaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call('get_top_score', gameSymbol))
      .setTimeout(30)
      .build();

    // Simulate the transaction to get the result
    const simulation = await sorobanServer.simulateTransaction(builtTransaction);
    
    if (StellarSdk.SorobanRpc.Api.isSimulationSuccess(simulation)) {
      const result = simulation.result?.retval;
      
      if (result) {
        // Parse the result (Option<PlayerScore>)
        const resultValue = StellarSdk.scValToNative(result);
        
        return {
          success: true,
          data: resultValue,
        };
      } else {
        return {
          success: true,
          data: null,
        };
      }
    } else {
      return {
        success: false,
        error: 'Failed to simulate transaction',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get the last player who submitted for a specific game
 */
export async function getLastPlayer(gameType: 'snake' | 'pong'): Promise<ContractResponse> {
  try {
    const sourceKeypair = StellarSdk.Keypair.random();
    const sourceAccount = new StellarSdk.Account(sourceKeypair.publicKey(), '0');
    
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const gameSymbol = StellarSdk.nativeToScVal(gameType, { type: 'symbol' });
    
    const builtTransaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call('get_last_player', gameSymbol))
      .setTimeout(30)
      .build();

    const simulation = await sorobanServer.simulateTransaction(builtTransaction);
    
    if (StellarSdk.SorobanRpc.Api.isSimulationSuccess(simulation)) {
      const result = simulation.result?.retval;
      
      if (result) {
        const resultValue = StellarSdk.scValToNative(result);
        
        return {
          success: true,
          data: resultValue,
        };
      } else {
        return {
          success: true,
          data: null,
        };
      }
    } else {
      return {
        success: false,
        error: 'Failed to simulate transaction',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Claim reward (if player has top score) for a specific game
 */
export async function claimReward(playerAddress: string, gameType: 'snake' | 'pong'): Promise<ContractResponse> {
  try {
    const sourceAccount = await sorobanServer.getAccount(playerAddress);
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const gameSymbol = StellarSdk.nativeToScVal(gameType, { type: 'symbol' });
    
    const builtTransaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          'claim_reward',
          StellarSdk.Address.fromString(playerAddress).toScVal(),
          gameSymbol
        )
      )
      .setTimeout(30)
      .build();

    const preparedTransaction = await sorobanServer.prepareTransaction(builtTransaction);
    const xdr = preparedTransaction.toXDR();

    if (!window.freighterApi) {
      throw new Error('Freighter wallet not found');
    }

    const signedTx = await window.freighterApi.signTransaction(xdr, {
      network: NETWORK,
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    const transaction = StellarSdk.TransactionBuilder.fromXDR(
      signedTx.signedTxXdr,
      NETWORK_PASSPHRASE
    );

    const txResult = await sorobanServer.sendTransaction(transaction);

    return {
      success: true,
      data: txResult,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get the full leaderboard (top 10 scores) for a specific game
 */
export async function getLeaderboard(gameType: 'snake' | 'pong'): Promise<Array<{ address: string; username: string; score: number }>> {
  try {
    const sourceKeypair = StellarSdk.Keypair.random();
    const sourceAccount = new StellarSdk.Account(sourceKeypair.publicKey(), '0');
    
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const gameSymbol = StellarSdk.nativeToScVal(gameType, { type: 'symbol' });
    
    const builtTransaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call('get_leaderboard', gameSymbol))
      .setTimeout(30)
      .build();

    const simulation = await sorobanServer.simulateTransaction(builtTransaction);
    
    if (StellarSdk.SorobanRpc.Api.isSimulationSuccess(simulation)) {
      const result = simulation.result?.retval;
      
      if (result) {
        const resultValue = StellarSdk.scValToNative(result);
        
        // Transform the result to a more usable format
        if (Array.isArray(resultValue)) {
          return resultValue.map((entry: any) => ({
            address: entry.player,
            username: entry.username,
            score: entry.score,
          }));
        }
        
        return [];
      }
      
      return [];
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
}

/**
 * Check if reward has been claimed for a specific game
 */
export async function hasClaimedReward(gameType: 'snake' | 'pong'): Promise<boolean> {
  try {
    const sourceKeypair = StellarSdk.Keypair.random();
    const sourceAccount = new StellarSdk.Account(sourceKeypair.publicKey(), '0');
    
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const gameSymbol = StellarSdk.nativeToScVal(gameType, { type: 'symbol' });
    
    const builtTransaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call('has_claimed_reward', gameSymbol))
      .setTimeout(30)
      .build();

    const simulation = await sorobanServer.simulateTransaction(builtTransaction);
    
    if (StellarSdk.SorobanRpc.Api.isSimulationSuccess(simulation)) {
      const result = simulation.result?.retval;
      
      if (result) {
        const resultValue = StellarSdk.scValToNative(result);
        return resultValue === true;
      }
    }
    
    return false;
  } catch (error) {
    return false;
  }
}
