---
name: check
description: Run TypeScript type checking and verify the project compiles
disable-model-invocation: true
allowed-tools: Bash
---

Run all checks on the codebase:

1. Run `npx tsc --noEmit` — TypeScript strict mode check
2. Report any errors with file paths and line numbers
3. If errors found, suggest fixes for each one
