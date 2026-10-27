# 🎬 CineScope :: End-to-End Project Demonstration Guide
## Kubernetes Container Orchestration & Centralized Nagios Monitoring

> **Project Title:** CineScope — Cloud-Native Container Orchestration & Centralized Infrastructure Monitoring  
> **Core Objective:** To deploy, scale, and manage containerized applications using Kubernetes for orchestration, and solve the lack of centralized monitoring in production environments by installing and configuring Nagios for Linux and Windows systems.

---

## 📌 Table of Contents
1. [Project Overview & Problem Statement](#1-project-overview--problem-statement)
2. [Demonstration Architecture](#2-demonstration-architecture)
3. [Phase 1: Presenter Script & 10-Minute Demonstration Flow](#3-phase-1-presenter-script--10-minute-demonstration-flow)
4. [Phase 2: Kubernetes Orchestration & Scaling Demo (Step-by-Step)](#4-phase-2-kubernetes-orchestration--scaling-demo-step-by-step)
5. [Phase 3: Nagios Centralized Monitoring Setup (Linux & Windows)](#5-phase-3-nagios-centralized-monitoring-setup-linux--windows)
6. [Phase 4: Live Outage & Auto-Alert Simulation Demo](#6-phase-4-live-outage--auto-alert-simulation-demo)
7. [Phase 5: Top 10 Viva / Evaluator Q&A Cheat Sheet](#7-phase-5-top-10-viva--evaluator-qa-cheat-sheet)
8. [Phase 6: Safe Cleanup & Teardown](#8-phase-6-safe-cleanup--teardown)

---

## 1. Project Overview & Problem Statement

### 🎯 The Challenge:
In a modern production environment, deploying microservices and containerized web applications without centralized visibility creates severe operational risks:
- **No Visibility into Infrastructure:** Teams cannot easily track server CPU, RAM, disk capacity, and network ports across mixed Linux and Windows server pools.
- **Silent Service Failures:** If a pod crashes, network routing breaks, or a web server locks up, delayed issue detection results in prolonged service downtime (high MTTR - Mean Time to Resolution).
- **Manual Overhead:** Engineers must manually log into individual servers or run ad-hoc commands to troubleshoot issues.

### 💡 The Solution:
1. **Container Orchestration (Kubernetes)**:
   - Application: **CineScope** — A modern, responsive cinematic movie discovery platform (React 18 + Vite).
   - Containerization: Multi-stage Dockerfile packaging the SPA into a lightweight **NGINX Alpine** container (~21 MB).
   - Orchestration: Kubernetes Deployment managing **3 Replicas**, automated self-healing, rolling updates, resource boundaries, and internal ClusterIP load balancing.
2. **Centralized Monitoring (Nagios Core)**:
   - Centralized dashboard monitoring server availability, network ports, and HTTP endpoints.
   - **Kubernetes Application Monitoring**: Continuously probes TCP port 8080, HTTP 200 responses, and the `/healthz` probe endpoint.
   - **Linux System Monitoring**: Tracks host CPU load, root disk space, memory, and SSH port 22 via **NRPE** (Nagios Remote Plugin Executor).
   - **Windows System Monitoring**: Tracks Windows CPU usage, memory utilization, C: drive space, and RDP port 3389 via **NCPA / NSClient++**.

---

## 2. Demonstration Architecture

```text
                               +-------------------------------------------------------+
                               |              NAGIOS MONITORING SERVER                 |
                               |             (Centralized Web Dashboard)               |
                               +---------------------------+---------------------------+
                                                           |
                      +------------------------------------+-----------------------------------+
                      |                                    |                                   |
                      v                                    v                                   v
       [ KUBERNETES CLUSTER (cinescope) ]       [ LINUX PRODUCTION NODE ]          [ WINDOWS PRODUCTION NODE ]
       - TCP Port 8080 Check                     - check_ping (Host Alive)          - check_ping (Host Alive)
       - HTTP 200 OK Check                       - SSH Port 22 Service              - RDP Port 3389 Service
       - /healthz Probe Check                    - NRPE: CPU Load Average           - NCPA: CPU Utilization
       - ClusterIP Service :80                   - NRPE: Root Disk (/)              - NCPA: Memory (RAM) Usage
       - 3 Replica Pods (Auto-Healing)           - NRPE: Total Processes            - NCPA: C:\ Drive Free Space
```

---

## 3. Phase 1: Presenter Script & 10-Minute Demonstration Flow

Use this structured pitch when presenting to evaluators:

### ⏱️ Minute 0:00 - 1:30: The Introduction
> *"Good morning evaluators. Today, I am demonstrating our DevOps project titled **CineScope**. Our task addresses two critical real-world DevOps pillars: First, containerizing and orchestrating a modern web application using Kubernetes with 3 replicas for high availability, self-healing, and dynamic scaling. Second, solving the lack of centralized monitoring in production by implementing **Nagios** to monitor server health, critical services, and network ports across both Linux and Windows nodes."*

### ⏱️ Minute 1:30 - 3:00: Docker & Multi-Stage Build
> *"We built CineScope with React 18 and Vite. To follow enterprise cloud-native standards, we wrote a multi-stage Dockerfile. Stage 1 compiles the application in Node.js, and Stage 2 copies only the production bundle into an ultra-lean NGINX Alpine server. Notice that our production Docker image size is just 21 MB, minimizing attack surfaces and speeding up deployment."*

### ⏱️ Minute 3:00 - 5:30: Kubernetes Orchestration & Scaling
> *"Next, we deployed CineScope onto Kubernetes using Kustomize into a dedicated `cinescope` namespace. Our Deployment enforces 3 replicas, resource requests and limits, and active liveness and readiness probes hitting our NGINX `/healthz` endpoint. I will now demonstrate live horizontal scaling from 3 to 5 replicas, and showcase Kubernetes self-healing by deleting an active pod and watching Kubernetes restore the desired state instantly."*

### ⏱️ Minute 5:30 - 8:00: Nagios Centralized Monitoring
> *"Finally, to address production monitoring challenges, we configured Nagios Core. In our Nagios dashboard, we track: 1) CineScope's HTTP service and health probe; 2) A Linux worker node via NRPE for CPU, memory, and disk health; and 3) A Windows host for CPU, RAM, and drive utilization. I will now simulate a service outage and demonstrate how Nagios detects the failure, triggers an alert, and auto-recovers."*

### ⏱️ Minute 8:00 - 10:00: Q&A and Conclusion
> *"In conclusion, CineScope demonstrates a resilient, cloud-native architecture combining automated orchestration with proactive, centralized Nagios alerting. I am now open to your questions."*

---

## 4. Phase 2: Kubernetes Orchestration & Scaling Demo (Step-by-Step)

Follow these exact steps in your terminal during the demo:

### Step 2.1: Verify Pre-Requisites
```powershell
# Check installed tools
docker version
kubectl version --client
```

### Step 2.2: Build the Docker Image
Show the evaluator that the image is built using a multi-stage process:
```powershell
docker build -t cinescope-frontend:1.0 .
```
Show the compact image size:
```powershell
docker images cinescope-frontend:1.0
# Point out: Content size is only ~21MB!
```

### Step 2.3: Create or Connect to Local Kubernetes Cluster (`kind`)
If using kind:
```powershell
# Create cluster (if not already existing)
kind create cluster --name cinescope-cluster

# Load the local image into the kind node
kind load docker-image cinescope-frontend:1.0 --name cinescope-cluster
```

### Step 2.4: Deploy the Kubernetes Manifests
Apply the complete bundle declaratively using Kustomize:
```powershell
kubectl apply -k k8s/
```
Point out the resources created:
1. `namespace/cinescope`
2. `configmap/cinescope-nginx-config`
3. `service/cinescope-service`
4. `deployment.apps/cinescope-frontend`
5. `ingress.networking.k8s.io/cinescope-ingress`

### Step 2.5: Verify the 3-Replica Rollout
```powershell
# Watch rollout completion
kubectl rollout status deployment/cinescope-frontend -n cinescope

# List all 3 active pods
kubectl get pods -n cinescope -o wide
```
**Expected Output:**
```text
NAME                                  READY   STATUS    RESTARTS   AGE     IP           NODE
cinescope-frontend-6b876fc6d8-4pzkq   1/1     Running   0          45s     10.244.0.5   kind-control-plane
cinescope-frontend-6b876fc6d8-9m2vw   1/1     Running   0          45s     10.244.0.6   kind-control-plane
cinescope-frontend-6b876fc6d8-7r4tx   1/1     Running   0          45s     10.244.0.7   kind-control-plane
```

### Step 2.6: Inspect Liveness and Readiness Probes
Show the evaluator how Kubernetes monitors container vitality:
```powershell
kubectl describe pod -n cinescope -l app=cinescope-frontend | Select-String -Pattern "Liveness|Readiness|Limits|Requests"
```
Explain:
- **Liveness Probe**: Probes `http://localhost:80/healthz`. If NGINX hangs, Kubernetes restarts the container.
- **Readiness Probe**: Ensures traffic is only routed after the container is fully initialized.

### Step 2.7: Access the Application via Port-Forwarding
Forward host port 8080 to the ClusterIP Service:
```powershell
kubectl port-forward -n cinescope svc/cinescope-service 8080:80
```
Open your browser at **`http://localhost:8080`**:
- Demonstrate the **Hero Banner** (*Oppenheimer*).
- Demonstrate live **Movie Search** (type `Dune`).
- Demonstrate **Genre Filters** (click `Sci-Fi`).
- Click a movie card to open the **Movie Review Modal** with critic score, cast, and submit a live user review.

---

### Step 2.8: LIVE DEMO :: Dynamic Scaling (3 -> 5 Replicas)
Open a second terminal to demonstrate scaling:
```powershell
# 1. Scale deployment from 3 to 5 replicas
kubectl scale deployment cinescope-frontend -n cinescope --replicas=5

# 2. Watch Kubernetes spawn 2 additional pods immediately
kubectl get pods -n cinescope -l app=cinescope-frontend
```
Point out to the evaluator that Kubernetes horizontally scaled the workload in under 2 seconds.

Now scale back to the baseline of 3 replicas:
```powershell
kubectl scale deployment cinescope-frontend -n cinescope --replicas=3
kubectl get pods -n cinescope -l app=cinescope-frontend
```

---

### Step 2.9: LIVE DEMO :: Self-Healing & Fault Tolerance
Demonstrate what happens when a container dies or is terminated:
```powershell
# 1. List current pods
kubectl get pods -n cinescope

# 2. Manually kill one of the running pods
kubectl delete pod (kubectl get pods -n cinescope -o jsonpath='{.items[0].metadata.name}') -n cinescope

# 3. Immediately list pods again
kubectl get pods -n cinescope
```
**Talking Point:**
> *"Notice that as soon as pod 1 was deleted, the Kubernetes Deployment Controller detected a discrepancy between the desired state (3 replicas) and actual state (2 replicas). It immediately spawned a brand-new replacement pod in under 2 seconds, maintaining 100% service uptime."*

---

## 5. Phase 3: Nagios Centralized Monitoring Setup (Linux & Windows)

### Step 3.1: Launch Nagios Monitoring Server
To run a fully functioning Nagios Core dashboard instantly during your presentation, use the provided Docker Compose file or automation script:

```powershell
# Option A: Run the one-click automation script
.\scripts\start-monitoring.ps1
# (Linux/macOS: ./scripts/start-monitoring.sh)

# Option B: Run via Docker Compose directly
docker compose -f docker-compose.monitoring.yml up -d
```
- Open your browser at: **`http://localhost:8000`**
- Default Credentials:
  - **Username:** `nagiosadmin`
  - **Password:** `nagiosadmin`

*(If installing natively on an Ubuntu/Debian server, run `sudo apt update && sudo apt install -y nagios4 nagios-plugins-contrib nagios-nrpe-plugin`)*

---

### Step 3.2: Inspect Nagios Configuration Files
Show the evaluator the structured configuration files created inside the [`nagios/`](file:///c:/Users/kbrna/OneDrive/Desktop/Project/Movie%20Review%20App/nagios/) folder:

1. **[`nagios/cinescope.cfg`](file:///c:/Users/kbrna/OneDrive/Desktop/Project/Movie%20Review%20App/nagios/cinescope.cfg)**:
   - Monitors CineScope host IP / cluster endpoint.
   - **Service 1:** `check_tcp!8080` (Checks if TCP Port 8080 is listening).
   - **Service 2:** `check_http!-p 8080 -u /` (Checks for HTTP 200 OK landing page response).
   - **Service 3:** `check_http!-p 8080 -u /healthz -s "healthy"` (Verifies the Kubernetes probe string).

2. **[`nagios/linux-host.cfg`](file:///c:/Users/kbrna/OneDrive/Desktop/Project/Movie%20Review%20App/nagios/linux-host.cfg)**:
   - **Ping Check:** Host reachability and packet loss.
   - **SSH Check:** Port 22 availability.
   - **NRPE Checks:** CPU Load (`check_load`), Disk Space (`check_disk`), and Process Count (`check_total_procs`).

3. **[`nagios/windows-host.cfg`](file:///c:/Users/kbrna/OneDrive/Desktop/Project/Movie%20Review%20App/nagios/windows-host.cfg)**:
   - **Ping Check:** Host network connectivity.
   - **CPU Load Check:** `check_nt!CPULOAD!-l 5,80,90` (Warning at 80%, Critical at 90%).
   - **Memory Check:** `check_nt!MEMUSE!-w 80 -c 90` (RAM utilization).
   - **Disk Space Check:** `check_nt!USEDDISKSPACE!-l c -w 80 -c 90` (C: Drive capacity).
   - **RDP Check:** TCP Port 3389 for Remote Desktop connectivity.

---

### Step 3.3: How Linux Monitoring Works (NRPE Architecture)
Explain to the evaluator:
```text
[ Nagios Server ] --- (check_nrpe query on port 5666) ---> [ Linux Worker Node ]
                                                                  |
                                                                  v
                                                            [ NRPE Daemon ]
                                                                  |
                                              executes: check_load, check_disk, check_mem
```
- **Agent:** Install `nagios-nrpe-server` on Linux (`sudo apt install nagios-nrpe-server`).
- **Allowed Hosts:** Add the Nagios server IP to `/etc/nagios/nrpe.cfg` in `allowed_hosts`.
- **Command Definitions:** NRPE executes local plugins in `/usr/lib/nagios/plugins/` and returns exit codes (0 = OK, 1 = WARNING, 2 = CRITICAL).

---

### Step 3.4: How Windows Monitoring Works (NCPA / NSClient++)
Explain to the evaluator:
```text
[ Nagios Server ] --- (check_nt / HTTPS on port 5693 or 12489) ---> [ Windows Server ]
                                                                            |
                                                                            v
                                                                    [ NCPA / NSClient++ ]
                                                                            |
                                                    queries: Performance Counters, WMI, Disks
```
- **Agent:** Install **NCPA (Nagios Cross-Platform Agent)** or **NSClient++** MSI installer on Windows.
- **Port:** Listens securely on Port 5693 (NCPA) or 12489 (NSClient++).
- **Checks:** Queries Windows Performance Counters for CPU percent, Committed Memory bytes, and `C:\` logical drive free space.

---

## 6. Phase 4: Live Outage & Auto-Alert Simulation Demo

This is the most impressive part of your presentation. It proves that your monitoring solution actively detects failures!

### Step 4.1: Show Normal State (Green / OK)
- In the Nagios Web GUI (`http://localhost:8000`), navigate to **Services**.
- Show that `cinescope-app`, `linux-prod-node`, and `windows-prod-node` are in the **`OK (Green)`** state.

### Step 4.2: Simulate an Outage
You can either run the interactive simulation script or execute manual commands:

```powershell
# Option A: Run the interactive outage & recovery script
.\scripts\simulate-outage.ps1
# (Linux/macOS: ./scripts/simulate-outage.sh)

# Option B: Run manually
# Stop the port-forward in terminal 1 (Ctrl + C)
# OR temporarily scale deployment to 0:
kubectl scale deployment cinescope-frontend -n cinescope --replicas=0
```

### Step 4.3: Watch Nagios Detect the Failure
- In the Nagios GUI, click on **CineScope TCP Port 8080** and click **Re-schedule the next check of this service** (to trigger an immediate check).
- Within seconds, the state changes to:
  - 🟡 **WARNING / SOFT STATE** (Retrying attempt 1 of 3)
  - 🔴 **CRITICAL (Red)** — `Connection refused` or `HTTP 503 / Timeout`!
- **Talking Point:**
  > *"As you can see, within seconds of the service dropping, Nagios detected the failure without any human intervention and logged a CRITICAL alert. In production, this immediately fires an email or Slack alert to the on-call DevOps engineer."*

### Step 4.4: Restore the Service & Show Auto-Recovery
Now restore the service:
```powershell
kubectl scale deployment cinescope-frontend -n cinescope --replicas=3
```
- Re-run port forward if stopped:
  ```powershell
  kubectl port-forward -n cinescope svc/cinescope-service 8080:80
  ```
- In Nagios, re-trigger the check.
- The service turns **🟢 OK (Green)** with `HTTP/1.1 200 OK - 1309 bytes in 0.002 second response time`.

---

## 7. Phase 5: Top 10 Viva / Evaluator Q&A Cheat Sheet

Prepare these exact answers for questions professors commonly ask:

#### Q1: Why did you use a multi-stage Docker build instead of a single-stage build?
> **Answer:** *"A single-stage build retains the entire Node.js runtime, build tools, and `node_modules`, resulting in an image over 600 MB. Our multi-stage build uses Node only to build the static bundle, and copies only the compiled assets into an Alpine NGINX web server. This shrank the image to only 21 MB, dramatically reducing bandwidth, attack surfaces, and memory usage."*

#### Q2: What is the purpose of having 3 replicas in your Kubernetes Deployment?
> **Answer:** *"Three replicas provide High Availability (HA) and redundancy. If any individual pod or node crashes, the Kubernetes ClusterIP service continues routing traffic across the remaining healthy pods without downtime. It also allows zero-downtime rolling updates using `maxSurge: 1` and `maxUnavailable: 0`."*

#### Q3: What is the difference between a Liveness Probe and a Readiness Probe?
> **Answer:** *"A **Liveness Probe** checks if the container is still alive. If it fails, Kubernetes kills the pod and restarts it. A **Readiness Probe** checks if the container is ready to accept incoming user requests. If it fails, Kubernetes stops sending traffic to that pod via the Service, but does not restart it."*

#### Q4: Why did you mount `nginx.conf` via a Kubernetes ConfigMap?
> **Answer:** *"Using a ConfigMap decouples our web server configuration from the container image. If we need to update routing, modify caching headers, or add security headers in production, we can update the ConfigMap without rebuilding or pushing a new Docker image."*

#### Q5: How does Nagios monitor remote Linux servers?
> **Answer:** *"Nagios uses the **NRPE** (Nagios Remote Plugin Executor) add-on. The Nagios server uses the `check_nrpe` plugin to query the NRPE daemon running on the remote Linux host over port 5666. NRPE executes local plugins (like `check_load` or `check_disk`) and returns the exit status code back to the Nagios server."*

#### Q6: How does Nagios monitor Windows systems?
> **Answer:** *"Nagios monitors Windows machines using agents like **NCPA** (Nagios Cross-Platform Agent) or **NSClient++** running as Windows services. The Nagios server uses `check_nt` or HTTPS REST APIs to query Windows Performance Counters for CPU, RAM, disk space, and Windows service statuses."*

#### Q7: What are Nagios exit codes?
> **Answer:**
> - `0` = **OK** (Service normal - Green)
> - `1` = **WARNING** (Exceeded threshold, e.g., CPU > 80% - Yellow)
> - `2` = **CRITICAL** (Severe failure, e.g., service down or disk > 90% - Red)
> - `3` = **UNKNOWN** (Invalid command or agent unreachable - Orange)

#### Q8: What are Soft States and Hard States in Nagios?
> **Answer:** *"A **Soft State** occurs when a check fails for the first time; Nagios retries `max_check_attempts` times to prevent false alarms. Once the failure persists across all retry attempts, it transitions into a **Hard State**, at which point official alerts (email, SMS, pager) are dispatched."*

#### Q9: What is the role of the ClusterIP Service in your Kubernetes architecture?
> **Answer:** *"The ClusterIP service provides a stable virtual IP and internal DNS name (`cinescope-service`) for our pods. Because pod IP addresses are ephemeral and change whenever pods restart, the Service acts as a reverse proxy and round-robin load balancer across all ready pod endpoints."*

#### Q10: How does Nagios help achieve better MTTR (Mean Time to Resolution)?
> **Answer:** *"Without Nagios, failures are discovered only after users complain. Nagios continuously runs automated checks every few minutes. The moment a port or service fails, Nagios notifies administrators proactively, enabling engineers to fix the issue before end-users experience significant downtime."*

---

## 8. Phase 6: Safe Cleanup & Teardown

Once your demonstration is complete, cleanly stop all resources:

### Option A: Using the Automated Script
```powershell
# Windows PowerShell
.\scripts\cleanup.ps1

# Linux / macOS
./scripts/cleanup.sh
```

### Option B: Manual Commands
```powershell
# 1. Stop Nagios monitoring server
docker compose -f docker-compose.monitoring.yml down

# 2. Stop CineScope local compose (if running)
docker compose down

# 3. Delete Kubernetes resources
kubectl delete -k k8s/

# 4. Delete cinescope namespace
kubectl delete namespace cinescope

# 5. Delete kind cluster (optional)
kind delete cluster --name cinescope-cluster
```

---

### 🎉 Summary Checklist for a Flawless Demo:
- [x] Docker image built: `cinescope-frontend:1.0` (size ~21 MB).
- [x] Kubernetes Deployment running **3 replicas** in namespace `cinescope`.
- [x] Liveness & Readiness probes verified on `/healthz`.
- [x] Application accessible and interactive on `http://localhost:8080`.
- [x] Live Scaling (3 -> 5 -> 3 replicas) tested.
- [x] Self-Healing (kill pod -> auto-recreated) tested.
- [x] Nagios configuration files generated for CineScope, Linux, and Windows.
- [x] Live Outage and Alert Recovery demonstrated.
