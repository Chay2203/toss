# Coin Toss — simple DevOps final project

Click **Toss Coin** to get **Heads** or **Tails**. That is the entire application. It uses Node's `crypto.randomInt(2)`, has no application dependencies and no database. Browser counters reset on refresh. The DevOps setup demonstrates every required area without adding more application features.

## Understand it in one minute

```text
Browser → Kubernetes Service → one of two identical app pods → Heads or Tails
Git commit → tests → container → Kubernetes → working toss + evidence
One request → request log + HTTP span + coin-flip child span (same trace ID)
```

Only six things to explain: the app, Dockerfile, Kubernetes manifest, CI workflow, metrics/logs/traces, and rollback. [The viva guide maps all marks to these files](docs/VIVA.md).

## Run directly

Install Node.js 22+, then from this project folder:

```bash
npm ci --ignore-scripts
npm test
npm start
```

Open http://localhost:3000. Ctrl-C stops it. No account, token or database setup is needed. This is a public coin generator, so it has no private data or privileged user actions to authenticate.

## Run on Kubernetes

Prerequisites: Node 22+, npm, Git, curl, shasum, Docker Desktop/Engine running, about 3 GB available RAM. First setup needs network access. macOS and Linux are supported.

```bash
bash scripts/bootstrap.sh   # checksum-checked kind + kubectl in .tools/
bash scripts/up.sh          # test, build, deploy, wait for two ready pods
bash scripts/access.sh      # keep this terminal running
```

Open http://localhost:3000 and toss the coin. On macOS, double-click **START.command** for the up/access steps after tools are installed. Port 3000 must be free. The scripts always use the dedicated `kind-coin-toss` context and `.runtime/kubeconfig`, not another cluster. Stop direct `npm start` before using the same port for Kubernetes.

```bash
bash scripts/ops.sh status
bash scripts/ops.sh logs
bash scripts/ops.sh evidence
```

Evidence records 50 real tosses, source/version equality, two ready pods and image IDs, p95 latency, metrics, and correlated request/HTTP/coin-flip spans. It rejects a dirty working tree or a different deployed version.

## What each file does

| File | Explain this |
|---|---|
| `app/server.mjs` | HTTP routes, random coin result, health/version, metrics, JSON logs and timed spans |
| `public/` | One small page, one click handler, CSS; browser session counts only |
| `Dockerfile` | Digest-pinned Node image, copied app, non-root process; unused package tools removed |
| `k8s/app.yaml` | Two-replica Deployment, rolling release, probes, resource limits, ClusterIP and security |
| `k8s/kustomization.yaml` | Shared configuration; ConfigMap content hash triggers updates |
| `.github/workflows/ci.yml` | Tests, secret scan, image scan, local-cluster deployment, evidence/image artifact |
| `scripts/` | Repeatable setup, release, access, evidence and recovery commands |

## Release and recover

Every image is tagged with the full Git SHA and embeds that SHA at `/version`. `up.sh` requires committed source so a running result can be traced back to code. RollingUpdate uses maxUnavailable 0 and maxSurge 1: old ready pods stay until a replacement is ready.

```bash
bash scripts/ops.sh fault      # deliberate missing image; verify old pods still serve, then undo
bash scripts/ops.sh recover    # delete one app pod; Deployment recreates it
bash scripts/ops.sh rollback   # undo the most recent real release when needed
```

Restart access.sh if pod replacement disconnects its tunnel. A port-forward attaches to one pod; this is different from Service load balancing inside the cluster. Rollback restores the Deployment template. Since there is no persistent data or schema, there is no database migration to reverse. Reapply the intended source with up.sh after emergency edits to reconcile drift.

CI automatically deploys and checks a temporary kind cluster. A laptop's persistent cluster has a **manual release boundary**: inspect the passing Actions run, download/extract its image archive and checksum, check out that exact source SHA, then run:

```bash
bash scripts/release.sh <full-source-sha> /path/to/coin-toss-image.tar.gz
```

This promotes the built image without rebuilding. Hosted CI cannot reach the laptop directly. Do not claim a hosted workflow ran until you push and see its real result.

## Observe and respond

- `/metrics`: Prometheus-format request counts, Heads/Tails counts and latency histogram. Counters are per pod and reset on restart. They do not store every request in memory.
- `ops.sh logs`: JSON request records and actual timed spans. Use the response's X-Trace-Id to find its `http.request` and `coin.flip` spans; parent_span_id links them. Traces go to stdout because one tiny process needs no separate trace-storage service.
- `/healthz`: process responds; `/readyz`: process accepts traffic; `/version`: source identity.
- Lab targets: 100% of the 50-request exercise should succeed and p95 should be below 500 ms. If health fails, inspect pods/events/logs and roll back a bad image. If latency rises, inspect resource pressure and compare HTTP vs coin-flip time. Verify a real toss after recovery. No long-term SLA, dashboard, external paging, or distributed tracing backend is claimed.

## Security and scope

The pod runs as UID 1000 with read-only root, no privilege escalation, dropped capabilities, RuntimeDefault seccomp, resource limits and no Kubernetes service-account token mount. Restricted namespace admission enforces basic pod safety. Static assets use an allowlist and CSP; errors do not leak details. No credentials or personal data are needed. CI uses read-only permissions, pinned actions, Gitleaks history scanning, and a Trivy HIGH/CRITICAL application-image gate. The image's base digest is pinned; future patches need a reviewed update and rescan.

Access is loopback-only through a ClusterIP Service. No public ingress, TLS, enforced NetworkPolicy or multi-node high availability is claimed. Two replicas tolerate one app-pod failure, not failure of the one local node. No PVC is needed: tosses are independent; browser history and metrics are deliberately ephemeral. If saved user histories were required, add a database and revisit storage/authentication. Terraform/cloud, Helm, Argo CD, HPA and a monitoring stack are not required by the guide.

## End-to-end plan and submission

1. Preserve the original working app on main/baseline — done before changes.
2. Add the small app improvements and DevOps files on one branch.
3. Test, build, scan, deploy, verify a real toss, then demonstrate failure/recovery.
4. Keep actual evidence and rehearse the file walkthrough in [VIVA.md](docs/VIVA.md).
5. Later: push main, baseline and the improvement branch; open one PR; run hosted CI; fill your student ID and final links in [SUBMISSION.md](docs/SUBMISSION.md).

See [evidence/README.md](evidence/README.md) for actual local results. Coverage does not guarantee marks: evidence, reviewer access, and your own viva explanations complete the assessment.
