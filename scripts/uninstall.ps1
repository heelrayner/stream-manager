$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

$Targets = @("node_modules", "dist", "stream_manager.db")

foreach ($path in $Targets) {
  if (Test-Path $path) {
    Write-Host "[Stream Manager] Removing $path"
    Remove-Item -Recurse -Force $path
  } else {
    Write-Host "[Stream Manager] Skipping $path (not found)"
  }
}

Write-Host "[Stream Manager] Uninstall complete. To remove cached npm artifacts, delete package-lock.json manually if desired."
