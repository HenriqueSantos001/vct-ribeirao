#!/usr/bin/env bash
set -euo pipefail

assert_contains() {
  local file="$1"
  local pattern="$2"
  if ! rg -q --fixed-strings "$pattern" "$file"; then
    echo "FAIL: expected '$pattern' in $file" >&2
    exit 1
  fi
}

assert_not_contains() {
  local file="$1"
  local pattern="$2"
  if rg -q --fixed-strings "$pattern" "$file"; then
    echo "FAIL: unexpected '$pattern' in $file" >&2
    exit 1
  fi
}

assert_contains siteContent.js "https://cdn.santos-games.com/campeonatos/vct"
assert_contains siteContent.js "0c5595f6a6651e483fe757969d226380"
assert_contains index.html "https://embed.cloudflarestream.com/embed/sdk.latest.js"
assert_contains index.html "customer-henwoji2e791u0w5.cloudflarestream.com/0c5595f6a6651e483fe757969d226380/iframe"

assert_not_contains index.html "https://www.youtube.com/iframe_api"
assert_not_contains interactivity.js "YT.Player"
assert_not_contains siteContent.js "images/capa01.png"
assert_not_contains siteContent.js "images/sga-logo.png"

echo "cloudflare media checks passed"
