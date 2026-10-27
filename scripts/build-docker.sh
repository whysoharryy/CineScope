#!/usr/bin/env bash
# ==============================================================================
# Script: build-docker.sh
# Description: Builds the CineScope Docker container image locally (Linux/macOS/WSL)
# ==============================================================================
set -euo pipefail

IMAGE_NAME="cinescope-frontend:1.0"

echo -e "\033[1;36m==========================================================\033[0m"
echo -e "\033[1;33m   CineScope :: Building Docker Multi-Stage Image\033[0m"
echo -e "\033[1;33m   Target Image: ${IMAGE_NAME}\033[0m"
echo -e "\033[1;36m==========================================================\033[0m"

docker build -t "${IMAGE_NAME}" .

echo -e "\n\033[1;32m[SUCCESS] Docker image '${IMAGE_NAME}' built successfully!\033[0m"
docker images "${IMAGE_NAME}"
