# ⚡ QUICK REFERENCE - Stellarcade

**One-page reference for common tasks**

---

## 🚀 QUICK START (5 Steps)

```powershell
# 1. Install dependencies
npm install

# 2. Build contract
cd contract; cargo build --target wasm32-unknown-unknown --release; cd ..

# 3. Deploy contract (save the contract ID!)
cd contract
stellar contract deploy --wasm target/wasm32-unknown-unknown/release/arcade_reward.wasm --source alice --network testnet
cd ..

# 4. Configure environment
Copy-Item .env.example .env.local
# Edit .env.local and add your contract ID

# 5. Run app
npm run dev
```

---

## 📁 KEY FILES

| File | Purpose |
|------|---------|
| `pages/index.tsx` | Wallet connect page |
| `pages/main.tsx` | Main game UI |
| `utils/stellar.ts` | Contract interactions |
| `contract/src/lib.rs` | Smart contract |
| `.env.local` | Contract ID config |

---

## 🔧 COMMON COMMANDS

### Frontend
```powershell
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run linter
```

### Contract
```powershell
# Build
cd contract
cargo build --target wasm32-unknown-unknown --release

# Test
cargo test

# Clean
cargo clean
```

### Stellar CLI
```powershell
# Setup
stellar network add testnet --rpc-url https://soroban-testnet.stellar.org
stellar keys generate alice --network testnet
stellar keys fund alice --network testnet

# Deploy
stellar contract deploy --wasm path/to/file.wasm --source alice --network testnet

# Invoke
stellar contract invoke --id CONTRACT_ID --source alice --network testnet -- get_top_score
```

---

## 🎯 CONTRACT FUNCTIONS

| Function | Purpose | Parameters |
|----------|---------|------------|
| `submit_score` | Submit player score | `player: Address, score: u32` |
| `get_top_score` | Get highest score | None |
| `get_last_player` | Get last player | None |
| `claim_reward` | Claim reward | `player: Address` |

---

## 🔌 STELLAR SDK FUNCTIONS

| Function | Purpose |
|----------|---------|
| `submitScore(address, score)` | Submit score via contract |
| `getTopScore()` | Query top score |
| `getLastPlayer()` | Query last player |
| `claimReward(address)` | Claim reward |

---

## 🐛 TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| Freighter not found | Install from freighter.app |
| Transaction failed | Check Freighter is on testnet |
| Build failed | Run `cargo clean` and rebuild |
| Module not found | Delete node_modules, run `npm install` |
| Contract not found | Check contract ID in .env.local |

---

## 📚 DOCUMENTATION

- **README.md** - Full project overview
- **QUICKSTART.md** - Detailed setup guide
- **DEPLOYMENT.md** - Deployment instructions
- **CHECKLIST.md** - Pre-deployment checklist
- **ARCHITECTURE.md** - System architecture
- **PROJECT_COMPLETE.md** - Complete delivery summary

---

## 🌐 URLS

- **Dev Server**: http://localhost:3000
- **Testnet Horizon**: https://horizon-testnet.stellar.org
- **Testnet Soroban**: https://soroban-testnet.stellar.org
- **Stellar Expert**: https://stellar.expert/explorer/testnet
- **Freighter**: https://www.freighter.app/

---

## ✅ PRE-FLIGHT CHECKLIST

- [ ] Node.js installed
- [ ] Rust & Cargo installed
- [ ] Stellar CLI installed
- [ ] Freighter installed & set to testnet
- [ ] Dependencies installed (`npm install`)
- [ ] Contract built
- [ ] Contract deployed
- [ ] Contract ID in `.env.local`
- [ ] Dev server running

---

## 🎮 USER FLOW

1. Open http://localhost:3000
2. Click "Connect Freighter Wallet"
3. Approve in Freighter
4. Enter player name & score
5. Click "Submit Score"
6. Approve transaction in Freighter
7. View leaderboard updates
8. (Optional) Claim reward if top player

---

## 💾 PROJECT STRUCTURE

```
Stellarcade/
├── pages/          → Frontend pages
├── utils/          → Stellar SDK integration
├── types/          → TypeScript definitions
├── styles/         → CSS files
├── contract/       → Soroban smart contract
└── [docs]          → 8 documentation files
```

---

## 🎯 WHAT'S INCLUDED

✅ Wallet integration  
✅ Two complete pages  
✅ Smart contract (4 functions)  
✅ SDK integration  
✅ Error handling  
✅ Loading states  
✅ Type definitions  
✅ 8 documentation files  
✅ Helper scripts  

---

## 🚨 IMPORTANT NOTES

- Always use **TESTNET** in Freighter
- Contract ID starts with 'C'
- Save contract ID to `.env.local`
- Restart dev server after changing .env
- Check console for debugging

---

## 📞 NEED HELP?

1. Check console for errors (F12)
2. Review DEPLOYMENT.md
3. Check Freighter is on testnet
4. Verify contract ID is correct
5. Check account has testnet XLM

---

**Last Updated**: October 14, 2025  
**Status**: ✅ Ready for deployment
