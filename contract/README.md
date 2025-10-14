# Arcade Reward Smart Contract

Simple Soroban smart contract for arcade game score tracking and rewards.

## Functions

- `submit_score(player: Address, score: u32)` - Submit a player's score
- `get_top_score()` - Get the highest score and player
- `get_last_player()` - Get the last player who submitted
- `claim_reward(player: Address)` - Claim reward if top player

## Build

```bash
cargo build --target wasm32-unknown-unknown --release
```

## Test

```bash
cargo test
```

## Deploy to Testnet

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/arcade_reward.wasm \
  --source alice \
  --network testnet \
  --alias arcade_reward
```
