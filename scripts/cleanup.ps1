# ==============================================================================
# Script: cleanup.ps1
# Description: Safely tears down CineScope Kubernetes resources, containers, and kind cluster
# ==============================================================================

param (
    [string]$ClusterName = "cinescope-cluster",
    [switch]$DeleteCluster = $false
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   CineScope :: Resource Teardown and Cleanup" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

Write-Host "`n[1/4] Stopping Docker Compose services (if running)..." -ForegroundColor Cyan
docker compose down --remove-orphans 2>$null

Write-Host "`n[2/4] Deleting Kubernetes resources from k8s/..." -ForegroundColor Cyan
kubectl delete -k k8s/ --ignore-not-found=true

Write-Host "`n[3/4] Ensuring namespace 'cinescope' is purged..." -ForegroundColor Cyan
kubectl delete namespace cinescope --ignore-not-found=true

if ($DeleteCluster) {
    Write-Host "`n[4/4] Deleting kind cluster '$ClusterName'..." -ForegroundColor Cyan
    kind delete cluster --name $ClusterName
} else {
    Write-Host "`n[4/4] Kind cluster '$ClusterName' retained. (Run with -DeleteCluster to delete kind cluster)" -ForegroundColor Yellow
}

Write-Host "`n[SUCCESS] CineScope resources cleaned up successfully!" -ForegroundColor Green
