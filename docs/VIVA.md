# Viva guide — explain these six things

## 1. What did you build?

“A coin-toss website. The browser calls POST /api/toss. Node crypto.randomInt(2) chooses 0 or 1, which becomes Heads or Tails. It has no database because each toss is independent. Session counts live only in the browser.”

Show app/server.mjs and public/app.js. Do not claim a finite sequence must contain exactly 50% Heads; a fair generator can produce streaks.

## 2. How does it run on Kubernetes?

“Docker packages the same app and Node runtime. A Deployment maintains two identical pods. A ClusterIP Service gives them one stable network address and routes to ready pods. The ConfigMap holds ordinary environment settings. The pod needs no Secret because this app has no credentials.”

Show k8s/app.yaml. Startup gives the app time to initialize. Readiness controls traffic; liveness restarts an unresponsive process. Requests reserve scheduling resources; limits bound consumption. Deployment is suitable for replaceable stateless pods. No StatefulSet/PVC is needed. Two pods on one kind node are not protection against node failure.

## 3. How does a code change reach users?

“Commit → tests → source-tagged Docker image → scans → temporary Kubernetes deployment → real requests/evidence → downloadable image. After reviewing the passing run, I manually release the same archive to my laptop cluster. GitHub's runner cannot reach my laptop directly.”

Show ci.yml and scripts/up.sh/release.sh. Every image carries the full commit SHA, exposed by /version. A tag is a name that can technically be overwritten, so do not reuse it; runtime image IDs and archive checksums provide additional identity. A checksum checks integrity, not who authored an artifact. Manual release requires the exact clean source checkout. No hosted run exists before the student pushes.

## 4. What if a release fails?

“RollingUpdate keeps both old ready pods while starting one extra pod. A missing image never becomes ready, so old pods keep serving. I inspect events, undo the rollout, wait for ready replicas, and verify the original version and another toss.”

Run ops.sh fault. For a process/pod failure run ops.sh recover. Restart port-forward if it belonged to the deleted pod. Rollback changes the Deployment template; our app has no database state to reverse. If I edit the cluster manually, the next deployment reapplies source configuration to resolve drift.

## 5. How do you know it is healthy?

“Metrics summarize counts/latency, logs record requests, and traces time the HTTP request and its coin-flip operation. One trace ID links these records. verify.mjs makes 50 real requests, checks their running version and latency, and check-trace.mjs proves that the captured spans and ready pods match.”

Show evidence/verified/journey.json, trace.json, metrics.txt and runtime.json. The HTTP span is the parent of the coin.flip span. These are local application spans in JSON, not a distributed tracing backend. Tracing is deliberately simple because there is one process and no remote dependency. Metrics are per-pod; scraping one forwarded pod is not a cluster-wide total. A failed probe or 5xx response needs pod/event/log inspection and a real success check after fixing it. Fifty requests are a short demonstration, not an availability SLA or load test.

## 6. What security did you apply?

“Non-root user, read-only root filesystem, no privilege escalation, no capabilities, seccomp, limited resources, no mounted Kubernetes API token, and Restricted admission. The app has no credentials or private data. The pipeline scans secrets and known image vulnerabilities. The browser uses CSP and safe text output. Services are local, not public.”

Show Dockerfile, pod securityContext and scanner results. Don't say Secrets are encrypted just because Kubernetes supports them. We don't need a runtime Secret. Before public exposure add TLS, rate limiting, network enforcement and suitable operational controls. If user-specific saved history were added, add identity, per-user authorization and a database.

## Every marking criterion

| Criterion | Marks | Concrete coverage / what to show |
|---|---:|---|
| Kubernetes operation | 5 | Two ready pods, probes/resources/Service, deliberate stateless storage choice, recovery |
| CI/CD and releases | 5 | ci.yml; source-tagged image, archive/checksum, automatic temporary deployment and manual local release; rolling update/undo |
| Observability/reliability | 5 | /metrics, JSON requests and timed parent/child spans, 50 successful tosses/p95, response actions |
| Security | 5 | Runtime controls, no credentials needed, local exposure, pinned actions/base, actual Gitleaks/Trivy checks |
| Architecture/configuration | 5 | Tiny coherent request path, Deployment vs StatefulSet, Linux user/cgroups, Service DNS, Kustomize/ConfigMap |
| Verification/evidence | 10 | Actual source/version, ready pods/image IDs, working tosses, metrics/log/trace correlation, fault/recovery records |
| Submission/reviewability | 5 | Preserved baseline, one later PR, exact final SHA, reviewer access, usable README |
| **Project total** | **40** | All seven areas covered; no promised score |
| Understand implementation | 12 | Navigate and explain the six things above using live files |
| Decisions/tradeoffs | 12 | Why stateless, two replicas, no DB, local kind, rolling release, simple tracing and manual laptop promotion |
| Changed-condition reasoning | 6 | Predict, inspect evidence, fix one cause, verify user success |
| **Viva total** | **30** | Must be explained by you in your own words |

## Three changed-condition answers to rehearse

- **Need saved user toss history:** add a database, identity and authorization; keep API pods stateless; decide backup/retention. Explain why today's ephemeral counters are insufficient.
- **Need to survive a node failure:** use multiple nodes, spread replicas, a disruption budget and appropriate ingress; two replicas on one node cannot provide that guarantee.
- **Latency or error spike:** check real toss success, request status/duration logs, HTTP vs coin.flip spans, pod events and CPU/memory pressure. Fix the cause or undo the release, then repeat the journey and compare signals.

Cloud/Terraform and particular tools such as Helm/Argo CD are optional in the guide. The simpler design is deliberate. You only need to understand the tools actually used here.
