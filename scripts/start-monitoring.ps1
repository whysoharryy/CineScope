# ==============================================================================
# Script: start-monitoring.ps1
# Description: Starts the Nagios Centralized Monitoring Server for CineScope
# ==============================================================================

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   CineScope :: Starting Centralized Nagios Monitoring" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

docker compose -f docker-compose.monitoring.yml up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[SUCCESS] Nagios Core server is running!" -ForegroundColor Green
    Write-Host "`nAccess Details:" -ForegroundColor Cyan
    Write-Host "  URL:         http://localhost:8000" -ForegroundColor White
    Write-Host "  Username:    nagiosadmin" -ForegroundColor White
    Write-Host "  Password:    nagiosadmin" -ForegroundColor White
    Write-Host "`nActive Service Checks:" -ForegroundColor Cyan
    Write-Host "  1. CineScope TCP Port 8080" -ForegroundColor White
    Write-Host "  2. CineScope Web HTTP 200 OK" -ForegroundColor White
    Write-Host "  3. CineScope Healthz Probe (/healthz)" -ForegroundColor White
    Write-Host "  4. Linux Node (NRPE): CPU Load, Disk, Processes, SSH Port 22" -ForegroundColor White
    Write-Host "  5. Windows Node (NCPA): CPU, RAM, C: Drive, RDP Port 3389" -ForegroundColor White
} else {
    Write-Host "`n[ERROR] Failed to start Nagios monitoring server. Please ensure Docker is running." -ForegroundColor Red
}
