#!/usr/bin/env bash
# Compila el editor de enemigos («Enemigo-rpg») como aplicación estática en enemigos-editor/ (la abre el creador).
# Uso: tools/construir-editor-enemigos.sh RUTA_DEL_CLON_DEL_EDITOR
set -euo pipefail
ORIGEN="${1:?indica la ruta del clon de enemigo-rpg}"
AQUI="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ORIGEN"
npm install --no-audit --no-fund --legacy-peer-deps
npx vite build --base=./ --outDir "$AQUI/enemigos-editor" --emptyOutDir
echo "Editor compilado en $AQUI/enemigos-editor"
