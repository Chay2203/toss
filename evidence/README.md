# Verified local evidence

The simple Coin Toss project was actually run on local kind. The archived TaskHarbor work is not part of this submission.

| Check | Actual result |
|---|---|
| Assessed runtime source | `814dd8f8ab76d9e148a6913477c32d8a65bff991` |
| User journey | 50/50 HTTP requests succeeded; 31 Heads, 19 Tails |
| Client p95 latency | 3.04 ms in this short local exercise |
| Kubernetes | Two ready app pods; images and image IDs recorded |
| Logs and traces | Request record, HTTP span and coin-flip child span share the captured trace ID |
| Application tests | Both integration tests passed |
| Image scan | Trivy found zero HIGH/CRITICAL vulnerabilities in the assessed image |
| Secret scan | Gitleaks found no secrets in the scanned baseline/feature history |
| Bad release | Missing image entered ImagePullBackOff; original pods still served 50 successful tosses; rollout undo succeeded |
| Pod recovery | Deleted app pod was replaced; two ready replicas returned |
| Runtime security | UID 1000, read-only root, no API token mount, zero effective capabilities, no-new-privileges and seccomp |
| Admission | Restricted policy rejected an unsafe pod in server dry-run mode |

Raw results are in [verified/](verified/): journey.json, metrics.txt, runtime.json, logs.jsonl, trace.json, verified.json, tests.txt, scanner JSON, recovery/fault records, runtime-security.json and the screenshot. The scan/runtime journey uses source 814dd8f; fault, recovery and runtime-security checks were initially performed on ba8a0af, whose application/container/Kubernetes files are identical. The intervening change corrected only log collection. Preserve these actual source IDs.

A later commit adds evidence and viva notes; its fresh live-runtime evidence is kept under ignored evidence/runs. Run `bash scripts/ops.sh evidence` with access.sh running to recreate it. The command checks clean source/version equality, working tosses, p95, two ready image identities, logs and timed span correlation. Metrics and traces use the app itself; there is no separate dashboard or distributed tracing backend.

These local results were captured before the GitHub push. The configured remote is https://github.com/Chay2203/toss.git; a genuine hosted workflow result, PR and course submission must be checked separately. Short local checks are not an SLA/load test, and 31/19 does not imply an unfair coin. Counters reset per pod; browser totals reset on refresh. One kind node is not multi-node HA. Scanner findings can change as vulnerability databases change; rerun the hosted gate before submission. No credentials or kubeconfig are included in tracked evidence.

Commit-date metadata: on 18 October 2026, the user requested author/committer dates of 16 October for the active branches. This does not date the actual implementation or verification work. Original history is preserved at `evidence-original-history` and `baseline-original`; the raw evidence above retains its actual 18 October timestamps and original commit IDs.
