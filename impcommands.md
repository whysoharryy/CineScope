# 🚀 CineScope :: Essential Practical Demonstration Commands (`impcommands.md`)

This guide contains **only the essential commands** you need to execute during your practical demo, arranged in exact order with simple explanations and talking points for your evaluators.

---

## 📋 Quick Demonstration Checklist

| Step | What You Are Doing | Port / URL |
|---|---|---|
| **Step 1** | Check Docker & Kubernetes tools | Terminal |
| **Step 2** | Build CineScope Docker image | Terminal |
| **Step 3** | Create KinD cluster & load image | Terminal |
| **Step 4** | Deploy manifests to Kubernetes | Terminal |
| **Step 5** | Launch app & show website | `http://localhost:8080` |
| **Step 6** | Scale app live (3 → 5 → 3 pods) | Terminal |
| **Step 7** | Launch Nagios Monitoring | `http://localhost:8000` |
| **Step 8** | Kill pods (Outage) & Restore | `http://localhost:8080` & `8000` |
| **Step 9** | Cleanup cluster & containers | Terminal |

---

## 🛠️ Step 1: Verify Prerequisites

```bash
docker version
kubectl version --client
```
- **What it does:** Checks that Docker engine and the Kubernetes CLI (`kubectl`) are installed and running.
- **Why we run it:** Ensures the environment is ready before deploying any cluster or containers.
- **What to say:** *"First, we verify that our container runtime Docker and Kubernetes client are operational."*

---

## 🐳 Step 2: Build the Multi-Stage Docker Image

```bash
docker build -t cinescope-frontend:1.0 .
```
- **What it does:** Compiles the React application into static HTML/CSS/JS and packages it inside an NGINX Alpine container.
- **Why we run it:** Produces a lightweight, production-ready container image (~21 MB) using a multi-stage Dockerfile.
- **What to say:** *"We build our image using a multi-stage Dockerfile. Stage 1 builds the React code, and Stage 2 puts only the production assets into a secure NGINX Alpine container."*

---

## ☸️ Step 3: Setup Local Kubernetes Cluster & Load Image

```bash
# 1. Create the local KinD cluster (skip if already created)
kind create cluster --config kind-config.yaml --name cinescope-cluster

# 2. Check the cluster node status
kubectl get nodes

# 3. Load the local Docker image into the KinD cluster
kind load docker-image cinescope-frontend:1.0 --name cinescope-cluster
```
- **What it does:**
  - Creates a local single-node Kubernetes cluster inside Docker.
  - Checks that the node is in `Ready` state.
  - Directly transfers your local `cinescope-frontend:1.0` image into the KinD node so Kubernetes does not attempt to pull it from the public internet.
- **What to say:** *"We are using KinD (Kubernetes in Docker). Because KinD runs inside its own container, we load our local image directly into the node."*

---

## 📦 Step 4: Deploy CineScope to Kubernetes

```bash
# 1. Apply all Kubernetes manifests (Namespace, ConfigMap, Service, Deployment, Ingress)
kubectl apply -k k8s/

# 2. Inspect all created resources
kubectl get deploy,rs,svc -n cinescope
```
- **What it does:** Uses Kustomize (`-k`) to create the `cinescope` namespace, load the NGINX ConfigMap, start the 3-replica Deployment, and expose the ClusterIP Service.
- **Why we run it:** Deploys the full infrastructure declaratively with a single command.
- **What to say:** *"We apply our manifests declaratively using Kustomize. Kubernetes has created our dedicated namespace, deployed 3 replica pods, and exposed them through a ClusterIP service."*

---

## 🌐 Step 5: Expose & View the Web Application

```bash
# Launch background port-forwarding from host port 8080 to service port 80
kubectl port-forward -n cinescope svc/cinescope-service 8080:80 --address=0.0.0.0 &
```
- **What it does:** Bridges port `8080` on your machine to port `80` of the Kubernetes service inside the cluster.
- **Browser Action:** Open **`http://localhost:8080`** in your browser.
  - Show the **Hero Banner** (*Oppenheimer*).
  - Search for a movie (e.g., `Dune`).
  - Click a genre tag (e.g., `Sci-Fi`).
  - Open a movie modal and show critic reviews.
- **What to say:** *"By forwarding port 8080, traffic routes directly through the Kubernetes service to our 3 healthy frontend pods."*

---

## 📈 Step 6: LIVE DEMO 1 — Dynamic Scaling (3 → 5 → 3 Replicas)

```bash
# 1. Scale up from 3 to 5 replicas
kubectl scale deployment cinescope-frontend -n cinescope --replicas=5

# 2. Confirm 5 pods are running
kubectl get pods -n cinescope -l app=cinescope-frontend

# 3. Scale back down to 3 replicas
kubectl scale deployment cinescope-frontend -n cinescope --replicas=3

# 4. Confirm 3 pods are running
kubectl get pods -n cinescope -l app=cinescope-frontend
```
- **What it does:** Dynamically adds 2 pods to handle traffic surges, then scales back to 3 to save resources.
- **Why we run it:** Proves Kubernetes horizontal elasticity and zero-downtime scaling.
- **What to say:** *"Notice how Kubernetes scales up from 3 to 5 replicas in less than two seconds without interrupting any ongoing browser traffic."*

---

## 🖥️ Step 7: Launch Nagios Centralized Monitoring

```bash
docker compose -f docker-compose.monitoring.yml up -d
```
- **What it does:** Starts the Nagios Core container on port `8000`.
- **Browser Action:** Open **`http://localhost:8000`**
  - Username: `nagiosadmin`
  - Password: `nagiosadmin`
  - Click **Services** on the left menu.
  - Point out CPU load, memory usage, root disk space, PING latency, and active processes.
- **What to say:** *"To solve the lack of centralized infrastructure monitoring, we deployed Nagios Core to track system metrics, server connectivity, and network ports in real-time."*

---

## 💥 Step 8: LIVE DEMO 2 — Outage & Self-Healing

```bash
# 1. Simulate an outage: Scale pods down to 0
kubectl scale deployment cinescope-frontend -n cinescope --replicas=0

# 2. Confirm 0 pods are running
kubectl get pods -n cinescope
```
- **Browser Action:** Refresh `http://localhost:8080` → The application is down!
- **What to say:** *"We simulated a service crash by terminating all active pods. In production without monitoring, this downtime would go unnoticed."*

```bash
# 3. Auto-Recovery: Restore the 3 replicas
kubectl scale deployment cinescope-frontend -n cinescope --replicas=3

# 4. Verify pods are back in Running state (1/1)
kubectl get pods -n cinescope

# 5. If port-forward dropped during the outage, re-enable it:
kubectl port-forward -n cinescope svc/cinescope-service 8080:80 --address=0.0.0.0 &
```
- **Browser Action:** Refresh `http://localhost:8080` → CineScope is immediately back online!
- **What to say:** *"Kubernetes detected the desired state was 3 replicas, immediately spun up 3 new pods, and restored full application availability."*

---

## 🧹 Step 9: Teardown & Safe Cleanup

Run these when your presentation is finished:

```bash
# 1. Terminate background port-forwarding
pkill -f "kubectl port-forward"

# 2. Stop and remove Nagios container
docker compose -f docker-compose.monitoring.yml down

# 3. Delete the Kubernetes deployment, service, and namespace
kubectl delete -k k8s/

# 4. (Optional) Delete the KinD cluster
kind delete cluster --name cinescope-cluster
```
- **What it does:** Frees up host RAM, CPU, and network ports cleanly.
