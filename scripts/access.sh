#!/usr/bin/env bash
source "$(dirname "$0")/common.sh"
echo 'Open http://localhost:3000. Ctrl-C stops this tunnel; the cluster stays running.'
exec kubectl --context kind-coin-toss --kubeconfig "$KUBECONFIG" -n coin-toss port-forward --address 127.0.0.1 service/coin-toss 3000:3000
