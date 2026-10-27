# ==============================================================================
# Script: simulate-outage.ps1
# Description: Simulates a service outage and recovery to demonstrate Nagios alerting
# ==============================================================================

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   CineScope :: Live Outage & Alerting Demonstration" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

Write-Host "`n[Step 1/3] Inducing Outage: Scaling CineScope replicas to 0..." -ForegroundColor Red
kubectl scale deployment cinescope-frontend -n cinescope --replicas=0

Write-Host "`nPods status:" -ForegroundColor Yellow
kubectl get pods -n cinescope

Write-Host "`n----------------------------------------------------------" -ForegroundColor Yellow
Write-Host "ACTION FOR PRESENTATION:" -ForegroundColor Yellow
Write-Host "1. Switch to your Nagios Web Dashboard: http://localhost:8000" -ForegroundColor White
Write-Host "2. Click on 'Services' -> Re-schedule check for CineScope" -ForegroundColor White
Write-Host "3. Point out that Nagios detects the failure:" -ForegroundColor White
Write-Host "   State transitions: OK (Green) -> CRITICAL (Red)!" -ForegroundColor Red
Write-Host "----------------------------------------------------------" -ForegroundColor Yellow

$response = Read-Host "`nPress ENTER when you are ready to RESTORE the service and demonstrate auto-recovery..."

Write-Host "`n[Step 2/3] Restoring Service: Scaling CineScope back to 3 replicas..." -ForegroundColor Cyan
kubectl scale deployment cinescope-frontend -n cinescope --replicas=3

Write-Host "`nWaiting for pods to become ready..." -ForegroundColor Cyan
kubectl rollout status deployment/cinescope-frontend -n cinescope --timeout=60s

Write-Host "`n[Step 3/3] Pods restored:" -ForegroundColor Green
kubectl get pods -n cinescope -o wide

Write-Host "`n----------------------------------------------------------" -ForegroundColor Green
Write-Host "ACTION FOR PRESENTATION:" -ForegroundColor Green
Write-Host "1. In Nagios, re-trigger the service check." -ForegroundColor White
Write-Host "2. Point out that Nagios automatically recovers to OK (Green)!" -ForegroundColor Green
Write-Host "----------------------------------------------------------" -ForegroundColor Green
