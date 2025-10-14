# 🏗️ Stellarcade Architecture

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Stellarcade Frontend (Next.js)            │ │
│  │                                                        │ │
│  │  ┌──────────────┐         ┌──────────────┐           │ │
│  │  │  index.tsx   │──────▶  │   main.tsx   │           │ │
│  │  │  (Connect)   │         │   (Game UI)  │           │ │
│  │  └──────────────┘         └──────┬───────┘           │ │
│  │                                   │                    │ │
│  │                                   ▼                    │ │
│  │                          ┌─────────────────┐          │ │
│  │                          │  stellar.ts     │          │ │
│  │                          │  (SDK Utils)    │          │ │
│  │                          └────────┬────────┘          │ │
│  └─────────────────────────────────┼─────────────────────┘ │
│                                     │                       │
│  ┌──────────────────────────────────┼────────────────────┐ │
│  │         Freighter Wallet         │                    │ │
│  │  ┌──────────────────────────┐    │                    │ │
│  │  │ window.freighterApi      │    │                    │ │
│  │  │ - requestAccess()        │    │                    │ │
│  │  │ - signTransaction()      │◀───┘                    │ │
│  │  └──────────────────────────┘                         │ │
│  └────────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │ Signed Transactions
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Stellar Testnet                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Soroban RPC Server                        │ │
│  │        https://soroban-testnet.stellar.org            │ │
│  └────────────────────┬───────────────────────────────────┘ │
│                       │                                      │
│                       ▼                                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │          Smart Contract (arcade_reward)                │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  Functions:                                      │ │ │
│  │  │  - submit_score(player, score)                   │ │ │
│  │  │  - get_top_score()                              │ │ │
│  │  │  - get_last_player()                            │ │ │
│  │  │  - claim_reward(player)                         │ │ │
│  │  │                                                  │ │ │
│  │  │  Storage:                                        │ │ │
│  │  │  - TopScore (PlayerScore)                       │ │ │
│  │  │  - LastPlayer (Address)                         │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 User Flow

```
┌──────────────┐
│   User       │
│   Opens      │
│   Browser    │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────┐
│  index.tsx                  │
│  - Check Freighter          │
│  - Show Connect Button      │
└──────┬──────────────────────┘
       │ Click Connect
       ▼
┌─────────────────────────────┐
│  Freighter Popup            │
│  - Approve Access           │
└──────┬──────────────────────┘
       │ Approve
       ▼
┌─────────────────────────────┐
│  Save to localStorage       │
│  Redirect to /main          │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  main.tsx                   │
│  - Show Wallet Address      │
│  - Show Input Forms         │
│  - Show Leaderboard         │
└──────┬──────────────────────┘
       │ Enter Name & Score
       ▼
┌─────────────────────────────┐
│  Click Submit Score         │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  stellar.ts                 │
│  - Build Transaction        │
│  - Call submit_score()      │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Freighter Signs TX         │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Send to Soroban RPC        │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Contract Executes          │
│  - Update Storage           │
│  - Update Top Score         │
│  - Set Last Player          │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Success Response           │
│  - Update UI                │
│  - Show Success Message     │
└─────────────────────────────┘
```

## 📁 File Organization

```
Stellarcade/
│
├── 📄 Configuration Files
│   ├── package.json           # Dependencies & scripts
│   ├── tsconfig.json          # TypeScript config
│   ├── tailwind.config.ts     # Tailwind CSS config
│   ├── next.config.js         # Next.js config
│   ├── postcss.config.js      # PostCSS config
│   ├── .gitignore             # Git ignore rules
│   ├── .env.example           # Environment template
│   └── next-env.d.ts          # Next.js types
│
├── 📚 Documentation
│   ├── README.md              # Project overview
│   ├── QUICKSTART.md          # Setup guide
│   ├── CHECKLIST.md           # Pre-deployment checklist
│   ├── PROJECT_SUMMARY.md     # Complete summary
│   ├── ARCHITECTURE.md        # This file
│   ├── pdr.md                 # Product requirements
│   ├── FreighterWalletDocs.md # Wallet integration docs
│   └── StellarDeploy.md       # Deployment guide
│
├── 🎨 Frontend
│   ├── pages/
│   │   ├── _app.tsx           # App wrapper
│   │   ├── index.tsx          # Connect page
│   │   └── main.tsx           # Main game UI
│   │
│   ├── styles/
│   │   └── globals.css        # Global styles
│   │
│   ├── utils/
│   │   └── stellar.ts         # Stellar SDK integration
│   │
│   └── types/
│       ├── freighter.d.ts     # Freighter types
│       └── contract.ts        # Contract types
│
├── 📜 Smart Contract
│   └── contract/
│       ├── src/
│       │   └── lib.rs         # Contract implementation
│       ├── Cargo.toml         # Rust dependencies
│       └── README.md          # Contract docs
│
└── 🛠️ Scripts
    ├── build-contract.ps1     # Build script
    └── test-contract.ps1      # Test script
```

## 🔌 Data Flow

### Submit Score Flow
```
User Input (Name + Score)
      │
      ▼
validate input
      │
      ▼
stellar.ts: submitScore()
      │
      ├─▶ Load account from Horizon
      ├─▶ Build contract call operation
      ├─▶ Create transaction
      ├─▶ Convert to XDR
      │
      ▼
Freighter: signTransaction()
      │
      ▼
Submit to Soroban RPC
      │
      ▼
Contract: submit_score()
      │
      ├─▶ require_auth(player)
      ├─▶ Update LastPlayer in storage
      ├─▶ Check current TopScore
      ├─▶ Update TopScore if higher
      │
      ▼
Transaction Result
      │
      ▼
Update UI with success/error
```

### Get Top Score Flow
```
Component Mount/Refresh
      │
      ▼
stellar.ts: getTopScore()
      │
      ▼
Query Contract State
      │
      ▼
Parse PlayerScore data
      │
      ▼
Update UI with:
  - Top Score (number)
  - Top Player (address)
```

## 🔐 Security & Authentication

```
┌─────────────────────┐
│   User Action       │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Freighter Signs TX  │
│ (Private Key Secure)│
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Contract Verifies   │
│ require_auth()      │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Execute if Verified │
└─────────────────────┘
```

## 💾 Storage Structure

```
Contract Storage (Persistent)
│
├── DataKey::TopScore
│   └── PlayerScore {
│       ├── player: Address
│       └── score: u32
│       }
│
└── DataKey::LastPlayer
    └── Address
```

## 🎯 Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| `index.tsx` | Wallet connection only |
| `main.tsx` | Game UI & state management |
| `stellar.ts` | Blockchain interactions |
| `freighter.d.ts` | Type definitions |
| `lib.rs` | Smart contract logic |

## 🔄 State Management

### Frontend State (React)
- `walletAddress` - Connected wallet
- `playerName` - Player input
- `score` - Score input
- `topScore` - Current top score
- `topPlayer` - Top player name
- `lastPlayer` - Last player
- `isTopPlayer` - User has top score

### Contract State (Soroban)
- `TopScore` - Highest score + player
- `LastPlayer` - Last player address

## 📡 API Endpoints

### Stellar Testnet
- **Horizon**: `https://horizon-testnet.stellar.org`
- **Soroban RPC**: `https://soroban-testnet.stellar.org`

### Contract Functions (via Soroban RPC)
- `submit_score(player: Address, score: u32)`
- `get_top_score() -> Option<PlayerScore>`
- `get_last_player() -> Option<Address>`
- `claim_reward(player: Address) -> bool`

---

This architecture ensures:
- ✅ Clear separation of concerns
- ✅ Secure wallet integration
- ✅ Simple but complete functionality
- ✅ Easy to understand and maintain
- ✅ Ready for future enhancements
