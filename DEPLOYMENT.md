# 🚀 Deployment Guide

This guide will help you deploy and test the Stellarcade dApp.

## Phase 1: Local Development Setup ✅

You are here! All code is ready.

## Phase 2: Deploy to Testnet (Follow These Steps)

### Step 1: Install Dependencies

Open PowerShell in the project root and run:

```powershell
npm install
```

Expected output: All packages installed successfully.

### Step 2: Build the Smart Contract

```powershell
cd contract
cargo build --target wasm32-unknown-unknown --release
```

Or use the helper script:
```powershell
.\build-contract.ps1
```

Expected output: 
- Build successful
- WASM file created at `contract/target/wasm32-unknown-unknown/release/arcade_reward.wasm`

### Step 3: Test the Contract (Optional but Recommended)

```powershell
cd contract
cargo test
```

Or use the helper script:
```powershell
.\test-contract.ps1
```

Expected output: All tests pass ✅

### Step 4: Setup Stellar CLI

If not already done, configure the testnet:

```powershell
stellar network add testnet `
  --rpc-url https://soroban-testnet.stellar.org `
  --network-passphrase "Test SDF Network ; September 2015"
```

### Step 5: Create and Fund Identity

Create an identity called "alice":

```powershell
stellar keys generate alice --network testnet
```

Fund the account with testnet XLM:

```powershell
stellar keys fund alice --network testnet
```

Verify funding:
```powershell
stellar keys address alice
```

Copy the address and check balance at: https://stellar.expert/explorer/testnet

### Step 6: Deploy Contract to Testnet

Deploy the contract:

```powershell
cd contract
stellar contract deploy `
  --wasm target/wasm32-unknown-unknown/release/arcade_reward.wasm `
  --source alice `
  --network testnet `
  --alias arcade_reward
cd ..
```

**IMPORTANT**: Save the contract ID that is returned!

Example output:
```
CACDYF3CYMJEJTIVFESQYZTN67GO2R5D5IUABTCUG3HXQSRXCSOROBAN
```

### Step 7: Configure Environment

Create the `.env.local` file:

```powershell
Copy-Item .env.example .env.local
```

Edit `.env.local` and add your contract ID:

```
NEXT_PUBLIC_CONTRACT_ID=CACDYF3CYMJEJTIVFESQYZTN67GO2R5D5IUABTCUG3HXQSRXCSOROBAN
```

Replace with your actual contract ID!

### Step 8: Start Development Server

```powershell
npm run dev
```

Expected output:
```
ready - started server on 0.0.0.0:3000
```

Open your browser to: http://localhost:3000

## Phase 3: Test the Application

### Test 1: Wallet Connection

1. Make sure Freighter is installed
2. Switch Freighter to **TESTNET** mode
3. Click "Connect Freighter Wallet"
4. Approve the connection in the popup
5. You should be redirected to `/main`

✅ Success: You see your wallet address displayed

### Test 2: Submit Score

1. On the main page, enter:
   - Player Name: "TestPlayer"
   - Score: 100
2. Click "Submit Score"
3. Freighter popup appears
4. Click "Approve" in Freighter
5. Wait for transaction to complete

✅ Success: "Score submitted successfully" message appears

### Test 3: View Leaderboard

1. Check the leaderboard section
2. You should see:
   - Top Score: 100
   - Top Player: TestPlayer
   - Last Player: TestPlayer

✅ Success: Data is displayed correctly

### Test 4: Submit Higher Score

1. Enter:
   - Player Name: "ChampionPlayer"
   - Score: 250
2. Submit and approve
3. Check leaderboard updates

✅ Success: New top score and player displayed

### Test 5: Claim Reward

1. If you have the top score, click "Claim Reward"
2. Approve transaction in Freighter
3. Check for success message

✅ Success: "Reward claimed successfully! 🎉"

### Test 6: Disconnect

1. Click "Disconnect" button
2. You should return to home page
3. localStorage cleared

✅ Success: Back to connect page

## Phase 4: Verify on Blockchain

### View Contract on Stellar Expert

Visit: https://stellar.expert/explorer/testnet/contract/YOUR_CONTRACT_ID

Replace YOUR_CONTRACT_ID with your actual contract ID.

You should see:
- Contract details
- Recent transactions
- Contract operations

### View Transaction Details

After each operation, check the transaction:
1. Copy transaction hash from console
2. Visit: https://stellar.expert/explorer/testnet/tx/TRANSACTION_HASH
3. View full transaction details

## Troubleshooting

### Problem: "Freighter not installed"
**Solution**: Install from https://www.freighter.app/

### Problem: "Transaction failed - Account not found"
**Solution**: Make sure alice account is funded with testnet XLM

### Problem: "Contract ID not found"
**Solution**: 
- Verify .env.local exists
- Check contract ID is correct
- Restart dev server

### Problem: "Build failed"
**Solution**:
- Run `cargo clean` in contract folder
- Rebuild with `cargo build --target wasm32-unknown-unknown --release`

### Problem: "Module not found" errors
**Solution**:
- Delete node_modules folder
- Delete package-lock.json
- Run `npm install` again

### Problem: Freighter shows wrong network
**Solution**:
- Open Freighter
- Click settings
- Switch to TESTNET

## Command Reference

### Build Commands
```powershell
# Install dependencies
npm install

# Build contract
cd contract
cargo build --target wasm32-unknown-unknown --release
cd ..

# Test contract
cd contract
cargo test
cd ..

# Run dev server
npm run dev

# Build for production
npm run build
```

### Stellar CLI Commands
```powershell
# Add network
stellar network add testnet --rpc-url https://soroban-testnet.stellar.org

# Generate identity
stellar keys generate alice --network testnet

# Fund account
stellar keys fund alice --network testnet

# Deploy contract
stellar contract deploy --wasm path/to/file.wasm --source alice --network testnet

# Invoke contract function
stellar contract invoke --id CONTRACT_ID --source alice --network testnet -- get_top_score
```

## Expected Behavior Summary

| Action | Expected Result |
|--------|----------------|
| Load home page | See connect button |
| Click connect | Freighter popup |
| Approve connection | Redirect to /main |
| Submit score | Freighter tx popup |
| Approve tx | Success message |
| View leaderboard | See scores |
| Claim reward (if top) | Reward claim tx |
| Disconnect | Return to home |

## Next Steps

After successful testnet deployment:
- ✅ All features working
- ✅ Transactions confirmed
- ✅ UI updates correctly

You're ready for production deployment when you're ready!

---

## Support & Resources

- **Stellar Docs**: https://developers.stellar.org/
- **Soroban Docs**: https://soroban.stellar.org/
- **Freighter Docs**: https://docs.freighter.app/
- **Stellar Expert**: https://stellar.expert/
- **Stellar Discord**: https://discord.gg/stellar

---

**Status**: Ready to deploy! 🚀

Follow the steps above and you'll have a working dApp in no time!
