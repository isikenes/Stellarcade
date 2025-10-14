# Test script for the Soroban contract
Write-Host "🧪 Testing Arcade Reward Contract..." -ForegroundColor Cyan

# Navigate to contract directory
Set-Location -Path "contract"

# Run tests
Write-Host "Running contract tests..." -ForegroundColor Yellow
cargo test

# Check if tests passed
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ All tests passed!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Tests failed!" -ForegroundColor Red
    Set-Location -Path ".."
    exit 1
}

# Return to root directory
Set-Location -Path ".."
