# 🚀 Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- Rust and Cargo installed
- Stellar CLI installed
- Freighter Wallet browser extension

## Step-by-Step Setup

### 1️⃣ Install Frontend Dependencies
```powershell
npm install
```

### 2️⃣ Build Smart Contract
```powershell
cd contract
cargo build --target wasm32-unknown-unknown --release
cd ..
```

### 3️⃣ Test Contract (Optional)
```powershell
cd contract
cargo test
cd ..
```

### 4️⃣ Deploy Contract to Testnet

Make sure you have Stellar CLI configured with testnet:
```powershell
stellar network add testnet `
  --rpc-url https://soroban-testnet.stellar.org `
  --network-passphrase "Test SDF Network ; September 2015"
```

Create an identity (if not already created):
```powershell
stellar keys generate alice --network testnet
```

Fund the account:
```powershell
stellar keys fund alice --network testnet
```

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

**Save the contract ID** that is returned!

### 5️⃣ Configure Environment
```powershell
Copy-Item .env.example .env.local
```

Edit `.env.local` and paste your contract ID:
```
NEXT_PUBLIC_CONTRACT_ID=C...YOUR_CONTRACT_ID
```

### 6️⃣ Run Development Server
```powershell
npm run dev
```

Visit: http://localhost:3000

### 7️⃣ Test the App
1. Make sure Freighter Wallet is installed and set to **Testnet**
2. Click "Connect Freighter Wallet"
3. Approve the connection
4. You'll be redirected to /main
5. Enter a player name and score
6. Submit and see the transaction in console

## 🐛 Troubleshooting

### Freighter Not Found
- Install from: https://www.freighter.app/
- Make sure it's enabled in your browser

### Contract Deployment Failed
- Check if Alice account is funded
- Verify network is set to testnet
- Make sure wasm file exists in target directory

### Transaction Failed
- Ensure Freighter is set to Testnet mode
- Check console for detailed error messages
- Verify contract ID is correctly set in .env.local

### Dependencies Not Installing
- Clear node_modules: `Remove-Item -Recurse -Force node_modules`
- Delete package-lock.json
- Run `npm install` again

## 📝 Important Commands

**Check Stellar CLI version:**
```powershell
stellar --version
```

**List your identities:**
```powershell
stellar keys ls
```

**Check account balance:**
```powershell
stellar keys fund alice --network testnet
```

**Invoke contract function:**
```powershell
stellar contract invoke `
  --id YOUR_CONTRACT_ID `
  --source alice `
  --network testnet `
  -- get_top_score
```

## 🎯 What's Working

✅ Wallet connection with Freighter  
✅ Redirect to /main after connection  
✅ Disconnect functionality  
✅ Score submission form  
✅ Contract integration ready  
✅ Clean, minimal UI with Tailwind CSS  
✅ TypeScript types for safety  
✅ Console logging for debugging  

## 📖 Next Steps

After verifying everything works:
- Submit some test scores
- Check the leaderboard updates
- Try claiming reward as top player
- Review transaction in Stellar Expert (testnet)

---

**Ready to deploy to production?** Wait for further instructions! 🚀
