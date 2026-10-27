#!/usr/bin/env bash
# ==============================================================================
# Script: deploy-k8s.sh
# Description: Loads Docker image into kind and applies Kubernetes manifests (Linux/macOS)
# ==============================================================================
set -euo pipefail

CLUSTER_NAME="${1:-cinescope-cluster}"
IMAGE_NAME="${2:-cinescope-frontend:1.0}"

echo -e "\033[1;36m==========================================================\033[0m"
echo -e "\033[1;33m   CineScope :: Kubernetes Deployment Automation\033[0m"
echo -e "\033[1;33m   Cluster: ${CLUSTER_NAME} | Image: ${IMAGE_NAME}\033[0m"
echo -e "\033[1;36m==========================================================\033[0m"

if command -v kind >/dev/null 2>&1; then
    echo -e "\n\033[1;36m[Step 1/3] Checking kind cluster '${CLUSTER_NAME}'...\033[0m"
    if ! kind get clusters 2>/dev/null | grep -q "^${CLUSTER_NAME}$"; then
        echo -e "\033[1;33mCreating kind cluster '${CLUSTER_NAME}'...\033[0m"
        kind create cluster --name "${CLUSTER_NAME}"
    else
        echo -e "\033[1;32mKind cluster '${CLUSTER_NAME}' is active.\033[0m"
    fi

    echo -e "\n\033[1;36m[Step 2/3] Loading Docker image '${IMAGE_NAME}' into kind...\033[0m"
    kind load docker-image "${IMAGE_NAME}" --name "${CLUSTER_NAME}"
else
    echo -e "\n\033[1;33m[NOTICE] 'kind' not found in PATH. Applying directly to active kubectl context...\033[0m"
fi

echo -e "\n\033[1;36m[Step 3/3] Applying Kubernetes manifests from k8s/...\033[0m"
kubectl apply -k k8s/

echo -e "\n\033[1;36mWaiting for deployment rollout...\033[0m"
kubectl rollout status deployment/cinescope-frontend -n cinescope --timeout=120s

echo -e "\n\033[1;32m[SUCCESS] CineScope deployed successfully!\033[0m"
echo -e "\n\033[1;36mActive Pods:\033[0m"
kubectl get pods -n cinescope -o wide

echo -e "\n\033[1;36mActive Services:\033[0m"
kubectl get svc -n cinescope

echo -e "\n\033[1;33m----------------------------------------------------------\033[0m"
echo -e "\033[1;33mTo access CineScope in your browser, run:\033[0m"
echo -e "  \033[1;37mkubectl port-forward -n cinescope svc/cinescope-service 8080:80\033[0m"
echo -e "Then navigate to: \033[1;32mhttp://localhost:8080\033[0m"
echo -e "\033[1;33m----------------------------------------------------------\033[0m"
