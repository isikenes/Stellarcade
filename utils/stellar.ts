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
 * Submit a score to the smart contract
 */
export async function submitScore(
  playerAddress: string,
  score: number
): Promise<ContractResponse> {
  try {
    console.log('Submitting score:', { playerAddress, score, contractId: CONTRACT_ID });
    
    // Load account from Soroban RPC
    const sourceAccount = await sorobanServer.getAccount(playerAddress);
    
    // Build the contract call
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    
    // Build transaction with contract call
    const builtTransaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          'submit_score',
          StellarSdk.Address.fromString(playerAddress).toScVal(),
          StellarSdk.nativeToScVal(score, { type: 'u32' })
        )
      )
      .setTimeout(30)
      .build();

    // Simulate the transaction first
    console.log('Simulating transaction...');
    const preparedTransaction = await sorobanServer.prepareTransaction(builtTransaction);
    
    // Convert to XDR for signing
    const xdr = preparedTransaction.toXDR();
    console.log('Transaction prepared, requesting signature...');

    // Sign with Freighter
    if (!window.freighterApi) {
      throw new Error('Freighter wallet not found');
    }

    const signedTx = await window.freighterApi.signTransaction(xdr, {
      network: NETWORK,
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    console.log('Transaction signed, submitting...');

    // Parse the signed transaction
    const transaction = StellarSdk.TransactionBuilder.fromXDR(
      signedTx.signedTxXdr,
      NETWORK_PASSPHRASE
    );

    // Submit transaction
    const txResult = await sorobanServer.sendTransaction(transaction);
    console.log('Transaction sent:', txResult);

    // Check if transaction was accepted
    if (txResult.status === 'ERROR') {
      console.error('Transaction error:', txResult);
      return {
        success: false,
        error: 'Transaction was rejected by the network',
      };
    }

    // Return success immediately (transaction is processing)
    console.log('✅ Transaction submitted successfully! Hash:', txResult.hash);
    
    return {
      success: true,
      data: {
        hash: txResult.hash,
        status: txResult.status,
      },
    };
  } catch (error) {
    console.error('Error submitting score:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get the top score from the contract
 */
export async function getTopScore(): Promise<ContractResponse> {
  try {
    console.log('Getting top score from contract...');
    
    // We need a source account for simulation (can be any funded account)
    // Using a public testnet account for read-only operations
    const sourceKeypair = StellarSdk.Keypair.random();
    const sourceAccount = new StellarSdk.Account(sourceKeypair.publicKey(), '0');
    
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    
    // Build transaction to call get_top_score
    const builtTransaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call('get_top_score'))
      .setTimeout(30)
      .build();

    // Simulate the transaction to get the result
    const simulation = await sorobanServer.simulateTransaction(builtTransaction);
    
    if (StellarSdk.SorobanRpc.Api.isSimulationSuccess(simulation)) {
      const result = simulation.result?.retval;
      
      if (result) {
        // Parse the result (Option<PlayerScore>)
        console.log('Top score result:', result);
        
        // Check if it's Some or None
        const resultValue = StellarSdk.scValToNative(result);
        console.log('Parsed result:', resultValue);
        
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
      console.error('Simulation failed:', simulation);
      return {
        success: false,
        error: 'Failed to simulate transaction',
      };
    }
  } catch (error) {
    console.error('Error getting top score:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get the last player who submitted
 */
export async function getLastPlayer(): Promise<ContractResponse> {
  try {
    console.log('Getting last player from contract...');
    
    const sourceKeypair = StellarSdk.Keypair.random();
    const sourceAccount = new StellarSdk.Account(sourceKeypair.publicKey(), '0');
    
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    
    const builtTransaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call('get_last_player'))
      .setTimeout(30)
      .build();

    const simulation = await sorobanServer.simulateTransaction(builtTransaction);
    
    if (StellarSdk.SorobanRpc.Api.isSimulationSuccess(simulation)) {
      const result = simulation.result?.retval;
      
      if (result) {
        const resultValue = StellarSdk.scValToNative(result);
        console.log('Last player:', resultValue);
        
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
    console.error('Error getting last player:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Claim reward (if player has top score)
 */
export async function claimReward(playerAddress: string): Promise<ContractResponse> {
  try {
    const sourceAccount = await sorobanServer.getAccount(playerAddress);
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    
    const builtTransaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          'claim_reward',
          StellarSdk.Address.fromString(playerAddress).toScVal()
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

    console.log('Reward claimed:', txResult);

    return {
      success: true,
      data: txResult,
    };
  } catch (error) {
    console.error('Error claiming reward:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
