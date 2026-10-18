#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p .tools
case "$(uname -s)" in Darwin) os=darwin;; Linux) os=linux;; *) echo 'Use macOS or Linux.'; exit 1;; esac
case "$(uname -m)" in arm64|aarch64) arch=arm64;; x86_64) arch=amd64;; *) echo 'Unsupported CPU'; exit 1;; esac
curl -fsSL "https://kind.sigs.k8s.io/dl/v0.31.0/kind-$os-$arch" -o .tools/kind
curl -fsSL "https://kind.sigs.k8s.io/dl/v0.31.0/kind-$os-$arch.sha256sum" -o .tools/kind.sha256sum
expected=$(awk '{print $1}' .tools/kind.sha256sum)
actual=$(shasum -a 256 .tools/kind | awk '{print $1}')
test "$expected" = "$actual" || { echo 'kind checksum mismatch'; exit 1; }
curl -fsSL "https://dl.k8s.io/release/v1.35.0/bin/$os/$arch/kubectl" -o .tools/kubectl
curl -fsSL "https://dl.k8s.io/release/v1.35.0/bin/$os/$arch/kubectl.sha256" -o .tools/kubectl.sha256
test "$(cat .tools/kubectl.sha256)" = "$(shasum -a 256 .tools/kubectl | awk '{print $1}')" || { echo 'kubectl checksum mismatch'; exit 1; }
chmod +x .tools/kind .tools/kubectl
echo 'Installed checked kind v0.31.0 and kubectl v1.35.0 under .tools.'
