---
name: fix
description: Investigate and fix a bug
argument-hint: <bug description>
allowed-tools: Read, Glob, Grep, Bash, Edit, Write
context: fork
agent: bug-fixer
---

Investigate and fix the following bug: $ARGUMENTS

Follow your bug-fixing process:
1. Understand the expected vs actual behavior
2. Search the codebase for related code
3. Identify the root cause
4. Implement a minimal fix
5. Verify with `npx tsc --noEmit`
