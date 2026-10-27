#!/usr/bin/env bash
# ==============================================================================
# Script: verify.sh
# Description: Verifies CineScope health, pod states, service, and NGINX probes (Linux/macOS)
# ==============================================================================
set -euo pipefail

echo -e "\033[1;36m==========================================================\033[0m"
echo -e "\033[1;33m   CineScope :: Deployment Verification Suite\033[0m"
echo -e "\033[1;36m==========================================================\033[0m"

echo -e "\n\033[1;36m[1/5] Checking Kubernetes Namespace 'cinescope':\033[0m"
kubectl get namespace cinescope

echo -e "\n\033[1;36m[2/5] Checking Deployment Status & Replicas:\033[0m"
kubectl get deployment cinescope-frontend -n cinescope

echo -e "\n\033[1;36m[3/5] Checking Pod Statuses & Node Allocations:\033[0m"
kubectl get pods -n cinescope -o wide

echo -e "\n\033[1;36m[4/5] Checking Service Endpoints:\033[0m"
kubectl get svc -n cinescope
kubectl get endpoints -n cinescope

echo -e "\n\033[1;36m[5/5] Checking Recent Container Logs:\033[0m"
kubectl logs -n cinescope -l app=cinescope-frontend --tail=20

echo -e "\n\033[1;32m----------------------------------------------------------\033[0m"
echo -e "\033[1;32m[VERIFICATION COMPLETE] Check output above for healthy pods.\033[0m"
echo -e "\033[1;32m----------------------------------------------------------\033[0m"
