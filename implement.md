# 📋 CineScope :: Kubernetes + Nagios Monitoring Implementation Guide (WSL Ubuntu)

> **Scenario:** Monitoring a Kubernetes Cluster with Nagios  
> **Environment:** WSL2 (Ubuntu) + Docker Engine + Kind (Kubernetes in Docker)  
> **Target Workload:** CineScope Cinematic Movie Discovery Web App (3 Replicas)  
> **Monitoring Stack:** Nagios Core + NRPE Node Agent + Custom `kubectl get pods` Health Plugin  

---

## 📌 Table of Contents
1. [Task Requirements vs. Project Progress Matrix](#1-task-requirements-vs-project-progress-matrix)
2. [Architecture in WSL2 (Ubuntu)](#2-architecture-in-wsl2-ubuntu)
3. [Step 1: WSL Ubuntu Prerequisites & Tooling](#step-1-wsl-ubuntu-prerequisites--tooling)
4. [Step 2: Kind Cluster Configuration with NodePort Mapping](#step-2-kind-cluster-configuration-with-nodeport-mapping)
5. [Step 3: Docker Build & Deploy CineScope (3 Replicas + NodePort)](#step-3-docker-build--deploy-cinescope-3-replicas--nodeport)
6. [Step 4: Install & Configure NRPE Agent on Cluster Node (CPU, RAM, Disk)](#step-4-install--configure-nrpe-agent-on-cluster-node-cpu-ram-disk)
7. [Step 5: Create Custom Nagios Pod Health Plugin (`check_k8s_pods.sh`)](#step-5-create-custom-nagios-pod-health-plugin-check_k8s_podssh)
8. [Step 6: Configure Nagios Monitoring for K8s Workload & Node](#step-6-configure-nagios-monitoring-for-k8s-workload--node)
9. [Step 7: Launch Centralized Nagios Monitoring (In-Cluster & Docker Compose)](#step-7-launch-centralized-nagios-monitoring-in-cluster--docker-compose)
10. [Step 8: Live Evaluator Demo Flow (Scale, Pod Delete, Alert Dip & Auto-Recovery)](#step-8-live-evaluator-demo-flow-scale-pod-delete-alert-dip--auto-recovery)
11. [Immediate File Generation Checklist](#11-immediate-file-generation-checklist)

---

## 1. Task Requirements vs. Project Progress Matrix

| # | Task Requirement | Current Repository Status | Gap & Action Required in WSL Ubuntu | Status |
|---|------------------|---------------------------|-------------------------------------|--------|
| **1** | **Create cluster with Minikube or kind, deploy app (3 replicas) & scale with `kubectl scale`** | ✅ Kind cluster automated via `deploy-k8s.sh`. `k8s/deployment.yaml` sets 3 replicas. | Kind cluster needs `kind-config.yaml` to map NodePorts (30080, 30800) to host. | 🟡 85% |
| **2** | **Install NRPE agent on the nodes to monitor CPU, memory, and disk** | ⚠️ Nagios config has `linux-host.cfg`, but points to dummy IP `192.168.1.100`. | **No NRPE agent installed on the Kind node container**. Need bash commands to install NRPE inside `cinescope-cluster-control-plane` and add memory check. | 🔴 35% |
| **3** | **Use `check_http` against NodePort/Service to monitor the app** | ⚠️ `cinescope.cfg` checks port 8080 via manual `kubectl port-forward`. Service is `ClusterIP`. | Change `k8s/service.yaml` to `type: NodePort` (port `30080`) and point Nagios directly to NodePort without port-forwarding. | 🟡 50% |
| **4** | **Add custom check script using `kubectl get pods` to report pods not Running** | ❌ No custom plugin exists. Nagios only monitors HTTP/TCP endpoints. | Write `nagios/plugins/check_k8s_pods.sh` to parse pod status and trigger `CRITICAL` / `WARNING` if pods are terminating or unready. | 🔴 0% |
| **5** | **Optional: Run Nagios itself on Kubernetes using a Deployment and Service** | ⚠️ Nagios currently runs via Docker Compose (`docker-compose.monitoring.yml`). | Create native K8s manifests in `k8s/monitoring/` (Deployment, Service, RBAC ServiceAccount, ConfigMap). | 🔴 0% in K8s (100% in Compose) |
| **6** | **Demo: Delete a pod, show K8s recreating it, and show Nagios detecting dip and recovery** | ⚠️ Current outage script scales deployment to 0 replicas (total blackout). | Create `scripts/demo-pod-healing.sh` to delete a single pod, show K8s self-healing, and show the Nagios state dip and recovery. | 🟡 50% |

---

## 2. Architecture in WSL2 (Ubuntu)

In WSL2, networking is bridged seamlessly with the Windows host:
- Ports bound to `0.0.0.0` or `127.0.0.1` inside WSL2 are accessible from Windows browsers at `http://localhost:<PORT>`.
- `kind` creates a Docker container representing the Kubernetes node (`cinescope-cluster-control-plane`).
- We expose NodePort **30080** for the CineScope application and NodePort **30800** for Nagios.

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      WINDOWS HOST BROWSER                              │
 │   CineScope Web App: http://localhost:30080                            │
 │   Nagios Dashboard:  http://localhost:30800 (or :8000 in Compose)      │
 └───────────────────────────────────▲────────────────────────────────────┘
                                     │ (Auto WSL2 Port Forward)
 ┌───────────────────────────────────┴────────────────────────────────────┐
 │                         WSL2 UBUNTU TERMINAL                           │
 │                                                                        │
 │  ┌──────────────────────────────────────────────────────────────────┐  │
 │  │             KIND CLUSTER (cinescope-cluster-control-plane)       │  │
 │  │                                                                  │  │
 │  │   [NRPE Daemon :5666] ──> Monitors Node CPU Load, Disk, Memory   │  │
 │  │                                                                  │  │
 │  │   [NodePort :30080]   ──> Service: cinescope-service             │  │
 │  │                                │                                 │  │
 │  │                                ├── Pod 1 (Running 1/1)           │  │
 │  │                                ├── Pod 2 (Running 1/1)           │  │
 │  │                                └── Pod 3 (Running 1/1)           │  │
 │  │                                                                  │  │
 │  │   [In-Cluster Nagios :30800] (Optional Aim)                      │  │
 │  │     ├── ServiceAccount (get, list, watch pods)                   │  │
 │  │     ├── check_http: NodePort / Service healthz                   │  │
 │  │     ├── check_nrpe: Node CPU, RAM, Disk                          │  │
 │  │     └── check_k8s_pods.sh: Pod health watchdog                   │  │
 │  └──────────────────────────────────────────────────────────────────┘  │
 └────────────────────────────────────────────────────────────────────────┘
```

---

## Step 1: WSL Ubuntu Prerequisites & Tooling

Open your **Ubuntu terminal in WSL** and run the following setup commands:

### 1.1 Navigate to the Project Workspace
```bash
cd "/mnt/c/Users/kbrna/OneDrive/Desktop/Project/Movie Review App"
chmod +x scripts/*.sh 2>/dev/null || true
```

### 1.2 Verify Required CLI Tools
```bash
# Verify Docker
docker ps

# Verify kubectl
kubectl version --client

# Verify kind
kind version
```

### 1.3 If Tools are Missing, Install via Ubuntu Terminal:
```bash
# Update Ubuntu package index
sudo apt-get update && sudo apt-get install -y curl apt-transport-https ca-certificates jq

# Install kubectl
if ! command -v kubectl &> /dev/null; then
  echo "Installing kubectl..."
  curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
  chmod +x ./kubectl && sudo mv ./kubectl /usr/local/bin/kubectl
fi

# Install Kind
if ! command -v kind &> /dev/null; then
  echo "Installing kind..."
  curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.22.0/kind-linux-amd64
  chmod +x ./kind && sudo mv ./kind /usr/local/bin/kind
fi
```

---

## Step 2: Kind Cluster Configuration with NodePort Mapping

To allow direct access to NodePorts `30080` (CineScope) and `30800` (Nagios), create `k8s/kind-config.yaml` in your project:

```bash
cat << 'EOF' > k8s/kind-config.yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: cinescope-cluster
nodes:
  - role: control-plane
    extraPortMappings:
      # CineScope NodePort
      - containerPort: 30080
        hostPort: 30080
        listenAddress: "0.0.0.0"
        protocol: TCP
      # In-Cluster Nagios NodePort
      - containerPort: 30800
        hostPort: 30800
        listenAddress: "0.0.0.0"
        protocol: TCP
EOF
```

### Create the Kind Cluster in WSL:
```bash
# Delete older cluster if exists
kind delete cluster --name cinescope-cluster 2>/dev/null || true

# Create new cluster with NodePort port mappings
kind create cluster --config k8s/kind-config.yaml

# Verify cluster connection
kubectl cluster-info --context kind-cinescope-cluster
kubectl get nodes
```

---

## Step 3: Docker Build & Deploy CineScope (3 Replicas + NodePort)

### 3.1 Update Service to NodePort
Update `k8s/service.yaml` to expose the app on port `30080`:

```bash
cat << 'EOF' > k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: cinescope-service
  namespace: cinescope
  labels:
    app: cinescope-frontend
    tier: frontend
spec:
  type: NodePort
  selector:
    app: cinescope-frontend
  ports:
    - name: http
      port: 80
      targetPort: 80
      nodePort: 30080
      protocol: TCP
EOF
```

### 3.2 Build the Multi-Stage Docker Image in WSL
```bash
# Build the production image (~21 MB NGINX Alpine)
docker build -t cinescope-frontend:1.0 .

# Load the image into the Kind cluster container nodes
kind load docker-image cinescope-frontend:1.0 --name cinescope-cluster
```

### 3.3 Deploy Manifests to Kubernetes
```bash
# Apply all manifests in k8s/ (Namespace, ConfigMap, Deployment, Service, Ingress)
kubectl apply -k k8s/

# Wait for all 3 replicas to reach Running & Ready status
kubectl rollout status deployment/cinescope-frontend -n cinescope --timeout=90s

# Verify 3 replicas
kubectl get pods -n cinescope -o wide
kubectl get svc -n cinescope
```

### 3.4 Test Application & Health Probe
From your WSL terminal or Windows browser:
```bash
# Direct HTTP test against the NodePort
curl -I http://localhost:30080
curl -s http://localhost:30080/healthz | jq .
```
- Open in Windows Browser: **`http://localhost:30080`**

---

## Step 4: Install & Configure NRPE Agent on Cluster Node (CPU, RAM, Disk)

The task requires monitoring node CPU, memory, and disk using the NRPE agent. Since Kind runs each node inside a Docker container (`cinescope-cluster-control-plane`), install the NRPE daemon directly inside that container.

Run this script in your WSL Ubuntu terminal:

```bash
cat << 'EOF' > scripts/setup-node-nrpe.sh
#!/usr/bin/env bash
set -euo pipefail

NODE_CONTAINER="cinescope-cluster-control-plane"

echo "=========================================================="
echo "Installing NRPE & Plugins on Kubernetes Node Container: ${NODE_CONTAINER}"
echo "=========================================================="

# 1. Install packages inside the node container
docker exec -i "${NODE_CONTAINER}" bash -c "
  apt-get update && apt-get install -y nagios-nrpe-server nagios-plugins-basic nagios-plugins-standard procps
"

# 2. Allow connections from Docker networks and localhost
docker exec -i "${NODE_CONTAINER}" bash -c "
  sed -i 's/^allowed_hosts=.*/allowed_hosts=127.0.0.1,172.17.0.0\/16,172.18.0.0\/16,10.244.0.0\/16/' /etc/nagios/nrpe.cfg
  sed -i 's/^dont_blame_nrpe=0/dont_blame_nrpe=1/' /etc/nagios/nrpe.cfg
"

# 3. Add node memory check command into nrpe.cfg
docker exec -i "${NODE_CONTAINER}" bash -c 'cat << "CMD" >> /etc/nagios/nrpe.cfg
command[check_mem]=/usr/bin/awk '\''/MemTotal/ {t=$2} /MemAvailable/ {a=$2} END {u=100-(a/t*100); if (u>90) {print "CRITICAL - Memory used: " int(u) "%"; exit 2} else if (u>80) {print "WARNING - Memory used: " int(u) "%"; exit 1} else {print "OK - Memory used: " int(u) "%"; exit 0}}'\'' /proc/meminfo
CMD'

# 4. Restart NRPE daemon inside the node container
docker exec -i "${NODE_CONTAINER}" service nagios-nrpe-server restart

echo "[SUCCESS] NRPE daemon configured and running on Kubernetes node!"

# 5. Test checks directly from inside node
echo "Testing node checks:"
docker exec -i "${NODE_CONTAINER}" /usr/lib/nagios/plugins/check_load -w 15,10,5 -c 30,25,20
docker exec -i "${NODE_CONTAINER}" /usr/lib/nagios/plugins/check_disk -w 20% -c 10% -p /
docker exec -i "${NODE_CONTAINER}" /usr/lib/nagios/plugins/check_nrpe -H 127.0.0.1 -c check_mem
EOF

chmod +x scripts/setup-node-nrpe.sh
./scripts/setup-node-nrpe.sh
```

---

## Step 5: Create Custom Nagios Pod Health Plugin (`check_k8s_pods.sh`)

The task explicitly requires:
> *"Add a custom check script using `kubectl get pods` to report pods that are not Running"*

Create the plugin script in `nagios/plugins/check_k8s_pods.sh`:

```bash
mkdir -p nagios/plugins

cat << 'EOF' > nagios/plugins/check_k8s_pods.sh
#!/usr/bin/env bash
# ==============================================================================
# Nagios Custom Plugin: check_k8s_pods.sh
# Purpose: Inspects Kubernetes pods in a namespace and alerts on non-running pods
# Exit Codes: 0 = OK, 1 = WARNING, 2 = CRITICAL, 3 = UNKNOWN
# ==============================================================================
set -o pipefail

NAMESPACE="cinescope"
LABEL="app=cinescope-frontend"

while getopts "n:l:" opt; do
  case ${opt} in
    n) NAMESPACE="${OPTARG}" ;;
    l) LABEL="${OPTARG}" ;;
    *) echo "Usage: $0 -n <namespace> -l <label_selector>" ; exit 3 ;;
  esac
done

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
  echo "UNKNOWN - kubectl command not found"
  exit 3
fi

# Fetch pod lines (NAME READY STATUS RESTARTS AGE)
POD_DATA=$(kubectl get pods -n "${NAMESPACE}" -l "${LABEL}" --no-headers 2>/dev/null)

if [ -z "${POD_DATA}" ]; then
  echo "CRITICAL - No pods found in namespace '${NAMESPACE}' matching '${LABEL}' | running=0 unhealthy=0"
  exit 2
fi

TOTAL_PODS=0
RUNNING_READY_PODS=0
UNHEALTHY_DETAILS=""

while IFS= read -r line; do
  [ -z "$line" ] && continue
  TOTAL_PODS=$((TOTAL_PODS + 1))
  
  POD_NAME=$(echo "$line" | awk '{print $1}')
  READY_STATUS=$(echo "$line" | awk '{print $2}')
  POD_STATUS=$(echo "$line" | awk '{print $3}')

  # Parse readiness (e.g. 1/1)
  READY_CONTAINERS=$(echo "$READY_STATUS" | cut -d'/' -f1)
  TOTAL_CONTAINERS=$(echo "$READY_STATUS" | cut -d'/' -f2)

  if [ "$POD_STATUS" = "Running" ] && [ "$READY_CONTAINERS" -eq "$TOTAL_CONTAINERS" ]; then
    RUNNING_READY_PODS=$((RUNNING_READY_PODS + 1))
  else
    UNHEALTHY_DETAILS="${UNHEALTHY_DETAILS} [${POD_NAME}: ${POD_STATUS} (${READY_STATUS})]"
  fi
done <<< "${POD_DATA}"

# Determine Nagios state
if [ "${RUNNING_READY_PODS}" -eq "${TOTAL_PODS}" ] && [ "${TOTAL_PODS}" -gt 0 ]; then
  echo "OK - All ${TOTAL_PODS} pods are Running and 1/1 Ready | total=${TOTAL_PODS} running=${RUNNING_READY_PODS} unhealthy=0"
  exit 0
elif [ "${RUNNING_READY_PODS}" -eq 0 ]; then
  echo "CRITICAL - 0/${TOTAL_PODS} pods running! Details:${UNHEALTHY_DETAILS} | total=${TOTAL_PODS} running=0 unhealthy=${TOTAL_PODS}"
  exit 2
else
  UNHEALTHY_COUNT=$((TOTAL_PODS - RUNNING_READY_PODS))
  echo "CRITICAL - ${UNHEALTHY_COUNT} pod(s) unhealthy/terminating! Details:${UNHEALTHY_DETAILS} | total=${TOTAL_PODS} running=${RUNNING_READY_PODS} unhealthy=${UNHEALTHY_COUNT}"
  exit 2
fi
EOF

chmod +x nagios/plugins/check_k8s_pods.sh
```

### Test the Custom Plugin Directly in WSL:
```bash
./nagios/plugins/check_k8s_pods.sh -n cinescope -l app=cinescope-frontend
# Output: OK - All 3 pods are Running and 1/1 Ready | total=3 running=3 unhealthy=0
```

---

## Step 6: Configure Nagios Monitoring for K8s Workload & Node

Update `nagios/cinescope.cfg` to incorporate the NodePort check, healthz probe, and custom pod health script:

```bash
cat << 'EOF' > nagios/cinescope.cfg
###############################################################################
# NAGIOS CONFIGURATION: CineScope Kubernetes Cluster & Workload Monitoring
# File: nagios/cinescope.cfg
###############################################################################

# Define Command for Custom Pod Watchdog
define command {
    command_name    check_k8s_pods
    command_line    /opt/nagios/etc/servers/plugins/check_k8s_pods.sh -n cinescope -l app=cinescope-frontend
}

# Define Host for CineScope Cluster Node
define host {
    use                     linux-server
    host_name               cinescope-k8s-node
    alias                   CineScope Kind Kubernetes Worker Node
    address                 host.docker.internal
    max_check_attempts      3
    check_period            24x7
    notification_interval   30
    notification_period     24x7
}

# 1. App Port Check (NodePort 30080)
define service {
    use                     generic-service
    host_name               cinescope-k8s-node
    service_description     CineScope NodePort TCP 30080
    check_command           check_tcp!30080
    notifications_enabled   1
}

# 2. Web HTTP 200 OK via NodePort
define service {
    use                     generic-service
    host_name               cinescope-k8s-node
    service_description     CineScope Web HTTP 200 OK
    check_command           check_http!-p 30080 -u / -e "HTTP/1.1 200"
    notifications_enabled   1
}

# 3. NGINX Liveness & Readiness Probe (/healthz)
define service {
    use                     generic-service
    host_name               cinescope-k8s-node
    service_description     CineScope Healthz Probe (/healthz)
    check_command           check_http!-p 30080 -u /healthz -s "healthy"
    notifications_enabled   1
}

# 4. Custom Kubernetes Workload Watchdog (kubectl get pods)
define service {
    use                     generic-service
    host_name               cinescope-k8s-node
    service_description     CineScope Workload Pod Health
    check_command           check_k8s_pods
    check_interval          1
    retry_interval          1
    notifications_enabled   1
}
EOF
```

Update `nagios/linux-host.cfg` to connect to the node's NRPE daemon:

```bash
cat << 'EOF' > nagios/linux-host.cfg
###############################################################################
# NAGIOS CONFIGURATION: Kubernetes Linux Node Monitoring (NRPE)
# File: nagios/linux-host.cfg
###############################################################################

define host {
    use                     linux-server
    host_name               k8s-cluster-node
    alias                   Kind Kubernetes Node (Ubuntu)
    address                 host.docker.internal
    max_check_attempts      3
    check_period            24x7
    notification_interval   30
    notification_period     24x7
}

# 1. Node Ping Check
define service {
    use                     generic-service
    host_name               k8s-cluster-node
    service_description     Node Network Ping
    check_command           check_ping!100.0,20%!500.0,60%
}

# 2. Node CPU Load Average via NRPE
define service {
    use                     generic-service
    host_name               k8s-cluster-node
    service_description     Node CPU Load Average
    check_command           check_nrpe!check_load
}

# 3. Node Disk Space via NRPE
define service {
    use                     generic-service
    host_name               k8s-cluster-node
    service_description     Node Root Disk Space
    check_command           check_nrpe!check_disk
}

# 4. Node Memory Usage via NRPE
define service {
    use                     generic-service
    host_name               k8s-cluster-node
    service_description     Node Memory Usage
    check_command           check_nrpe!check_mem
}
EOF
```

---

## Step 7: Launch Centralized Nagios Monitoring (In-Cluster & Docker Compose)

You can launch Nagios in either mode:

### Option A: In-Cluster Nagios on Kubernetes (Optional Aim Fulfilled)
Create `k8s/monitoring/` manifests allowing Nagios to run inside Kubernetes with native pod access:

```bash
mkdir -p k8s/monitoring

cat << 'EOF' > k8s/monitoring/nagios.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: nagios-sa
  namespace: cinescope
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: nagios-pod-viewer
rules:
  - apiGroups: [""]
    resources: ["pods", "services", "nodes"]
    verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: nagios-pod-viewer-binding
subjects:
  - kind: ServiceAccount
    name: nagios-sa
    namespace: cinescope
roleRef:
  kind: ClusterRole
  name: nagios-pod-viewer
  apiGroup: rbac.authorization.k8s.io
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cinescope-nagios
  namespace: cinescope
spec:
  replicas: 1
  selector:
    matchLabels:
      app: cinescope-nagios
  template:
    metadata:
      labels:
        app: cinescope-nagios
    spec:
      serviceAccountName: nagios-sa
      containers:
        - name: nagios
          image: jasonrivers/nagios:latest
          ports:
            - containerPort: 80
          env:
            - name: NAGIOSADMIN_USER
              value: "nagiosadmin"
            - name: NAGIOSADMIN_PASS
              value: "nagiosadmin"
---
apiVersion: v1
kind: Service
metadata:
  name: cinescope-nagios-service
  namespace: cinescope
spec:
  type: NodePort
  selector:
    app: cinescope-nagios
  ports:
    - name: http
      port: 80
      targetPort: 80
      nodePort: 30800
EOF

# Deploy In-Cluster Nagios:
kubectl apply -f k8s/monitoring/nagios.yaml
kubectl rollout status deployment/cinescope-nagios -n cinescope --timeout=90s
```
- Open in Windows Browser: **`http://localhost:30800`** (User: `nagiosadmin`, Pass: `nagiosadmin`)

### Option B: Docker Compose Nagios (Local WSL Container)
Update `docker-compose.monitoring.yml` to mount the plugins folder:
```bash
docker compose -f docker-compose.monitoring.yml up -d
```
- Open in Windows Browser: **`http://localhost:8000`** (User: `nagiosadmin`, Pass: `nagiosadmin`)

---

## Step 8: Live Evaluator Demo Flow (Scale, Pod Delete, Alert Dip & Auto-Recovery)

Create an automated demo script `scripts/demo-pod-healing.sh`:

```bash
cat << 'EOF' > scripts/demo-pod-healing.sh
#!/usr/bin/env bash
# ==============================================================================
# Script: demo-pod-healing.sh
# Purpose: Demonstrates Kubernetes self-healing and Nagios dip/recovery
# ==============================================================================
set -euo pipefail

echo -e "\033[1;36m==========================================================\033[0m"
echo -e "\033[1;33m   CineScope :: Kubernetes Pod Self-Healing & Nagios Demo  \033[0m"
echo -e "\033[1;36m==========================================================\033[0m"

echo -e "\n\033[1;36m[Step 1/4] Current Healthy Workload (3 Replicas):\033[0m"
kubectl get pods -n cinescope -o wide

echo -e "\n\033[1;32mBaseline Nagios Custom Check:\033[0m"
./nagios/plugins/check_k8s_pods.sh -n cinescope -l app=cinescope-frontend

echo -e "\n\033[1;36m[Step 2/4] Testing Dynamic Horizontal Scaling (3 -> 5 Replicas):\033[0m"
kubectl scale deployment cinescope-frontend -n cinescope --replicas=5
kubectl rollout status deployment/cinescope-frontend -n cinescope --timeout=30s
kubectl get pods -n cinescope

echo -e "\nScaling back to desired 3 replicas..."
kubectl scale deployment cinescope-frontend -n cinescope --replicas=3
kubectl rollout status deployment/cinescope-frontend -n cinescope --timeout=30s

echo -e "\n\033[1;33m----------------------------------------------------------\033[0m"
TARGET_POD=$(kubectl get pods -n cinescope -l app=cinescope-frontend -o jsonpath='{.items[0].metadata.name}')
echo -e "\033[1;31m[Step 3/4] Inducing Dip: Deleting Pod '${TARGET_POD}'...\033[0m"
kubectl delete pod "${TARGET_POD}" -n cinescope --grace-period=15 &

sleep 2
echo -e "\n\033[1;31mNagios Custom Check detecting the state dip:\033[0m"
./nagios/plugins/check_k8s_pods.sh -n cinescope -l app=cinescope-frontend || true

echo -e "\n\033[1;33mACTION FOR PRESENTATION:\033[0m"
echo -e "1. Look at Nagios Web UI (http://localhost:30800 or :8000)"
echo -e "2. Notice 'CineScope Workload Pod Health' transitions to CRITICAL/WARNING!"

read -p "Press [ENTER] to observe Kubernetes self-healing and Nagios recovery..."

echo -e "\n\033[1;36m[Step 4/4] Kubernetes Self-Healing in Progress...\033[0m"
kubectl rollout status deployment/cinescope-frontend -n cinescope --timeout=60s

echo -e "\n\033[1;32mActive Pods after self-healing:\033[0m"
kubectl get pods -n cinescope -o wide

echo -e "\n\033[1;32mNagios Custom Check after auto-recovery:\033[0m"
./nagios/plugins/check_k8s_pods.sh -n cinescope -l app=cinescope-frontend

echo -e "\n\033[1;32m[SUCCESS] Kubernetes recreated the pod and Nagios auto-recovered to OK (Green)!\033[0m"
EOF

chmod +x scripts/demo-pod-healing.sh
```

---

## 11. Immediate File Generation Checklist

To execute everything seamlessly in your WSL terminal, we will generate the following files:

- [ ] **`k8s/kind-config.yaml`**: NodePort mappings (30080, 30800) for Kind
- [ ] **`k8s/service.yaml`**: Update to `NodePort: 30080`
- [ ] **`scripts/setup-node-nrpe.sh`**: Installs NRPE on the node container
- [ ] **`nagios/plugins/check_k8s_pods.sh`**: Custom watchdog script
- [ ] **`nagios/cinescope.cfg`**: Configures checks for NodePort and custom plugin
- [ ] **`nagios/linux-host.cfg`**: Configures node NRPE checks (CPU, disk, memory)
- [ ] **`k8s/monitoring/nagios.yaml`**: In-cluster Nagios deployment & RBAC
- [ ] **`scripts/demo-pod-healing.sh`**: Live demonstration script

---

*CineScope Kubernetes & Centralized Monitoring :: Engineered for WSL2 (Ubuntu).*
