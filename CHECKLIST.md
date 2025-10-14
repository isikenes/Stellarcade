# ✅ Pre-Deployment Checklist

Use this checklist before running the application.

## 📋 Environment Setup

- [ ] Node.js 18+ installed
- [ ] Rust and Cargo installed
- [ ] Stellar CLI installed (`stellar --version`)
- [ ] Freighter Wallet browser extension installed
- [ ] Freighter set to **TESTNET** mode

## 🔧 Project Setup

- [ ] Cloned/opened project directory
- [ ] Run `npm install` successfully
- [ ] All dependencies installed without errors

## 🏗️ Contract Setup

- [ ] Navigate to `contract` directory
- [ ] Run `cargo build --target wasm32-unknown-unknown --release`
- [ ] Build completed successfully
- [ ] WASM file exists: `contract/target/wasm32-unknown-unknown/release/arcade_reward.wasm`
- [ ] (Optional) Run `cargo test` - all tests pass

## 🌐 Stellar Network Setup

- [ ] Stellar testnet network configured
  ```powershell
  stellar network add testnet `
    --rpc-url https://soroban-testnet.stellar.org `
    --network-passphrase "Test SDF Network ; September 2015"
  ```

- [ ] Identity created
  ```powershell
  stellar keys generate alice --network testnet
  ```

- [ ] Account funded
  ```powershell
  stellar keys fund alice --network testnet
  ```

## 🚀 Contract Deployment

- [ ] Contract deployed to testnet
  ```powershell
  cd contract
  stellar contract deploy `
    --wasm target/wasm32-unknown-unknown/release/arcade_reward.wasm `
    --source alice `
    --network testnet `
    --alias arcade_reward
  cd ..
  ```

- [ ] Contract ID saved (starts with 'C')
- [ ] `.env.local` file created (copy from `.env.example`)
- [ ] Contract ID added to `.env.local`:
  ```
  NEXT_PUBLIC_CONTRACT_ID=C...YOUR_CONTRACT_ID
  ```

## 🎮 Frontend Setup

- [ ] Development server starts: `npm run dev`
- [ ] No compilation errors in terminal
- [ ] Browser opens to http://localhost:3000
- [ ] Home page loads correctly

## 🔌 Wallet Connection Test

- [ ] Click "Connect Freighter Wallet" button
- [ ] Freighter popup appears
- [ ] Approve connection in Freighter
- [ ] Redirected to `/main` page
- [ ] Wallet address displayed at top
- [ ] No console errors

## 🎯 Functionality Test

- [ ] Player name input works
- [ ] Score input accepts only numbers
- [ ] Submit button clickable
- [ ] Submit creates Freighter transaction popup
- [ ] Transaction can be approved in Freighter
- [ ] Success message appears
- [ ] Leaderboard updates (may need to refresh contract data)
- [ ] Disconnect button returns to home page

## 🐛 Debugging

If issues occur, check:

- [ ] Browser console for errors (F12)
- [ ] Network tab shows Stellar API calls
- [ ] Freighter is unlocked and set to testnet
- [ ] Contract ID in `.env.local` is correct
- [ ] Account has testnet XLM balance

## 📊 Success Indicators

✅ All checks above completed  
✅ No errors in browser console  
✅ Wallet connects successfully  
✅ Transactions can be signed  
✅ Contract functions are called  
✅ UI updates accordingly  

---

## 🆘 Common Issues

### Issue: "Freighter Not Installed"
**Solution**: Install from https://www.freighter.app/

### Issue: "Transaction Failed"
**Solution**: 
- Check Freighter is on testnet
- Verify account has XLM
- Check contract ID is correct

### Issue: "Contract ID Not Found"
**Solution**: 
- Ensure `.env.local` exists
- Verify contract ID starts with 'C'
- Restart dev server after adding .env.local

### Issue: "Build Failed"
**Solution**:
- Run `cargo clean` in contract directory
- Rebuild: `cargo build --target wasm32-unknown-unknown --release`

### Issue: "npm install fails"
**Solution**:
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

---

**Ready?** Start with: `npm run dev` 🚀

After completing this checklist, your dApp should be fully functional!
