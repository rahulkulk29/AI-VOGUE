# Update Groq API Key in .env file safely
param (
    [string]$NewKey = $env:GROQ_API_KEY
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$envPath = Join-Path $scriptDir ".env"

if (-not $NewKey) {
    Write-Host "⚠️ Please provide a key via -NewKey parameter or set \$env:GROQ_API_KEY"
    exit 1
}

if (-not (Test-Path $envPath)) {
    Write-Host "⚠️ .env file not found at $envPath"
    exit 1
}

# Read the current content
$content = Get-Content $envPath -Raw

# Replace the key line
$content = $content -replace 'GROQ_API_KEY=.*', "GROQ_API_KEY=$NewKey"

# Write back to file
Set-Content -Path $envPath -Value $content -NoNewline

Write-Host "✅ Updated GROQ_API_KEY in .env file"
