# Actual evidence

Run `bash scripts/ops.sh evidence` with access.sh running. It creates an ignored timestamped evidence/runs directory containing actual source/version, 50 toss results, latency, metrics, Kubernetes pods/image IDs, request logs and correlated HTTP/coin-flip spans. It requires a clean source tree and source/runtime equality.

Selected real results will be placed under evidence/verified. Later evidence-only commits can differ from the tested source; never edit captured hashes to hide that difference. No GitHub run/PR exists until you push. No credentials, kubeconfig or personal data belong in published evidence.

Metrics and traces intentionally use the app itself, without a separate dashboard or trace backend. Session counts are ephemeral, metrics reset per pod, and local kind is one node. Targets are short lab checks, not a production SLA. See docs/VIVA.md for the marking map and README for operations.
