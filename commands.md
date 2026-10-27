# 🎬 CineScope :: Complete Terminal Demonstration Commands Cheat Sheet (`commands.md`)

> **Quick Reference Guide:** Run these exact commands in order in your WSL terminal for a flawless, 10-minute viva / evaluator demonstration.

---

## 📌 Demonstration Roadmap
1. [Phase 0: Environment Pre-Check & Cleanup](#phase-0-environment-pre-check--cleanup)
2. [Phase 1: Build & Package the Multi-Stage Docker Image](#phase-1-build--package-the-multi-stage-docker-image)
3. [Phase 2: Local Kubernetes Cluster Setup (`kind`)](#phase-2-local-kubernetes-cluster-setup-kind)
4. [Phase 3: Deploy CineScope to Kubernetes (Kustomize)](#phase-3-deploy-cinescope-to-kubernetes-kustomize)
5. [Phase 4: Live App Access & Verification (Port 8080)](#phase-4-live-app-access--verification-port-8080)
6. [Phase 5: LIVE DEMO 1 — Horizontal Pod Autoscaling (3 → 5 → 3)](#phase-5-live-demo-1--horizontal-pod-autoscaling-3--5--3)
7. [Phase 6: LIVE DEMO 2 — Automated Pod Self-Healing](#phase-6-live-demo-2--automated-pod-self-healing)
8. [Phase 7: Launch Centralized Nagios Monitoring (Port 8000)](#phase-7-launch-centralized-nagios-monitoring-port-8000)
9. [Phase 8: LIVE DEMO 3 — Outage Simulation & Auto-Alerting](#phase-8-live-demo-3--outage-simulation--auto-alerting)
10. [Phase 9: Teardown & Safe Cleanup](#phase-9-teardown--safe-cleanup)

---

## Phase 0: Environment Pre-Check & Cleanup
Make sure no lingering background processes or port forwardings are running:

```bash
# 1. Kill any existing port-forward processes
pkill -f "kubectl port-forward"

# 2. Verify Docker and Kubectl are accessible
docker version
kubectl version --client
```

---

## Phase 1: Build & Package the Multi-Stage Docker Image
Show the evaluator that CineScope uses a lightweight multi-stage build (React Vite → NGINX Alpine):

```bash
# 1. Build the production image (~21 MB)
docker build -t cinescope-frontend:1.0 .

# 2. Inspect the compact image size
docker images cinescope-frontend:1.0
```
> 🗣️ **Talking Point:** *"Notice that our production image is only ~21 MB because Stage 1 compiles the bundle with Node, and Stage 2 serves only static assets via lean NGINX Alpine."*

---

## Phase 2: Local Kubernetes Cluster Setup (`kind`)
Create the KinD cluster and load the local Docker image into the cluster node:

```bash
# 1. Create KinD cluster (skip if already created)
kind create cluster --config kind-config.yaml --name cinescope-cluster

# 2. Verify cluster node is Ready
kubectl get nodes

# 3. Load the local Docker image into KinD node container
kind load docker-image cinescope-frontend:1.0 --name cinescope-cluster
```

---

## Phase 3: Deploy CineScope to Kubernetes (Kustomize)
Deploy the full stack declaratively into the dedicated `cinescope` namespace:

```bash
# 1. Apply all Kubernetes manifests declaratively
kubectl apply -k k8s/

# 2. Watch the rolling deployment reach 3 of 3 ready replicas
kubectl rollout status deployment/cinescope-frontend -n cinescope

# 3. List all 3 running pods across the cluster
kubectl get pods -n cinescope -o wide

# 4. Show the Deployment, ReplicaSet, and Service resources
kubectl get deploy,rs,svc -n cinescope
```

---

## Phase 4: Live App Access & Verification (Port 8080)
Expose the ClusterIP service to your browser on port `8080`:

```bash
# 1. Launch port-forward in background
kubectl port-forward -n cinescope svc/cinescope-service 8080:80 --address=0.0.0.0 &
```

- 🌐 Open your browser at: **`http://localhost:8080`**
- **Demo Features to show evaluator:**
  1. Hero Banner (*Oppenheimer*).
  2. Search bar: type `Dune`.
  3. Genre filters: click `Sci-Fi` or `Action`.
  4. Click any movie card to open review modal and leave a live review.

---

## Phase 5: LIVE DEMO 1 — Horizontal Pod Autoscaling (3 → 5 → 3)
Demonstrate Kubernetes handling traffic surges by dynamically scaling replicas:

```bash
# 1. Scale up from 3 to 5 replicas
kubectl scale deployment cinescope-frontend -n cinescope --replicas=5

# 2. Watch 2 new pods spawn instantly in seconds
kubectl get pods -n cinescope -l app=cinescope-frontend

# 3. Scale back down to baseline of 3 replicas
kubectl scale deployment cinescope-frontend -n cinescope --replicas=3

# 4. Confirm graceful termination back to 3
kubectl get pods -n cinescope -l app=cinescope-frontend
```
> 🗣️ **Talking Point:** *"Kubernetes dynamically updated our replica count to 5 in under 2 seconds without dropping active user connections."*

---

## Phase 6: LIVE DEMO 2 — Automated Pod Self-Healing
Demonstrate fault tolerance when an active container crashes:

```bash
# 1. View current running pods
kubectl get pods -n cinescope

# 2. Kill/delete one active pod abruptly
kubectl delete pod $(kubectl get pods -n cinescope -o jsonpath='{.items[0].metadata.name}') -n cinescope

# 3. Immediately inspect pods again
kubectl get pods -n cinescope
```
> 🗣️ **Talking Point:** *"Notice that as soon as the pod was deleted, Kubernetes detected the difference between desired state (3) and actual state (2), and instantly spawned a replacement pod to restore 100% availability."*

---

## Phase 7: Launch Centralized Nagios Monitoring (Port 8000)
Launch the centralized Nagios Core dashboard container:

```bash
# 1. Start Nagios via Docker Compose
docker compose -f docker-compose.monitoring.yml up -d

# 2. Verify Nagios container is running healthy (Up)
docker ps --filter name=cinescope-nagios
```

- 🌐 Open your browser at: **`http://localhost:8000`**
- **Credentials:**
  - **Username:** `nagiosadmin`
  - **Password:** `nagiosadmin`
- In the left sidebar under **Current Status**, click **`Services`** to show the live metrics:
  - Host Alive (PING, latency, 0% packet loss)
  - CPU Load Average, Memory/Swap Usage, Root Partition Disk Space
  - Total Running Processes & User sessions

---

## Phase 8: LIVE DEMO 3 — Outage Simulation & Auto-Alerting
Simulate a production outage and show how Nagios alerts and recovers:

```bash
# 1. Simulate Outage: Scale CineScope pods down to 0
kubectl scale deployment cinescope-frontend -n cinescope --replicas=0

# 2. Confirm 0 pods running
kubectl get pods -n cinescope
```
- Refresh `http://localhost:8080` in your browser → App is unreachable!
- In **Nagios (`http://localhost:8000`)**, show that Nagios detects service unavailability.

```bash
# 3. Auto-Recovery: Scale back up to 3 replicas
kubectl scale deployment cinescope-frontend -n cinescope --replicas=3

# 4. Check all 3 pods are Running (1/1)
kubectl get pods -n cinescope

# 5. Restart port-forward if connection dropped
kubectl port-forward -n cinescope svc/cinescope-service 8080:80 --address=0.0.0.0 &
```
- Refresh `http://localhost:8080` → CineScope is back online!
- In Nagios (`http://localhost:8000`), service checks turn back to **🟢 OK (Green)**.

---

## Phase 9: Teardown & Safe Cleanup
When your presentation is finished, run these cleanup commands:

```bash
# 1. Stop background port-forward
pkill -f "kubectl port-forward"

# 2. Stop and remove Nagios monitoring container
docker compose -f docker-compose.monitoring.yml down

# 3. Delete the Kubernetes deployment and namespace
kubectl delete -k k8s/

# 4. (Optional) Delete local kind cluster when fully done
kind delete cluster --name cinescope-cluster
```

---

## 🛠️ Emergency Quick Fixes Cheat Sheet

| Symptom | Cause | One-Line Fix Command |
|---|---|---|
| `port 8080 already in use` | Old background port-forward running | `pkill -f "kubectl port-forward"` |
| `8000 refuses to connect` | Nagios container stopped | `docker compose -f docker-compose.monitoring.yml up -d` |
| `ImagePullBackOff` in KinD | Image not loaded into KinD node | `kind load docker-image cinescope-frontend:1.0 --name cinescope-cluster` |
| Pods stuck in `CrashLoopBackOff` | Rolling restart after fix | `kubectl rollout restart deployment/cinescope-frontend -n cinescope` |
