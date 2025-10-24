# ADR-002: UI Link Refactoring Strategy

**Status:** 🟢 Accepted **Date:** 2025-10-24 **Deciders:** @team

## Context and Problem Statement

263 broken relative links found in subdirectory pages (admin/, auth/, shop/, etc.)

## Decision Drivers

- Maintainability
- No content duplication
- Single source of truth
- Easy navigation

## Considered Options

1. **Option A:** Refactor all to absolute paths (/pages/\*)
2. **Option B:** Create duplicate pages in each subdirectory
3. **Option C:** Hybrid (absolute for common, duplicates for specialized)

## Decision Outcome

**Chosen option:** "Option A - Absolute paths"

**Rationale:**

- No duplication of content
- Easier to maintain
- Single source of truth
- Clean architecture

## Pros and Cons

### Pros

✅ No content duplication ✅ Easy maintenance ✅ Clear information architecture ✅ ~50-100 edits
total

### Cons

❌ Requires editing ~50 HTML files ❌ Need script to automate

## Implementation Plan

1. Create refactoring script
2. Test on sample directory
3. Apply to all subdirectories
4. Re-run link validator
5. Verify zero errors

## Validation

- [ ] Script created
- [ ] Sample tested
- [ ] Full refactor complete
- [ ] Validation passed (0 errors)
