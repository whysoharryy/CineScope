# ==============================================================================
# Script: build-docker.ps1
# Description: Builds the CineScope Docker container image locally
# ==============================================================================

$IMAGE_NAME = "cinescope-frontend:1.0"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   CineScope :: Building Docker Multi-Stage Image" -ForegroundColor Yellow
Write-Host "   Target Image: $IMAGE_NAME" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

docker build -t $IMAGE_NAME .

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[SUCCESS] Docker image '$IMAGE_NAME' built successfully!" -ForegroundColor Green
    Write-Host "Image details:" -ForegroundColor Cyan
    docker images $IMAGE_NAME
} else {
    Write-Host "`n[ERROR] Docker build failed. Please verify Docker is running." -ForegroundColor Red
    exit 1
}
