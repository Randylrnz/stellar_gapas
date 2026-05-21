# check_mainnet_costs.ps1
# A script to check Stellar Mainnet deployment costs for GAPAS smart contracts.

# Configuration
$contracts = @('gapas', 'gapas_farm') # Contract names to check
$source = "gapas"                      # Stellar CLI source account alias
$network = "mainnet"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   GAPAS - Stellar Mainnet Contract Cost Estimator        " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Source Account: $source" -ForegroundColor Yellow
Write-Host "Network:        $network" -ForegroundColor Yellow
Write-Host ""

# Check if stellar CLI is installed
if (!(Get-Command stellar -ErrorAction SilentlyContinue)) {
    Write-Host "[-] Stellar CLI ('stellar') is not installed or not in your PATH." -ForegroundColor Red
    Write-Host "    Please install it to run simulations: https://developers.stellar.org/docs/build/smart-contracts/getting-started/setup" -ForegroundColor Yellow
    exit 1
}

foreach ($wasm in $contracts) {
    # Try both standard compilation targets: new v1 target and the standard Rust target
    $paths = @(
        "target/wasm32v1-none/release/$wasm.wasm",
        "target/wasm32-unknown-unknown/release/$wasm.wasm"
    )
    
    $path = $null
    foreach ($p in $paths) {
        if (Test-Path $p) {
            $path = $p
            break
        }
    }
    
    if ($null -eq $path) {
        Write-Host "[-] Could not find compiled WASM for '$wasm'." -ForegroundColor Red
        Write-Host "    Tried paths:" -ForegroundColor Gray
        foreach ($p in $paths) {
            Write-Host "      - $p" -ForegroundColor Gray
        }
        Write-Host "    Please compile the contract using: cargo build --target wasm32-unknown-unknown --release (or wasm32v1-none)" -ForegroundColor Yellow
        Write-Host ""
        continue
    }
    
    Write-Host "[+] Simulating upload for '$wasm' ($path)..." -ForegroundColor Green
    
    # Run stellar contract upload with --build-only to get the transaction XDR
    $XDR = (stellar contract upload --wasm $path --source $source --network $network --build-only) 2>$null
    
    if (-not $XDR) {
        Write-Host "[-] Failed to generate upload XDR. Ensure that:" -ForegroundColor Red
        Write-Host "    1. The source account '$source' is configured in your Stellar CLI" -ForegroundColor Gray
        Write-Host "    2. The network '$network' is configured in your Stellar CLI" -ForegroundColor Gray
        Write-Host "    Try running manually: stellar contract upload --wasm $path --source $source --network $network --build-only" -ForegroundColor Yellow
        Write-Host ""
        continue
    }
    
    # Prepare Soroban RPC simulation payload
    $bodyObj = @{
        jsonrpc = '2.0'
        id      = 1
        method  = 'simulateTransaction'
        params  = @{
            transaction = $XDR
        }
    }
    $body = $bodyObj | ConvertTo-Json -Compress
    
    try {
        # Post simulation to public Mainnet RPC
        $resp = Invoke-RestMethod -Uri https://mainnet.sorobanrpc.com -Method POST -ContentType 'application/json' -Body $body
        
        if ($resp.error) {
            Write-Host "[-] RPC Error simulating '$wasm': $($resp.error.message)" -ForegroundColor Red
            continue
        }
        
        if ($null -ne $resp.result -and $null -ne $resp.result.minResourceFee) {
            $stroops = [decimal]$resp.result.minResourceFee
            $xlm = $stroops / 10000000
            
            Write-Host "----------------------------------------------------------" -ForegroundColor Gray
            Write-Host " SUCCESS: $wasm" -ForegroundColor Green
            Write-Host "  Stroops: $stroops" -ForegroundColor Green
            Write-Host "  XLM:     $xlm XLM" -ForegroundColor Green
            Write-Host "----------------------------------------------------------" -ForegroundColor Gray
        } else {
            Write-Host "[-] Simulation returned no minResourceFee. Response content:" -ForegroundColor Red
            $resp | ConvertTo-Json | Write-Host -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "[-] Request failed for '$wasm': $_" -ForegroundColor Red
    }
    Write-Host ""
}
