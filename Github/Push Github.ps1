# Script para fazer push com token seguro
param(
    [string]$Message = "Update"
)

# Configurar token (substitua pelo seu token real)
$env:GITHUB_TOKEN="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"

# Adicionar, commitar e fazer push
git add .
git commit -m $Message
git push origin main

Write-Host "Push realizado com sucesso!" -ForegroundColor Green 