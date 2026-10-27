#!/usr/bin/env bash
# ==============================================================================
# Script: cleanup.sh
# Description: Safely tears down CineScope Kubernetes resources, containers, and kind cluster
# ==============================================================================
set -euo pipefail

CLUSTER_NAME="${1:-cinescope-cluster}"
DELETE_CLUSTER="${2:-false}"

echo -e "\033[1;36m==========================================================\033[0m"
echo -e "\033[1;33m   CineScope :: Resource Teardown and Cleanup\033[0m"
echo -e "\033[1;36m==========================================================\033[0m"

echo -e "\n\033[1;36m[1/4] Stopping Docker Compose services (if running)...\033[0m"
docker compose down --remove-orphans 2>/dev/null || true

echo -e "\n\033[1;36m[2/4] Deleting Kubernetes resources from k8s/...\033[0m"
kubectl delete -k k8s/ --ignore-not-found=true || true

echo -e "\n\033[1;36m[3/4] Ensuring namespace 'cinescope' is purged...\033[0m"
kubectl delete namespace cinescope --ignore-not-found=true || true

if [ "${DELETE_CLUSTER}" = "true" ]; then
    echo -e "\n\033[1;36m[4/4] Deleting kind cluster '${CLUSTER_NAME}'...\033[0m"
    kind delete cluster --name "${CLUSTER_NAME}" || true
else
    echo -e "\n\033[1;33m[4/4] Kind cluster '${CLUSTER_NAME}' retained. (Pass 'true' as second arg to delete cluster)\033[0m"
fi

echo -e "\n\033[1;32m[SUCCESS] CineScope resources cleaned up successfully!\033[0m"
