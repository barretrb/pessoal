<#
.SYNOPSIS
Sincroniza as skills do workspace (.agent/skills) e as regras globais (AGENTS.global.md)
para a pasta global do Antigravity (~/.gemini/config).
#>
$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
$SkillsSource = Join-Path $RepoRoot ".agent\skills"
$AgentsSource = Join-Path $PSScriptRoot "AGENTS.global.md"

$GeminiConfigDir = Join-Path $HOME ".gemini\config"
$SkillsDest = Join-Path $GeminiConfigDir "skills"
$AgentsDest = Join-Path $GeminiConfigDir "AGENTS.md"

if (-not (Test-Path $SkillsSource)) {
    throw "Diretório de skills não encontrado: $SkillsSource"
}
if (-not (Test-Path $AgentsSource)) {
    throw "Arquivo de regras globais não encontrado: $AgentsSource"
}

New-Item -ItemType Directory -Force -Path $SkillsDest | Out-Null

# Sincroniza cada skill para ~/.gemini/config/skills/<skill>
Get-ChildItem -Path $SkillsSource -Directory | ForEach-Object {
    $TargetSkillDir = Join-Path $SkillsDest $_.Name
    New-Item -ItemType Directory -Force -Path $TargetSkillDir | Out-Null
    Copy-Item -Path (Join-Path $_.FullName "*") -Destination $TargetSkillDir -Recurse -Force
    Write-Host "Skill sincronizada: $($_.Name) -> $TargetSkillDir"
}

# Sincroniza regras globais
Copy-Item -Path $AgentsSource -Destination $AgentsDest -Force
Write-Host "Regras globais sincronizadas: $AgentsDest"
