# ADR-001: Port Manager Implementation

**Status:** 🟢 Accepted **Date:** 2025-10-20 **Deciders:** @team

## Context and Problem Statement

Need a centralized way to manage ports across dev/prod/test environments to avoid conflicts.

## Decision Drivers

- Prevent EADDRINUSE errors
- Easy port discovery
- Support multiple environments
- CLI-friendly

## Considered Options

1. Manual port assignment in .env files
2. Centralized Port Manager with JSON config
3. Docker port mapping only

## Decision Outcome

**Chosen option:** "Centralized Port Manager"

**Rationale:**

- Single source of truth for all ports
- Prevents conflicts automatically
- Easy to query via CLI
- Supports future scaling

## Pros and Cons

### Pros

✅ Centralized configuration ✅ Automatic conflict detection ✅ CLI tools for management ✅ Easy to
extend

### Cons

❌ Additional dependency ❌ Requires team training

## Implementation

Created `config/ports.json` with environment-based port ranges:

- Development: 3000-3999
- Production: 4000-4999
- Testing: 5000-5999

## Validation

- [x] Implemented in codebase
- [x] CLI tools created
- [x] Documentation updated
- [x] Team trained
