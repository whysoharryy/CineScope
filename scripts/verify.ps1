# ==============================================================================
# Script: verify.ps1
# Description: Verifies CineScope health, pod states, service, and NGINX probes
# ==============================================================================

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   CineScope :: Deployment Verification Suite" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

Write-Host "`n[1/5] Checking Kubernetes Namespace 'cinescope':" -ForegroundColor Cyan
kubectl get namespace cinescope

Write-Host "`n[2/5] Checking Deployment Status & Replicas:" -ForegroundColor Cyan
kubectl get deployment cinescope-frontend -n cinescope

Write-Host "`n[3/5] Checking Pod Statuses & Node Allocations:" -ForegroundColor Cyan
kubectl get pods -n cinescope -o wide

Write-Host "`n[4/5] Checking Service Endpoints:" -ForegroundColor Cyan
kubectl get svc -n cinescope
kubectl get endpoints -n cinescope

Write-Host "`n[5/5] Checking Recent Container Logs:" -ForegroundColor Cyan
kubectl logs -n cinescope -l app=cinescope-frontend --tail=20

Write-Host "`n----------------------------------------------------------" -ForegroundColor Green
Write-Host "[VERIFICATION COMPLETE] Check output above for healthy pods." -ForegroundColor Green
Write-Host "----------------------------------------------------------" -ForegroundColor Green
