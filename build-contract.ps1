# Build script for the Soroban contract
Write-Host "🔨 Building Arcade Reward Contract..." -ForegroundColor Cyan

# Navigate to contract directory
Set-Location -Path "contract"

# Build the contract
Write-Host "Building Rust contract..." -ForegroundColor Yellow
cargo build --target wasm32-unknown-unknown --release

# Check if build was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Contract built successfully!" -ForegroundColor Green
    Write-Host "📦 WASM file: target/wasm32-unknown-unknown/release/arcade_reward.wasm" -ForegroundColor Green
    
    # Check file size
    $wasmPath = "target/wasm32-unknown-unknown/release/arcade_reward.wasm"
    if (Test-Path $wasmPath) {
        $fileSize = (Get-Item $wasmPath).Length / 1KB
        Write-Host "📊 File size: $([math]::Round($fileSize, 2)) KB" -ForegroundColor Cyan
    }
    
    Write-Host "`n🚀 Ready to deploy!" -ForegroundColor Green
    Write-Host "Run: stellar contract deploy --wasm $wasmPath --source alice --network testnet" -ForegroundColor Yellow
} else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Return to root directory
Set-Location -Path ".."
