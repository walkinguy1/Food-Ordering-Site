$ErrorActionPreference = 'Stop'

Write-Host 'Starting Food Ordering platform...'

$repoRoot = Split-Path -Parent $PSScriptRoot
$backendPath = Join-Path $repoRoot 'backend'
$frontendPath = Join-Path $repoRoot 'frontend'

function Resolve-DockerCommand {
  $dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
  if ($dockerCmd) {
    return 'docker'
  }

  $knownDockerPath = 'C:\Program Files\Docker\Docker\resources\bin\docker.exe'
  if (Test-Path $knownDockerPath) {
    $dockerDir = Split-Path -Parent $knownDockerPath
    if ($env:Path -notlike "*$dockerDir*") {
      $env:Path = "$dockerDir;$env:Path"
    }
    return $knownDockerPath
  }

  return $null
}

$dockerExecutable = Resolve-DockerCommand

function Test-PortOpen {
  param(
    [string]$ComputerName,
    [int]$Port
  )

  try {
    $result = Test-NetConnection -ComputerName $ComputerName -Port $Port -WarningAction SilentlyContinue
    return [bool]$result.TcpTestSucceeded
  } catch {
    return $false
  }
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  throw 'npm is not installed or not available in PATH.'
}

if ($dockerExecutable) {
  Push-Location $backendPath
  try {
    & $dockerExecutable compose up -d
    Write-Host 'Docker infrastructure started.'
  } finally {
    Pop-Location
  }
} else {
  Write-Warning 'Docker is not available in PATH and Docker Desktop was not found in the default install location.'
  Write-Warning 'Continuing startup without docker compose. Ensure MongoDB, Redis, RabbitMQ, and PostgreSQL are already running.'
}

$requiredInfra = @(
  @{ Name = 'MongoDB'; Host = 'localhost'; Port = 27017 },
  @{ Name = 'Redis'; Host = 'localhost'; Port = 6379 },
  @{ Name = 'RabbitMQ'; Host = 'localhost'; Port = 5672 },
  @{ Name = 'PostgreSQL'; Host = 'localhost'; Port = 5432 }
)

$downInfra = @()
foreach ($infra in $requiredInfra) {
  if (-not (Test-PortOpen -ComputerName $infra.Host -Port $infra.Port)) {
    $downInfra += $infra
  }
}

if ($downInfra.Count -gt 0) {
  Write-Error 'Required infrastructure is not reachable. Start Docker Desktop and run backend/docker compose, or run these services locally first.'
  foreach ($infra in $downInfra) {
    Write-Host ("- {0} not reachable at {1}:{2}" -f $infra.Name, $infra.Host, $infra.Port)
  }
  exit 1
}

$services = @(
  'start:auth',
  'start:inventory',
  'start:order',
  'start:logistics',
  'start:payment',
  'start:notification',
  'start:analytics',
  'start:recommendations',
  'start:gateway'
)

foreach ($service in $services) {
  Start-Process powershell -ArgumentList '-NoExit', '-Command', "cd '$backendPath'; npm run $service"
}

Start-Process powershell -ArgumentList '-NoExit', '-Command', "cd '$frontendPath'; npm run dev"

Write-Host 'Done. Backend services and frontend were launched in separate terminals.'
Write-Host 'Frontend: http://localhost:5173'
Write-Host 'Gateway: http://localhost:4000/health'
Write-Host 'Service health: http://localhost:4000/health/services'
Write-Host 'RabbitMQ UI: http://localhost:15672'
