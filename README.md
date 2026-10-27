# 🎬 CineScope :: Modern Cinematic Movie Review Platform

> **A Cloud-Native Frontend & DevOps Showcase**  
> Built with **HTML5, CSS3, JavaScript, React.js (Vite)**, containerized with **Multi-Stage Docker & NGINX**, and orchestrated on **Kubernetes (kind)**.

---

## 🌟 Project Overview

**CineScope** is a high-performance, dark-themed, cinematic movie discovery and review single-page application. Designed specifically for DevOps demonstrations and student mini-projects, it requires **zero external databases or Node backend APIs**—it is a self-contained, lightning-fast static SPA served through a production-grade NGINX web server with Kubernetes self-healing and scaling capabilities.

### Key Features
- 🌌 **Cinematic Dark Interface**: Glassmorphism, radiant glows, Google Fonts (`Outfit` & `Inter`), and smooth micro-animations.
- 🎬 **14 Iconic Films**: Comprehensive static dataset including *Oppenheimer*, *Dune: Part Two*, *Interstellar*, *The Dark Knight*, *Spirited Away*, *Parasite*, and more.
- ⚡ **Interactive Filtering & Search**: Instant live search by title, director, cast, or synopsis; dynamic genre pills; multi-criteria sorting (Highest Rated, Newest, Title A-Z).
- ⭐ **Detailed Review Modal**: Complete critique breakdowns, Rotten Tomatoes & IMDb scores, cast credits, and an interactive review submission form.
- 🐳 **Multi-Stage Dockerfile**: Decouples the Node.js build environment from the final 25 MB NGINX Alpine runtime.
- ☸️ **Production-Ready Kubernetes**: Dedicated namespace (`cinescope`), 3-replica Deployment with rolling updates, ClusterIP Service, Ingress, ConfigMap, and active `healthz` liveness & readiness probes.
- 📜 **Cross-Platform Automation**: One-click scripts for Windows PowerShell (`.ps1`) and Linux/macOS/WSL (`.sh`).

---

## 📂 Project Directory Structure

```text
Movie Review App/
├── .dockerignore                 # Excludes node_modules, dist, git from Docker context
├── .gitignore                    # Git ignore file
├── docker-compose.monitoring.yml # Centralized Nagios monitoring container definition
├── docker-compose.yml            # Local Docker Compose multi-service definition
├── Dockerfile                    # Multi-stage production container build (Node -> NGINX)
├── index.html                    # Single-page HTML entry point with fonts & metadata
├── nginx.conf                    # NGINX configuration (SPA routing, gzip, /healthz, caching)
├── package.json                  # React 18, Vite dependencies & build scripts
├── vite.config.js                # Vite development and bundling configuration
├── PROJECT-ARCHITECTURE.md       # Comprehensive architecture docs & Mermaid diagram
├── README.md                     # Complete execution and troubleshooting guide
├── steps.md                      # Step-by-step viva presentation guide & Nagios demo
│
├── nagios/                       # Nagios Centralized Monitoring Configurations
│   ├── cinescope.cfg             # Monitors CineScope TCP 8080, HTTP 200, /healthz
│   ├── linux-host.cfg            # Monitors Linux host (CPU load, disk, procs, SSH)
│   └── windows-host.cfg          # Monitors Windows host (CPU, RAM, C: drive, RDP)
│
├── src/                          # React Application Source Code
│   ├── main.jsx                  # React DOM bootstrap
│   ├── App.jsx                   # Primary layout, filter state, and modal controller
│   ├── index.css                 # Modern CSS design tokens, glassmorphism, responsive grid
│   ├── components/               # Modular UI Components
│   │   ├── Navbar.jsx            # Brand header, watchlist badge, quick navigation
│   │   ├── Hero.jsx              # Featured movie showcase with Ken Burns animation
│   │   ├── SearchBar.jsx         # Real-time search input and sort dropdown
│   │   ├── GenreFilter.jsx       # Category pill buttons with movie counter
│   │   ├── MovieCard.jsx         # Poster card with fallback handler & rating badge
│   │   ├── MovieList.jsx         # Grid container with animated empty state
│   │   ├── MovieModal.jsx        # Detailed critic critique and review form
│   │   ├── Footer.jsx            # Technology badges, DevOps metadata & credits
│   │   └── Icons.jsx             # Zero-dependency SVG icons (stars, play, film, etc.)
│   └── data/
│       └── movies.js             # Static dataset of 14 curated movies & critic reviews
│
├── k8s/                          # Kubernetes Manifests
│   ├── namespace.yaml            # Dedicated namespace 'cinescope'
│   ├── configmap.yaml            # NGINX configuration ConfigMap
│   ├── deployment.yaml           # 3 Replicas, probes, resource bounds, securityContext
│   ├── service.yaml              # ClusterIP Service routing traffic to Port 80
│   ├── ingress.yaml              # Optional Ingress rule for cinescope.local
│   └── kustomization.yaml        # Declarative Kustomize manifest bundle
│
└── scripts/                      # Cross-Platform Automation Scripts
    ├── build-docker.ps1          # Windows: Docker build script
    ├── build-docker.sh           # Linux: Docker build script
    ├── deploy-k8s.ps1            # Windows: Kind loader & kubectl deploy script
    ├── deploy-k8s.sh             # Linux: Kind loader & kubectl deploy script
    ├── verify.ps1                # Windows: Kubernetes verification script
    ├── verify.sh                 # Linux: Kubernetes verification script
    ├── start-monitoring.ps1      # Windows: Launch Nagios monitoring server
    ├── start-monitoring.sh       # Linux: Launch Nagios monitoring server
    ├── simulate-outage.ps1       # Windows: Live outage & alert auto-recovery demo
    ├── simulate-outage.sh        # Linux: Live outage & alert auto-recovery demo
    ├── cleanup.ps1               # Windows: Safe resource teardown script
    └── cleanup.sh                # Linux: Safe resource teardown script
```

---

## 🛠️ Prerequisites

Ensure you have the following tools installed on your operating system:

| Tool | Recommended Version | Verify Command | Installation Link |
| :--- | :--- | :--- | :--- |
| **Node.js** | v18+ or v20+ | `node -v` | [nodejs.org](https://nodejs.org/) |
| **npm** | v9+ or v10+ | `npm -v` | Included with Node.js |
| **Docker** | v20+ / Docker Desktop | `docker -v` | [docker.com](https://www.docker.com/products/docker-desktop/) |
| **kubectl** | v1.26+ | `kubectl version --client` | [kubernetes.io](https://kubernetes.io/docs/tasks/tools/) |
| **kind** (Optional) | v0.20+ | `kind version` | [kind.sigs.k8s.io](https://kind.sigs.k8s.io/) |

> **Tip for Windows users installing `kind`**:  
> You can install kind instantly via Winget or Chocolatey:
> ```powershell
> winget install Kubernetes.kind
> # OR
> choco install kind
> ```

---

## 🚀 Step 1: Run Locally (Development Mode)

Test the React frontend directly on your local machine using the Vite development server:

### Windows PowerShell:
```powershell
# 1. Install dependencies
npm install

# 2. Start Vite local development server
npm run dev
```

### Linux / macOS Terminal:
```bash
# 1. Install dependencies
npm install

# 2. Start Vite local development server
npm run dev
```

Open your browser at: **`http://localhost:3000`**

---

## 🐳 Step 2: Build & Run with Docker

Test the multi-stage Docker build locally to verify the production NGINX container.

### Option A: Using the Provided Automation Scripts
- **Windows PowerShell**:
  ```powershell
  .\scripts\build-docker.ps1
  ```
- **Linux / macOS**:
  ```bash
  chmod +x ./scripts/*.sh
  ./scripts/build-docker.sh
  ```

### Option B: Using Exact Docker CLI Commands

#### 1. Build the Docker Image:
```bash
docker build -t cinescope-frontend:1.0 .
```

#### 2. Run the Container:
```bash
docker run -d --name cinescope-app -p 8080:80 cinescope-frontend:1.0
```

#### 3. Verify Container Health & NGINX Probe:
```bash
# Check container status
docker ps

# Test the healthcheck probe endpoint
curl http://localhost:8080/healthz
# Expected output: healthy
```

Navigate to: **`http://localhost:8080`** in your browser.

#### 4. Stop and Remove the Local Container:
```bash
docker stop cinescope-app
docker rm cinescope-app
```

---

## 📦 Step 3: Run with Docker Compose

Docker Compose lets you build and run the container with resource limits and health checks defined in `docker-compose.yml`:

```bash
# Start CineScope in detached mode with rebuild
docker compose up -d --build

# Inspect running container and health status
docker compose ps

# View real-time NGINX logs
docker compose logs -f

# Stop and clean up containers
docker compose down
```

Navigate to: **`http://localhost:8080`**

---

## ☸️ Step 4: Deploy to Kubernetes (kind Cluster)

Deploy CineScope to a local Kubernetes cluster using `kind` (Kubernetes in Docker).

### Step 4.1: Create a Local kind Cluster
```bash
kind create cluster --name cinescope-cluster
```
Verify cluster access:
```bash
kubectl cluster-info --context kind-cinescope-cluster
```

---

### Step 4.2: Load Docker Image into kind
Because `cinescope-frontend:1.0` is a local image, load it directly into the kind node:
```bash
kind load docker-image cinescope-frontend:1.0 --name cinescope-cluster
```

> **Why this matters**: In `k8s/deployment.yaml`, `imagePullPolicy: IfNotPresent` instructs Kubernetes to use the locally loaded image instead of attempting to pull from Docker Hub.

---

### Step 4.3: Deploy the Kubernetes Manifests

Apply the entire manifest bundle using **Kustomize**:

```bash
kubectl apply -k k8s/
```

*Alternatively, if applying files individually:*
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

---

### Step 4.4: Verify the Rollout

Wait for all three replica Pods to transition into `Running` and `Ready` state:

```bash
# Watch the rolling update status
kubectl rollout status deployment/cinescope-frontend -n cinescope

# Inspect the Pods
kubectl get pods -n cinescope -o wide

# Inspect the Service
kubectl get svc -n cinescope
```

Expected output:
```text
NAME                                  READY   STATUS    RESTARTS   AGE
cinescope-frontend-6b876fc6d8-4pzkq   1/1     Running   0          30s
cinescope-frontend-6b876fc6d8-9m2vw   1/1     Running   0          30s
cinescope-frontend-6b876fc6d8-7r4tx   1/1     Running   0          30s

NAME                TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
cinescope-service   ClusterIP   10.96.140.210   <none>        80/TCP    30s
```

---

### Step 4.5: Access the Application via Port-Forwarding

Since `cinescope-service` is an internal `ClusterIP` service, forward port `8080` on your host to port `80` on the service:

```bash
kubectl port-forward -n cinescope svc/cinescope-service 8080:80
```

Open your browser and navigate to:
👉 **`http://localhost:8080`**

---

## 📈 Step 5: Demonstration Operations for Student Presentation

These commands are ideal for demonstrating Kubernetes operations during a DevOps evaluation:

### 1. Scaling the Deployment Up and Down
Show auto-healing and replica scaling:
```bash
# Scale to 4 replicas
kubectl scale deployment cinescope-frontend -n cinescope --replicas=4

# Watch 2 new pods spin up instantly
kubectl get pods -n cinescope -l app=cinescope-frontend

# Scale back down to 2 replicas
kubectl scale deployment cinescope-frontend -n cinescope --replicas=2
```

### 2. Testing Self-Healing (Pod Eviction Simulation)
Demonstrate that Kubernetes automatically replaces terminated pods:
```bash
# Delete one of the running pods
kubectl delete pod $(kubectl get pods -n cinescope -o jsonpath='{.items[0].metadata.name}') -n cinescope

# Notice that a replacement pod is immediately spawned
kubectl get pods -n cinescope
```

### 3. Inspecting Liveness and Readiness Probes
```bash
kubectl describe pod -n cinescope -l app=cinescope-frontend | grep -E "Liveness|Readiness"
```

### 4. Viewing NGINX Access Logs across Pods
```bash
kubectl logs -n cinescope -l app=cinescope-frontend --tail=20 -f
```

---

## 🔍 Troubleshooting Guide

### 1. `ImagePullBackOff` or `ErrImageNeverPull`
- **Cause**: Kubernetes cannot locate `cinescope-frontend:1.0` inside the kind node.
- **Solution**:
  ```bash
  kind load docker-image cinescope-frontend:1.0 --name cinescope-cluster
  ```
  Ensure `imagePullPolicy: IfNotPresent` is set in [deployment.yaml](file:///c:/Users/kbrna/OneDrive/Desktop/Project/Movie%20Review%20App/k8s/deployment.yaml).

### 2. `CrashLoopBackOff`
- **Cause**: NGINX failed to bind port 80 or configuration syntax error.
- **Check container logs**:
  ```bash
  kubectl logs -n cinescope deployment/cinescope-frontend --previous
  ```

### 3. Port `8080` Already in Use
- **Cause**: Another service or previous container is using port 8080.
- **Solution**: Forward to a different port such as 8085:
  ```bash
  kubectl port-forward -n cinescope svc/cinescope-service 8085:80
  ```
  Then access `http://localhost:8085`.

---

## 🧹 Step 6: Safe Cleanup & Teardown

To cleanly remove all deployed Kubernetes resources and Docker artifacts:

### Using Automation Script:
- **Windows PowerShell**:
  ```powershell
  # Clean up k8s resources and compose
  .\scripts\cleanup.ps1

  # Optionally clean up and delete the entire kind cluster
  .\scripts\cleanup.ps1 -DeleteCluster
  ```
- **Linux / macOS**:
  ```bash
  ./scripts/cleanup.sh cinescope-cluster true
  ```

### Manual Cleanup Commands:
```bash
# 1. Delete all Kubernetes resources
kubectl delete -k k8s/

# 2. Delete the namespace
kubectl delete namespace cinescope

# 3. Delete the kind cluster (optional)
kind delete cluster --name cinescope-cluster

# 4. Remove Docker image (optional)
docker rmi cinescope-frontend:1.0
```

---

## 📄 License & Academic Attribution
Developed as an educational DevOps showcase. Designed for high clarity, modularity, and zero external dependency risk.
