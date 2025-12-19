#!/usr/bin/env pwsh
# Script to add Neon database URLs to Vercel

Write-Host "=== Quantum Suites - Add Neon Database to Vercel ===" -ForegroundColor Cyan
Write-Host ""

# Prompt for database URL
Write-Host "Please enter your Neon DATABASE_URL:" -ForegroundColor Yellow
Write-Host "(Should look like: postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require)" -ForegroundColor Gray
$DATABASE_URL = Read-Host

if ([string]::IsNullOrWhiteSpace($DATABASE_URL)) {
    Write-Host "Error: DATABASE_URL cannot be empty" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Adding DATABASE_URL to Vercel (production)..." -ForegroundColor Yellow
Write-Output $DATABASE_URL | vercel env add DATABASE_URL production

Write-Host ""
Write-Host "Adding DIRECT_DATABASE_URL to Vercel (production)..." -ForegroundColor Yellow
Write-Output $DATABASE_URL | vercel env add DIRECT_DATABASE_URL production

Write-Host ""
Write-Host "✅ Database URLs added successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update your local .env.local file with the same URLs"
Write-Host "2. Run: npx prisma migrate deploy"
Write-Host "3. Redeploy on Vercel or push a new commit"
Write-Host ""
