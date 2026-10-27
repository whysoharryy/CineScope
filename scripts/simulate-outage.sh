#!/usr/bin/env bash
# ==============================================================================
# Script: simulate-outage.sh
# Description: Simulates a service outage and recovery to demonstrate Nagios alerting
# ==============================================================================
set -euo pipefail

echo -e "\033[1;36m==========================================================\033[0m"
echo -e "\033[1;33m   CineScope :: Live Outage & Alerting Demonstration\033[0m"
echo -e "\033[1;36m==========================================================\033[0m"

echo -e "\n\033[1;31m[Step 1/3] Inducing Outage: Scaling CineScope replicas to 0...\033[0m"
kubectl scale deployment cinescope-frontend -n cinescope --replicas=0

echo -e "\n\033[1;33mPods status:\033[0m"
kubectl get pods -n cinescope

echo -e "\n\033[1;33m----------------------------------------------------------\033[0m"
echo -e "\033[1;33mACTION FOR PRESENTATION:\033[0m"
echo -e "1. Switch to your Nagios Web Dashboard: \033[1;32mhttp://localhost:8000\033[0m"
echo -e "2. Click on 'Services' -> Re-schedule check for CineScope"
echo -e "3. Point out that Nagios detects the failure:"
echo -e "   State transitions: \033[1;32mOK (Green)\033[0m -> \033[1;31mCRITICAL (Red)\033[0m!"
echo -e "\033[1;33m----------------------------------------------------------\033[0m"

read -p $'\nPress ENTER when you are ready to RESTORE the service and demonstrate auto-recovery...'

echo -e "\n\033[1;36m[Step 2/3] Restoring Service: Scaling CineScope back to 3 replicas...\033[0m"
kubectl scale deployment cinescope-frontend -n cinescope --replicas=3

echo -e "\n\033[1;36mWaiting for pods to become ready...\033[0m"
kubectl rollout status deployment/cinescope-frontend -n cinescope --timeout=60s

echo -e "\n\033[1;32m[Step 3/3] Pods restored:\033[0m"
kubectl get pods -n cinescope -o wide

echo -e "\n\033[1;32m----------------------------------------------------------\033[0m"
echo -e "\033[1;32mACTION FOR PRESENTATION:\033[0m"
echo -e "1. In Nagios, re-trigger the service check."
echo -e "2. Point out that Nagios automatically recovers to \033[1;32mOK (Green)\033[0m!"
echo -e "\033[1;32m----------------------------------------------------------\033[0m"
