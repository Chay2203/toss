#!/usr/bin/env bash
source "$(dirname "$0")/common.sh"
case "${1:-status}" in
 status) k get deployment,pods,service -o wide ;;
 logs) k logs -l app=coin-toss --tail=200 ;;
 rollback) k rollout undo deployment/coin-toss; k rollout status deployment/coin-toss --timeout=120s ;;
 evidence)
  node scripts/verify.mjs
  dir=$(ls -dt evidence/runs/*/ | head -1)
  k get deployment,pod,service -o json > "$dir/runtime.json"
  k logs -l app=coin-toss --tail=200 > "$dir/logs.jsonl"
  node scripts/check-trace.mjs "$dir"
  ;;
 fault)
  mkdir -p evidence/runs
  k set image deployment/coin-toss app=coin-toss:deliberately-missing
  if k rollout status deployment/coin-toss --timeout=20s; then echo 'Expected the missing image to fail'; exit 1; fi
  k get pods -l app=coin-toss -o wide > evidence/runs/failed-release.txt
  node scripts/verify.mjs
  k rollout undo deployment/coin-toss
  k rollout status deployment/coin-toss --timeout=120s
  echo 'Bad release rejected; original ready replicas remained available. Run evidence again.'
  ;;
 recover)
  old=$(k get pod -l app=coin-toss -o jsonpath='{.items[0].metadata.name}')
  k delete pod "$old" --wait=true
  k rollout status deployment/coin-toss --timeout=120s
  k get pods -l app=coin-toss -o wide
  echo 'Restart access.sh if its tunnel was attached to the deleted pod, then run evidence.'
  ;;
 *) echo 'Usage: bash scripts/ops.sh status|logs|evidence|fault|recover|rollback'; exit 1 ;;
esac
