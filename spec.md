# Specification

## Summary
**Goal:** Fix the "Failed to load" error appearing in the Poetry, Dua, and Songs sections by correcting backend query functions and frontend hooks/components.

**Planned changes:**
- Audit and fix `getAllPoetry`, `getAllDua`, and `getAllSongs` query functions in `backend/main.mo` to ensure correct signatures, return types, and stable variable access without trapping
- Fix `useGetAllPoetry`, `useGetAllDua`, and `useGetAllSongs` React Query hooks to call correct Motoko method names, properly map Candid fields to TypeScript types, and handle errors gracefully
- Fix `PoetryPage`, `DuaPage`, and `SongsPage` components to correctly handle loading, error, and success states based on actual data shapes from the fixed hooks
- Fix `MixPage` component to correctly aggregate data from all three hooks, showing unified feed when data is available and proper loading/error states

**User-visible outcome:** Poetry, Dua, and Songs sections (including the Mix feed) successfully load and display content instead of showing "Failed to load" errors.
