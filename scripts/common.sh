#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
export PATH="$ROOT/.tools:/Applications/Docker.app/Contents/Resources/bin:$PATH"
export KUBECONFIG="$ROOT/.runtime/kubeconfig"
mkdir -p .runtime
k(){ kubectl --context kind-coin-toss --kubeconfig "$KUBECONFIG" -n coin-toss "$@"; }
