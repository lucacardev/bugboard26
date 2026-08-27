# scripts/sonar-scan.ps1
# Esegue lo scan SonarQube del backend leggendo la configurazione da .env

$ErrorActionPreference = "Stop"

$envFile = Join-Path $PSScriptRoot "..\.env"
if (-not (Test-Path $envFile)) {
    Write-Error "File .env non trovato in $envFile"
    exit 1
}

Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]*)=(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        [System.Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

if (-not $env:SONAR_TOKEN) {
    Write-Error "SONAR_TOKEN non impostata in .env"
    exit 1
}

$backendDir = Join-Path $PSScriptRoot ".."

docker run --rm --network sonar-net `
    -e SONAR_HOST_URL="$env:SONAR_HOST_URL" `
    -e SONAR_TOKEN="$env:SONAR_TOKEN" `
    -v "${backendDir}:/usr/src" `
    sonarsource/sonar-scanner-cli `
    "-Dsonar.projectKey=$env:SONAR_PROJECT_KEY" `
    "-Dsonar.sources=src" `
    "-Dsonar.exclusions=**/__tests__/**,**/*.test.ts" `
    "-Dsonar.javascript.lcov.reportPaths=coverage/lcov.info"