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

# Monta l'intera root del monorepo (non solo backend/), altrimenti la
# cartella .git resta fuori dal volume e il sensore SCM di Sonar non riesce
# a risalire la gerarchia per trovarla (warning "SCM provider autodetection
# failed", New Code calcolato su una finestra a data fissa invece che sulle
# righe realmente modificate secondo git blame).
$repoRoot = Join-Path $PSScriptRoot "..\.."

docker run --rm --network sonar-net `
    -e SONAR_HOST_URL="$env:SONAR_HOST_URL" `
    -e SONAR_TOKEN="$env:SONAR_TOKEN" `
    -v "${repoRoot}:/usr/src" `
    sonarsource/sonar-scanner-cli `
    "-Dsonar.projectKey=$env:SONAR_PROJECT_KEY" `
    "-Dsonar.projectBaseDir=/usr/src/backend" `
    "-Dsonar.sources=src" `
    "-Dsonar.exclusions=**/__tests__/**,**/*.test.ts" `
    "-Dsonar.javascript.lcov.reportPaths=coverage/lcov.info"