#!/usr/bin/env bash
# Odtwarza subsety Monument (WOFF2) — wymaga Python 3 + venv w katalogu głównym (.venv-tools, gitignored).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
python3 -m venv .venv-tools
.venv-tools/bin/pip install -q fonttools brotli zopfli
UNICODES='0020-007E,00A0-00FF,0100-017F,2013,2014,2026,20AC'
.venv-tools/bin/pyftsubset public/fonts/MonumentExtended-Ultrabold.woff \
  --output-file=public/fonts/MonumentExtended-Ultrabold.subset.woff2 \
  --flavor=woff2 --layout-features='*' --unicodes="$UNICODES"
.venv-tools/bin/pyftsubset public/fonts/MonumentExtended-Regular.woff \
  --output-file=public/fonts/MonumentExtended-Regular.subset.woff2 \
  --flavor=woff2 --layout-features='*' --unicodes="$UNICODES"
ls -la public/fonts/*.subset.woff2
echo "OK. Usuń .venv-tools jeśli nie potrzebujesz: rm -rf .venv-tools"
