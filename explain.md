# 📘 CineScope :: Complete Project Explanation Guide (`explain.md`)
## Monitoring a Kubernetes Cluster with Nagios (Workload & Node Infrastructure)

---

## 🎯 1. Project Title & Academic Aim

> **Project Title:** CineScope — Cloud-Native Container Orchestration & Centralized Infrastructure Monitoring  
> **Core Aim:** To containerize, deploy, and scale a high-availability modern web application on a local Kubernetes cluster, while solving production observability challenges by implementing centralized Nagios monitoring for both cluster nodes (infrastructure level) and application workloads (service level).

### 📖 The Real-World Scenario
In modern microservices architecture, deploying containerized applications without centralized observability leads to:
1. **Silent Failures:** If a pod crashes or enters `CrashLoopBackOff`, end users experience downtime while the operations team remains unaware until notified by customer tickets.
2. **Infrastructure Blind Spots:** Teams cannot easily track node-level hardware exhaustion (CPU saturation, out-of-memory spikes, disk capacity full).
3. **High MTTR (Mean Time to Resolution):** Engineers must manually run ad-hoc commands across multiple worker nodes to diagnose root causes.

**The Solution:**
- **Kubernetes (KinD):** Orchestrates **CineScope** (React 18 + NGINX SPA) across 3 replicas with automated self-healing, rolling updates, and declarative service load balancing.
- **Nagios Core:** Acts as the centralized operations center, combining:
  1. Node hardware health checks via the **NRPE** agent (CPU, Memory, Disk).
  2. Active HTTP/TCP availability checks via **`check_http`** and **`check_tcp`**.

---

## 🏗️ 2. Architectural Design & Data Flow

```text
                               +-------------------------------------------------------------+
                               |              CENTRALIZED NAGIOS MONITORING                  |
                               |                   (Docker / Kubernetes)                     |
                               |                     Port :8000 Web GUI                      |
                               +------------------------------+------------------------------+
                                                              |
                       +--------------------------------------+--------------------------------------+
                       |                                                                             |
      [ 1. NODE-LEVEL MONITORING ]                                                   [ 2. WORKLOAD-LEVEL MONITORING ]
     Via NRPE Daemon (Port 5666)                                                    Via Active Network Probes & Plugins
                       |                                                                             |
                       v                                                                             v
      +----------------------------------+                                          +----------------------------------+
      |  KinD Control-Plane / Worker     |                                          |   CineScope Service / NodePort   |
      |----------------------------------|                                          |----------------------------------|
      | - CPU Load (check_load)          |                                          | - TCP Port 8080 (check_tcp)      |
      | - Root Disk Space (check_disk)   |                                          | - HTTP 200 OK (check_http)       |
      | - RAM Utilization (check_mem)    |                                          | - /healthz Probe (check_http)    |
      | - Network PING (check_ping)      |                                          | - ClusterIP Service Reachability |
      +----------------------------------+                                          +----------------------------------+
                       |                                                                             |
                       +-------------------------------+---------------------------------------------+
                                                       |
                                                       v
                                    +-------------------------------------+
                                    |     KUBERNETES POD WORKLOAD         |
                                    |     (cinescope-frontend:1.0)        |
                                    |  [ Pod 1 ]   [ Pod 2 ]   [ Pod 3 ]  |
                                    +-------------------------------------+
```

---

## 🔬 3. Deep-Dive Implementation (Mapping Every Task Requirement)

### Task Requirement 1: Cluster Setup & Workload Deployment with Scaling
- **Tooling:** **KinD (Kubernetes in Docker)** is configured using [`kind-config.yaml`](file:///c:/Users/kbrna/OneDrive/Desktop/Project/Movie%20Review%20App/kind-config.yaml) to map container ports (`30080` for NodePort, `8080` for port-forwarding).
- **Application Containerization:** Multi-stage [`Dockerfile`](file:///c:/Users/kbrna/OneDrive/Desktop/Project/Movie%20Review%20App/Dockerfile):
  - **Stage 1 (Builder):** Uses `node:20-alpine` to install dependencies and compile the production bundle (`npm run build`).
  - **Stage 2 (Runtime):** Copies only static distribution files (`dist/`) into `nginx:1.27-alpine` (~21 MB image), dramatically shrinking attack surface and image size.
- **Declarative Deployment:** Managed through Kustomize in [`k8s/`](file:///c:/Users/kbrna/OneDrive/Desktop/Project/Movie%20Review%20App/k8s/):
  - `namespace.yaml`: Isolates the application into the `cinescope` namespace.
  - `deployment.yaml`: Manages 3 replica pods with `rollingUpdate` (`maxSurge: 1`, `maxUnavailable: 0`), resource boundaries (`cpu: 50m-250m`, `memory: 64Mi-128Mi`), and securityContext capabilities (`CHOWN`, `SETUID`, `SETGID`, `NET_BIND_SERVICE`).
  - `service.yaml`: Distributes incoming traffic across healthy pods.
- **Dynamic Horizontal Scaling:** Executed live via:
  ```bash
  kubectl scale deployment cinescope-frontend -n cinescope --replicas=5
  ```
  Kubernetes adjusts the desired state from 3 to 5 pods in under 2 seconds.

---

### Task Requirement 2: Node Monitoring via NRPE Agent (CPU, Memory, Disk)
- **Architecture:** The **NRPE (Nagios Remote Plugin Executor)** daemon runs as an agent on the cluster node. When Nagios queries the node over port `5666`, NRPE executes local plugins in `/usr/lib/nagios/plugins/` and returns exit codes:
  - `0 = OK`
  - `1 = WARNING`
  - `2 = CRITICAL`
- **Configured Node Metrics in [`nagios/linux-host.cfg`](file:///c:/Users/kbrna/OneDrive/Desktop/Project/Movie%20Review%20App/nagios/linux-host.cfg):**
  1. **CPU Load:** Checks 1, 5, and 15-minute load averages (`check_load!5.0,4.0,3.0!10.0,6.0,4.0`).
  2. **Disk Space:** Monitors root partition free percentage (`check_disk!20%!10%!/`).
  3. **Memory Utilization:** Custom memory plugin parsing `/proc/meminfo` to warn at >80% and trigger Critical at >90%.
  4. **Host Reachability:** PING probe tracking network latency and packet loss.

---

### Task Requirement 3: Workload Probing via `check_http`
- **Configuration in [`nagios/cinescope.cfg`](file:///c:/Users/kbrna/OneDrive/Desktop/Project/Movie%20Review%20App/nagios/cinescope.cfg):**
  Nagios queries the application's service endpoint:
  1. **TCP Port Check (`check_tcp!8080`):** Confirms the network socket is open and listening.
  2. **HTTP Root Check (`check_http!-p 8080 -u / -e "HTTP/1.1 200"`):** Asserts that the web server delivers an `HTTP 200 OK` status for the single-page application.
  3. **Health Probe Check (`check_http!-p 8080 -u /healthz -s "healthy"`):** Verifies that the internal Kubernetes liveness probe returns the string `"healthy"`.

---

### Task Requirement 4: Running Nagios (Docker / In-Cluster)
- **Deployment Strategy:** Configured via [`docker-compose.monitoring.yml`](file:///c:/Users/kbrna/OneDrive/Desktop/Project/Movie%20Review%20App/docker-compose.monitoring.yml) using `jasonrivers/nagios:4.4.6`.
- **Persistent Volume Mounts:** Mounts local configuration files (`nagios/`) into `/opt/nagios/etc/` so custom host definitions are loaded on container startup.
- **Web UI Access:** Exposed on host port **`8000`** with basic authentication credentials (`nagiosadmin` / `nagiosadmin`).

---

## 🎬 4. The Live Demonstration Walkthrough (Step-by-Step)

During the practical evaluation, execute this exact narrative:

### Step 4.1: Showcase the Operational Baseline
1. Open browser at **`http://localhost:8080`**:
   - Show the CineScope movie app (*Oppenheimer* hero banner, search bar, dynamic review modal).
2. Open browser at **`http://localhost:8000`**:
   - Navigate to **Current Status → Services** in Nagios.
   - Point out that all system metrics (PING, CPU, Disk, HTTP) are in the **🟢 OK** state.

### Step 4.2: Demonstrate Kubernetes Self-Healing
In the terminal, abruptly kill a healthy pod:
```bash
kubectl delete pod $(kubectl get pods -n cinescope -o jsonpath='{.items[0].metadata.name}') -n cinescope
```
- **Observation:** Run `kubectl get pods -n cinescope` immediately.
- **Talking Point:** *"Notice that Kubernetes detected the divergence between the desired state (3 replicas) and actual state (2 replicas). It instantly spawned a replacement pod in under 2 seconds, maintaining service continuity."*

### Step 4.3: Simulate an Outage & Show Nagios Alert Dip
In the terminal, scale the deployment down to 0 replicas:
```bash
kubectl scale deployment cinescope-frontend -n cinescope --replicas=0
```
1. Refresh `http://localhost:8080` → Connection refused / site down.
2. In Nagios (`http://localhost:8000`), click the CineScope HTTP check → **"Re-schedule the next check of this service"** → **Commit**.
3. **Observation:** The check turns **🔴 CRITICAL** (`Connection refused` or `HTTP 503`).
4. **Talking Point:** *"Within seconds of the workload dropping, Nagios detected the failure without human intervention, logging a Critical state that in production fires an automated on-call alert."*

### Step 4.4: Restore Service & Show Auto-Recovery
In the terminal, restore the deployment to 3 replicas:
```bash
kubectl scale deployment cinescope-frontend -n cinescope --replicas=3
kubectl port-forward -n cinescope svc/cinescope-service 8080:80 --address=0.0.0.0 &
```
1. In Nagios, force an immediate check reschedule.
2. **Observation:** The status returns to **🟢 OK** (`HTTP/1.1 200 OK`).
3. Refresh `http://localhost:8080` → CineScope is restored.
4. **Talking Point:** *"Kubernetes healed the application workload, and Nagios automatically recognized the recovery, clearing the incident."*

---

## 📌 5. Summary of Project Artifacts

- **Frontend Application Source:** [`src/`](file:///c:/Users/kbrna/OneDrive/Desktop/Project/Movie%20Review%20App/src/) (React 18 + Vite)
- **Container Configuration:** [`Dockerfile`](file:///c:/Users/kbrna/OneDrive/Desktop/Project/Movie%20Review%20App/Dockerfile) & [`nginx.conf`](file:///c:/Users/kbrna/OneDrive/Desktop/Project/Movie%20Review%20App/nginx.conf)
- **Kubernetes Manifests:** [`k8s/`](file:///c:/Users/kbrna/OneDrive/Desktop/Project/Movie%20Review%20App/k8s/) (`deployment.yaml`, `service.yaml`, `configmap.yaml`, `ingress.yaml`)
- **Nagios Configurations:** [`nagios/`](file:///c:/Users/kbrna/OneDrive/Desktop/Project/Movie%20Review%20App/nagios/) (`cinescope.cfg`, `linux-host.cfg`, `windows-host.cfg`)
- **Monitoring Compose File:** [`docker-compose.monitoring.yml`](file:///c:/Users/kbrna/OneDrive/Desktop/Project/Movie%20Review%20App/docker-compose.monitoring.yml)
- **Terminal Execution Guides:** [`impcommands.md`](file:///c:/Users/kbrna/OneDrive/Desktop/Project/Movie%20Review%20App/impcommands.md) & [`commands.md`](file:///c:/Users/kbrna/OneDrive/Desktop/Project/Movie%20Review%20App/commands.md)
