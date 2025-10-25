#!/usr/bin/env bash
set -euo pipefail

# Simple pre/post validation for admin-panel/public/index.html
# Goal: ensure no JS snippets are leaked inside markup (e.g., within <aside>, <ul>, etc.)
# We detect suspicious tokens outside of <script> blocks.

FILE="$(dirname "$0")/../admin-panel/public/index.html"
FILE="$(realpath "$FILE")"

if [[ ! -f "$FILE" ]]; then
  echo "index.html not found at $FILE" >&2
  exit 1
fi

content=$(cat "$FILE")

# Remove everything inside <script>...</script> to analyze only markup
markup_only=$(echo "$content" | awk 'BEGIN{IGNORECASE=1} /<script/{inS=1} !inS{print} /<\/script>/{inS=0}')

fail=0

# Heuristics: these tokens should not appear in markup
for token in "ENVIRONMENTS_DEFAULT" "loadEnvConfig" "setEnvironment(" "getCurrentEnv(" "//"; do
  if echo "$markup_only" | grep -q "$token"; then
    echo "❌ Validation failed: token '$token' found in markup (outside <script>)." >&2
    fail=1
  fi
  # done intentionally inside the loop
  done

if [[ $fail -eq 0 ]]; then
  echo "✅ Admin Panel validation passed: no leaked JS in markup."
else
  echo "❌ Admin Panel validation failed. Please fix index.html before continuing." >&2
  exit 1
fi
