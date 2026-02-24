# Specification

## Summary
**Goal:** Fix the broken content fetch pipeline for Poetry, Dua, and Songs so all three sections load successfully instead of showing "failed to load content."

**Planned changes:**
- Audit and fix the backend Motoko query functions (`getAllPoetry`, `getAllDua`, `getAllSongs`) to ensure correct signatures, return types, and no trapping or authorization errors
- Fix the `useGetAllPoetry`, `useGetAllDua`, and `useGetAllSongs` React Query hooks in `useQueries.ts` to call the correct backend method names and properly transform Motoko record fields to frontend TypeScript types
- Add graceful error handling to the hooks so failures show a user-friendly error state with a retry option instead of crashing the UI
- Fix `PoetryPage`, `DuaPage`, and `SongsPage` components to correctly trigger loading, error, and empty states based on the actual data shapes returned by the fixed hooks
- Ensure `MixPage` also renders all three content types correctly after the fixes

**User-visible outcome:** Poetry, Dua, and Songs pages load their content successfully; empty arrays show an empty state, real failures show a friendly error with retry, and loading skeletons display while fetching.
