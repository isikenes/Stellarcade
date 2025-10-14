# 🎮 Stellarcade - Minimal Arcade Reward dApp

A minimal arcade reward dApp built with Next.js (TypeScript), Tailwind CSS, and Stellar Soroban.

## 🚀 Features

- ✅ **Freighter Wallet Integration**: Connect/disconnect with window.freighterApi
- ✅ **Two Pages**:
  - `index.tsx`: Wallet connection page with redirect to /main
  - `main.tsx`: Arcade UI with score submission and leaderboard
- ✅ **Soroban Smart Contract**: 
  - `submit_score(address, score)` - Save player scores
  - `get_top_score()` - Get highest score and player
  - `get_last_player()` - Get last player who submitted
  - `claim_reward(address)` - Claim reward for top player
- ✅ **Stellar SDK Integration**: Call contract functions on testnet with Freighter signing

## 📁 Project Structure

```
Stellarcade/
├── contract/              # Soroban smart contract (Rust)
│   ├── src/
│   │   └── lib.rs        # Contract implementation
│   ├── Cargo.toml
│   └── README.md
├── pages/                 # Next.js pages
│   ├── _app.tsx          # App wrapper
│   ├── index.tsx         # Wallet connect page
│   └── main.tsx          # Main arcade UI
├── utils/
│   └── stellar.ts        # Stellar SDK integration
├── types/
│   ├── freighter.d.ts    # Freighter API types
│   └── contract.ts       # Contract types
├── styles/
│   └── globals.css       # Tailwind CSS
└── package.json
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```powershell
npm install
```

### 2. Build the Smart Contract

Navigate to the contract directory and build:

```powershell
cd contract
cargo build --target wasm32-unknown-unknown --release
```

### 3. Deploy to Testnet

Make sure you have `stellar-cli` installed and configured. Deploy the contract:

```powershell
stellar contract deploy `
  --wasm target/wasm32-unknown-unknown/release/arcade_reward.wasm `
  --source alice `
  --network testnet `
  --alias arcade_reward
```

This will return a contract ID (starts with 'C').

### 4. Configure Environment

Copy the example environment file:

```powershell
Copy-Item .env.example .env.local
```

Edit `.env.local` and add your contract ID:

```
NEXT_PUBLIC_CONTRACT_ID=CACDYF3CYMJEJTIVFESQYZTN67GO2R5D5IUABTCUG3HXQSRXCSOROBAN
```

### 5. Run Development Server

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎮 How to Use

1. **Install Freighter Wallet**: Get it from [freighter.app](https://www.freighter.app/)
2. **Connect Wallet**: Click "Connect Freighter Wallet" on the home page
3. **Submit Score**: Enter your player name and score, then submit
4. **View Leaderboard**: See the top score and last player
5. **Claim Reward**: If you have the top score, click "Claim Reward"

## 🧪 Testing the Contract

Run tests:

```powershell
cd contract
cargo test
```

## 📝 Contract Functions

### `submit_score(player: Address, score: u32)`
Submits a score for a player. Updates top score if higher.

### `get_top_score() -> Option<PlayerScore>`
Returns the highest score and the player who achieved it.

### `get_last_player() -> Option<Address>`
Returns the address of the last player who submitted a score.

### `claim_reward(player: Address) -> bool`
Allows the top player to claim their reward. Returns true if successful.

## 🌐 Network Information

- **Network**: Stellar Testnet
- **Horizon URL**: https://horizon-testnet.stellar.org
- **Soroban RPC**: https://soroban-testnet.stellar.org

## 📚 Documentation References

- [Freighter Wallet Docs](./FreighterWalletDocs.md)
- [Stellar Deploy Guide](./StellarDeploy.md)
- [Product Requirements](./pdr.md)

## ⚠️ Important Notes

- This is a **minimal implementation** for learning purposes
- No complex logic, fee calculation, or access control
- Uses Stellar Testnet (not production)
- Contract storage uses `persistent()` storage
- All transactions are logged to console for debugging

## 🔧 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🎯 Next Steps (Deployment Phase)

Wait for your prompt to proceed with:
- Contract optimization
- Production deployment
- Network configuration
- Advanced features

---

Built with ❤️ on Stellar Blockchain
