#!/usr/bin/env bash
source "$(dirname "$0")/common.sh"
test -z "$(git status --porcelain)" || { echo 'Commit changes before a source-traceable release.'; exit 1; }
npm ci --ignore-scripts
npm run check
npm test
version=$(git rev-parse HEAD)
if ! kind get clusters 2>/dev/null | grep -qx coin-toss; then
 kind create cluster --name coin-toss --image kindest/node:v1.35.0 --kubeconfig "$KUBECONFIG" --wait 120s
else
 kind export kubeconfig --name coin-toss --kubeconfig "$KUBECONFIG"
fi
docker build --build-arg "VERSION=$version" -t "coin-toss:$version" .
kind load docker-image "coin-toss:$version" --name coin-toss
kubectl kustomize k8s | sed "s|image: coin-toss:local|image: coin-toss:$version|" > .runtime/release.yaml
k apply -f .runtime/release.yaml
k rollout status deployment/coin-toss --timeout=120s
k annotate deployment/coin-toss "kubernetes.io/change-cause=source $version" --overwrite >/dev/null
echo 'Ready. Run bash scripts/access.sh and open http://localhost:3000.'
