# ==============================================================================
# Script: deploy-k8s.ps1
# Description: Loads Docker image into kind and applies Kubernetes manifests
# ==============================================================================

param (
    [string]$ClusterName = "cinescope-cluster",
    [string]$ImageName = "cinescope-frontend:1.0"
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   CineScope :: Kubernetes Deployment Automation" -ForegroundColor Yellow
Write-Host "   Cluster: $ClusterName | Image: $ImageName" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# Check if kind is available
$kindCmd = Get-Command kind -ErrorAction SilentlyContinue
if ($kindCmd) {
    Write-Host "`n[Step 1/3] Checking kind cluster '$ClusterName'..." -ForegroundColor Cyan
    $clusters = kind get clusters 2>$null
    if ($clusters -notcontains $ClusterName) {
        Write-Host "Creating kind cluster '$ClusterName'..." -ForegroundColor Yellow
        kind create cluster --name $ClusterName
    } else {
        Write-Host "Kind cluster '$ClusterName' is active." -ForegroundColor Green
    }

    Write-Host "`n[Step 2/3] Loading Docker image '$ImageName' into kind..." -ForegroundColor Cyan
    kind load docker-image $ImageName --name $ClusterName
} else {
    Write-Host "`n[NOTICE] 'kind' not detected in PATH. Proceeding with active kubectl context..." -ForegroundColor Yellow
    kubectl config current-context
}

Write-Host "`n[Step 3/3] Applying Kubernetes manifests from k8s/..." -ForegroundColor Cyan
kubectl apply -k k8s/

Write-Host "`nWaiting for deployment rollout..." -ForegroundColor Cyan
kubectl rollout status deployment/cinescope-frontend -n cinescope --timeout=120s

Write-Host "`n[SUCCESS] CineScope deployed successfully!" -ForegroundColor Green
Write-Host "`nActive Pods:" -ForegroundColor Cyan
kubectl get pods -n cinescope -o wide

Write-Host "`nActive Services:" -ForegroundColor Cyan
kubectl get svc -n cinescope

Write-Host "`n----------------------------------------------------------" -ForegroundColor Yellow
Write-Host "To access CineScope in your browser, run:" -ForegroundColor Yellow
Write-Host "  kubectl port-forward -n cinescope svc/cinescope-service 8080:80" -ForegroundColor White
Write-Host "Then navigate to: http://localhost:8080" -ForegroundColor Green
Write-Host "----------------------------------------------------------" -ForegroundColor Yellow
