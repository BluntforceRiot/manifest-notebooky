# Manifest Notebooky Package Verification

Generated: 2026-06-26 17:05 ET

This verifies the public review archive for cross-platform extraction. The
archive is built with `npm run package:review`, which writes POSIX-style ZIP
entries and rejects unsafe or non-portable paths before and after writing.

## Archive

- Package: `manifest-notebooky-review.zip`
- Final ZIP SHA-256: `058174f65007643cd2e810221989d87d8c23509f509c46056f5ba85dbaefff44`
- File entry count: 17
- Total central-directory entries: 21, including 4 clean directory entries
- Backslash paths: 0

## Required Cold-Extract Checks

- Cold extraction folder: `.tmp-package-cold-extract-20260626T1700`
- `npm ci`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS
- `npm audit --audit-level=moderate`: PASS, 0 vulnerabilities
- `npm run playtest`: PASS

## Entry Policy

The package script rejects entries containing backslashes, absolute paths, traversal paths, `node_modules`, `dist`, `.git`, `.vite`, coverage, cache/temp folders, old ZIPs, and `Instructions.txt`.

## Included Public Review Materials

- README, package files, TypeScript/Vite config, `src/`, `scripts/`
- `output/playwright/*.png` screenshots
- `BUILD_RECEIPT_MANIFEST_NOTEBOOKY.md`
- `BUILD_LOG_MANIFEST_NOTEBOOKY.txt`
- `PACKAGE_VERIFY_MANIFEST_NOTEBOOKY.md`

## Exclusions Confirmed

- `Instructions.txt`
- `node_modules/`
- `dist/`
- `.git/`
- `.vite/`
- coverage folders
- cache/temp folders
- old ZIPs
