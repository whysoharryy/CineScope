#!/usr/bin/env bash
# ==============================================================================
# Script: start-monitoring.sh
# Description: Starts the Nagios Centralized Monitoring Server for CineScope (Linux/macOS)
# ==============================================================================
set -euo pipefail

echo -e "\033[1;36m==========================================================\033[0m"
echo -e "\033[1;33m   CineScope :: Starting Centralized Nagios Monitoring\033[0m"
echo -e "\033[1;36m==========================================================\033[0m"

docker compose -f docker-compose.monitoring.yml up -d

echo -e "\n\033[1;32m[SUCCESS] Nagios Core server is running!\033[0m"
echo -e "\n\033[1;36mAccess Details:\033[0m"
echo -e "  URL:         \033[1;32mhttp://localhost:8000\033[0m"
echo -e "  Username:    \033[1;37mnagiosadmin\033[0m"
echo -e "  Password:    \033[1;37mnagiosadmin\033[0m"
echo -e "\n\033[1;36mActive Service Checks:\033[0m"
echo -e "  1. CineScope TCP Port 8080"
echo -e "  2. CineScope Web HTTP 200 OK"
echo -e "  3. CineScope Healthz Probe (/healthz)"
echo -e "  4. Linux Node (NRPE): CPU Load, Disk, Processes, SSH Port 22"
echo -e "  5. Windows Node (NCPA): CPU, RAM, C: Drive, RDP Port 3389"
