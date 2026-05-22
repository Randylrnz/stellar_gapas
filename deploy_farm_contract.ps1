# deploy_farm_contract.ps1
# G.A.P.A.S. - Automated Soroban Contract WASM Builder & Testnet Deployer

param (
    [string]$SourceAccount = "gapas",
    [string]$Network = "testnet"
)

$ErrorActionPreference = "Stop"

# Ensure user's cargo/bin folder is explicitly in PATH for execution
$cargoPath = "$env:USERPROFILE\.cargo\bin"
if ($env:PATH -notlike "*$cargoPath*") {
    $env:PATH = "$cargoPath;$env:PATH"
}


# Define colors
$cyan = "Cyan"
$green = "Green"
$yellow = "Yellow"
$red = "Red"
$gray = "Gray"

Write-Host "==========================================================" -ForegroundColor $cyan
Write-Host "   G.A.P.A.S. - Soroban Contract WASM Builder & Deployer   " -ForegroundColor $cyan
Write-Host "==========================================================" -ForegroundColor $cyan
Write-Host ""

# 1. Dependency Checks
Write-Host "[*] Step 1: Checking system dependencies..." -ForegroundColor $yellow

if (!(Get-Command cargo -ErrorAction SilentlyContinue)) {
    Write-Host "[-] Cargo/Rust is not installed or not in your PATH." -ForegroundColor $red
    Write-Host "    Please install Rustup and Cargo from https://rustup.rs/ before continuing." -ForegroundColor $yellow
    exit 1
}

$cliName = "stellar"
if (!(Get-Command stellar -ErrorAction SilentlyContinue)) {
    if (Get-Command soroban -ErrorAction SilentlyContinue) {
        $cliName = "soroban"
        Write-Host "[+] Found legacy 'soroban' CLI. Proceeding with it..." -ForegroundColor $gray
    } else {
        Write-Host "[-] Stellar CLI ('stellar') is not installed or not in your PATH." -ForegroundColor $red
        Write-Host "    Please install the Stellar CLI: cargo install --locked stellar-cli --features opt" -ForegroundColor $yellow
        exit 1
    }
} else {
    Write-Host "[+] Stellar CLI ('stellar') is fully ready." -ForegroundColor $green
}

# 2. Rust WASM Toolchain Setup
Write-Host ""
Write-Host "[*] Step 2: Preparing Rust target toolchain..." -ForegroundColor $yellow
try {
    Write-Host "    Ensuring wasm32v1-none (or wasm32-unknown-unknown) is installed..." -ForegroundColor $gray
    rustup target add wasm32v1-none 2>$null
} catch {
    Write-Host "    wasm32v1-none target add failed. Falling back to wasm32-unknown-unknown..." -ForegroundColor $gray
    try {
        rustup target add wasm32-unknown-unknown
    } catch {
        Write-Host "[-] Failed to add WASM target. Make sure rustup is working." -ForegroundColor $red
        exit 1
    }
}
Write-Host "[+] Target toolchains verified." -ForegroundColor $green

# 3. Contract Compilation
Write-Host ""
Write-Host "[*] Step 3: Compiling G.A.P.A.S. Contracts in Workspace..." -ForegroundColor $yellow

$buildSuccess = $false
# Option A: Try 'stellar contract build' first (highly optimized)
if ($cliName -eq "stellar") {
    try {
        Write-Host "    Running: stellar contract build" -ForegroundColor $cyan
        stellar contract build
        $buildSuccess = $true
    } catch {
        Write-Host "    Stellar contract build failed or not fully configured. Falling back to direct cargo build..." -ForegroundColor $gray
    }
}

# Option B: Fallback to direct Cargo build
if (-not $buildSuccess) {
    try {
        Write-Host "    Running: cargo build --target wasm32v1-none --release" -ForegroundColor $cyan
        cargo build --target wasm32v1-none --release
        $buildSuccess = $true
    } catch {
        Write-Host "    wasm32v1-none target compilation failed. Trying standard wasm32-unknown-unknown target..." -ForegroundColor $gray
        try {
            cargo build --target wasm32-unknown-unknown --release
            $buildSuccess = $true
        } catch {
            Write-Host "[-] Cargo compilation failed. Please check your rustc/cargo setup." -ForegroundColor $red
            exit 1
        }
    }
}

# 4. Locate Compiled WASM files dynamically
$wasmPaths = @{
    "gapas" = $null;
    "gapas_farm" = $null;
}
$targets = @("wasm32v1-none", "wasm32-unknown-unknown")

foreach ($name in $wasmPaths.Keys.Clone()) {
    foreach ($target in $targets) {
        $p1 = "target/$target/release/$name.wasm"
        $p2 = "target/$target/release/$name.optimized.wasm"
        if (Test-Path $p1) {
            $wasmPaths[$name] = $p1
            break
        } elseif (Test-Path $p2) {
            $wasmPaths[$name] = $p2
            break
        }
    }
}

$gapasWasm = $wasmPaths["gapas"]
$gapasFarmWasm = $wasmPaths["gapas_farm"]

if ($null -eq $gapasWasm -or $null -eq $gapasFarmWasm) {
    Write-Host "[-] Could not locate compiled WASM files for both 'gapas' and 'gapas_farm'." -ForegroundColor $red
    exit 1
}

Write-Host "[+] Successfully compiled G.A.P.A.S. contracts!" -ForegroundColor $green
Write-Host "    Gapas KYC Registry: $gapasWasm ($('{0:N2}' -f ((Get-Item $gapasWasm).Length / 1KB)) KB)" -ForegroundColor $gray
Write-Host "    Gapas Farm Escrow:  $gapasFarmWasm ($('{0:N2}' -f ((Get-Item $gapasFarmWasm).Length / 1KB)) KB)" -ForegroundColor $gray

# 5. Helper function to execute and parse deployment output
function Execute-Deployment {
    param(
        [string]$wasm,
        [string]$source,
        [string]$net
    )
    
    $stdoutLines = @()
    $stderrLines = @()
    
    # Run the deployment command using .NET ProcessStartInfo to cleanly separate streams
    $pinfo = New-Object System.Diagnostics.ProcessStartInfo
    $pinfo.FileName = $cliName
    $pinfo.Arguments = "contract deploy --wasm ""$wasm"" --source ""$source"" --network ""$net"" --inclusion-fee 1000000"
    $pinfo.RedirectStandardOutput = $true
    $pinfo.RedirectStandardError = $true
    $pinfo.UseShellExecute = $false
    $pinfo.CreateNoWindow = $true
    
    $proc = New-Object System.Diagnostics.Process
    $proc.StartInfo = $pinfo
    
    $proc.Start() | Out-Null
    
    $outTask = $proc.StandardOutput.ReadToEndAsync()
    $errTask = $proc.StandardError.ReadToEndAsync()
    
    $proc.WaitForExit()
    
    $outString = $outTask.Result
    $errString = $errTask.Result
    
    # Parse output lines
    $outLines = $outString -split "`r?`n"
    $errLines = $errString -split "`r?`n"
    
    # Print progress output
    foreach ($line in $errLines) {
        $trimmed = $line.Trim()
        if ($trimmed -ne "") {
            Write-Host "    $trimmed" -ForegroundColor $gray
        }
    }
    
    # Search standard output for contract address
    $foundContractId = $null
    foreach ($line in $outLines) {
        $trimmed = $line.Trim()
        if ($trimmed -match "C[A-Z0-9]{55}") {
            $foundContractId = [regex]::Match($trimmed, "C[A-Z0-9]{55}").Value
        }
    }
    
    return [PSCustomObject]@{
        Success = ($null -ne $foundContractId)
        ContractId = $foundContractId
        FullError = $errString + "`n" + $outString
    }
}

# 6. Contract Deployment
Write-Host ""
Write-Host "[*] Step 4: Deploying G.A.P.A.S. contracts to Stellar Testnet..." -ForegroundColor $yellow
Write-Host "    Source Account: $SourceAccount" -ForegroundColor $gray
Write-Host "    Network:        $Network" -ForegroundColor $gray
Write-Host "    Please wait... deploying contracts to the blockchain..." -ForegroundColor $gray

# 1. Deploy Global KYC Registry Contract
Write-Host ""
Write-Host "[*] Deploying Farmer KYC Registry contract..." -ForegroundColor $cyan
$registryResult = Execute-Deployment -wasm $gapasWasm -source $SourceAccount -net $Network

if (-not $registryResult.Success) {
    $errText = $registryResult.FullError
    # Trigger auto key generation if identity not found
    if ($errText -match "identity" -or $errText -match "key" -or $errText -match "source" -or $errText -match "no keys" -or $errText -match "Failed to find config") {
        Write-Host "[!] Source account '$SourceAccount' not found. Generating and funding it now..." -ForegroundColor $yellow
        
        if ($cliName -eq "stellar") {
            stellar keys generate $SourceAccount --network testnet --fund
        } else {
            soroban config identity generate $SourceAccount
            $addr = (soroban config identity address $SourceAccount)
            Write-Host "    Funding address $addr via friendbot..." -ForegroundColor $gray
            Invoke-RestMethod -Uri "https://friendbot.stellar.org/?addr=$addr" -Method Get >$null
        }
        Write-Host "[+] Successfully configured and funded account: $SourceAccount" -ForegroundColor $green
        
        # Retry
        Write-Host "    Retrying Farmer KYC Registry deployment..." -ForegroundColor $cyan
        $registryResult = Execute-Deployment -wasm $gapasWasm -source $SourceAccount -net $Network
    }
}

if (-not $registryResult.Success) {
    Write-Host "[-] Farmer KYC Registry deployment failed." -ForegroundColor $red
    Write-Host "    Error details: $($registryResult.FullError)" -ForegroundColor $red
    exit 1
}

$registryContractId = $registryResult.ContractId
Write-Host "[+] Farmer KYC Registry Deployed: $registryContractId" -ForegroundColor $green

# 2. Deploy Farm escrow contract
Write-Host ""
Write-Host "[*] Deploying Farm Escrow contract..." -ForegroundColor $cyan
$farmResult = Execute-Deployment -wasm $gapasFarmWasm -source $SourceAccount -net $Network

if (-not $farmResult.Success) {
    Write-Host "[-] Farm Escrow deployment failed." -ForegroundColor $red
    Write-Host "    Error details: $($farmResult.FullError)" -ForegroundColor $red
    exit 1
}

$farmContractId = $farmResult.ContractId
Write-Host "[+] Farm Escrow Deployed: $farmContractId" -ForegroundColor $green

# 7. Auto-Update .env
Write-Host ""
Write-Host "[*] Step 5: Integrating newly deployed contracts into the codebase..." -ForegroundColor $yellow

$envPath = Join-Path (Get-Location) ".env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    
    # Update Farm Address
    $pattern1 = '(?m)^NEXT_PUBLIC_CONTRACT_ADDRESS=.*$'
    $newLine1 = "NEXT_PUBLIC_CONTRACT_ADDRESS=""$farmContractId"""
    if ($envContent -match $pattern1) {
        $envContent = $envContent -replace $pattern1, $newLine1
    } else {
        $envContent += "`n$newLine1"
    }
    
    # Update KYC Registry Address
    $pattern2 = '(?m)^NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS=.*$'
    $newLine2 = "NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS=""$registryContractId"""
    if ($envContent -match $pattern2) {
        $envContent = $envContent -replace $pattern2, $newLine2
    } else {
        $envContent += "`n$newLine2"
    }
    
    Write-Host "[+] Updated .env configuration with both Contract IDs!" -ForegroundColor $green
    Set-Content -Path $envPath -Value $envContent -NoNewline
} else {
    Write-Host "[!] Warning: Could not find .env file. Creating a new one..." -ForegroundColor $yellow
    $newEnv = "NEXT_PUBLIC_STELLAR_NETWORK=""testnet""`nNEXT_PUBLIC_CONTRACT_ADDRESS=""$farmContractId""`nNEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS=""$registryContractId""`n"
    Set-Content -Path $envPath -Value $newEnv
    Write-Host "[+] Created new .env with the deployed Contract IDs." -ForegroundColor $green
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor $green
Write-Host "   INTEGRATION COMPLETE & READY TO USE!                   " -ForegroundColor $green
Write-Host "==========================================================" -ForegroundColor $green
Write-Host " Your Next.js app is now linked to BOTH real WASM contracts" -ForegroundColor $gray
Write-Host "  Registry Address: $registryContractId" -ForegroundColor $cyan
Write-Host "  Farm Address:     $farmContractId" -ForegroundColor $cyan
Write-Host " Restart your Next.js development server (npm run dev) to" -ForegroundColor $gray
Write-Host " apply the changes!" -ForegroundColor $gray
Write-Host "==========================================================" -ForegroundColor $green
Write-Host ""
