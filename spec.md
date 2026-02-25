# Specification

## Summary
**Goal:** Fix the "Unauthorized: Only users can create songs" error by removing all caller identity and authorization checks from the backend create functions.

**Planned changes:**
- Remove all caller identity checks and authorization guards from the `createSong` function in `backend/main.mo`
- Remove all caller identity checks and authorization guards from the `createPoetry` function in `backend/main.mo`
- Remove all caller identity checks and authorization guards from the `createDua` function in `backend/main.mo`
- Ensure all three create functions accept calls from any caller, including anonymous identities

**User-visible outcome:** Uploading songs, poetry, and duas from the admin panel no longer shows any "Unauthorized" error — content is successfully persisted and retrievable.
