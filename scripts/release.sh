#!/usr/bin/env bash
source "$(dirname "$0")/common.sh"
version=${1:?Usage: release.sh source-sha /path/to/coin-toss-image.tar.gz}
archive=${2:?Supply the downloaded image archive}
[[ "$version" =~ ^[a-f0-9]{40}$ ]] || exit 1
test -z "$(git status --porcelain)" && test "$(git rev-parse HEAD)" = "$version" || { echo 'Check out the clean artifact source commit first'; exit 1; }
(cd "$(dirname "$archive")" && shasum -a 256 -c image.sha256)
docker load -i "$archive"
kind load docker-image "coin-toss:$version" --name coin-toss
kubectl kustomize k8s | sed "s|image: coin-toss:local|image: coin-toss:$version|" > .runtime/release.yaml
k apply -f .runtime/release.yaml
k rollout status deployment/coin-toss --timeout=120s
echo 'Released the checked image archive. Restart access.sh and run ops.sh evidence.'
