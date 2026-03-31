$ErrorActionPreference = 'Stop'

Write-Host 'Stopping Food Ordering platform...'

$repoRoot = Split-Path -Parent $PSScriptRoot
$backendPath = Join-Path $repoRoot 'backend'

$nodeProcesses = Get-CimInstance Win32_Process | Where-Object {
  $_.Name -eq 'node.exe' -and $_.CommandLine -match 'services\\|vite'
}

foreach ($p in $nodeProcesses) {
  Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
}

Push-Location $backendPath
try {
  docker compose down
} finally {
  Pop-Location
}

Write-Host 'Done. Service node processes were stopped and Docker infrastructure is down.'
