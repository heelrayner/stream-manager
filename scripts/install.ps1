$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Host "[Stream Manager] Installing dependencies..."
npm install

Write-Host "[Stream Manager] Building client and server bundles..."
npm run build

Write-Host "[Stream Manager] Installation complete. Run 'npm start' to launch the Electron app (API on http://localhost:4000)."
