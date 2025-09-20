#!/bin/bash
set -e

echo "=== Backing up current repo ==="
cp -r ./ ../Mycenic_backup_$(date +%Y%m%d_%H%M%S)

echo "=== Checking repo integrity ==="
git fsck --full || true

echo "=== Removing empty/corrupted objects ==="
find .git/objects -type f -empty -print -delete

echo "=== Running git garbage collection ==="
git gc --prune=now || true
git repack -ad || true

echo "=== Rechecking repo integrity ==="
git fsck --full || true

echo
echo "Done. If errors remain, check backup folder or reclone from remote."

