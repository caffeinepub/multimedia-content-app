# Dard-e-munasif

## Current State
- Full multimedia content platform with Poetry, Dua, Songs categories
- PIN-protected admin panel (PIN: 09186114) at /admin
- Mandatory login flow (name + server selection) storing deviceId + uniqueCode in localStorage
- Backend: Motoko with no auth checks on mutations (removed in v42)
- Frontend: `useActor` creates anonymous actor; calls `_initializeAccessControlWithSecret` only when Internet Identity is present
- **Root bug**: Admin mutations fail because anonymous actor never gets admin token initialized. The backend's `MixinAuthorization` still checks if the actor has been initialized with admin privileges via `_initializeAccessControlWithSecret` before allowing mutations.
- Users panel shows "Failed to load users" — `getAllUsers` is a public query but the actor initialization failure cascades
- Maintenance mode toggle errors for same reason
- Missing: comment system on posts, splash screen, unique ID shown on profile page, download for songs
- Post actions: like, share, copy exist. Comment is missing.

## Requested Changes (Diff)

### Add
- Comment system: users can comment on any post (poetry, dua, song). Backend stores comments linked to post ID and type. Frontend shows comment count, comment button, and comment thread in post modal/card.
- Splash screen: attractive premium animated splash shown on first app load before login screen
- Unique ID shown on user profile section (already partially in MixPage as UserIdentityCard — needs to be more prominent and shown as a proper "Profile" section)
- Song download: download button on SongPost that saves audio to IndexedDB and triggers browser download (same as DuaPost pattern)
- Per-user unique ID generation: already working (DM-N format), ensure it persists and shows correctly

### Modify
- **CRITICAL FIX**: `useActor` must always call `_initializeAccessControlWithSecret` with admin token when one is present in sessionStorage, regardless of Internet Identity state. This is the root fix for all admin failures.
- `useAdminActor` / `useActor`: After PIN entry, token stored in sessionStorage as `caffeineAdminToken`. The actor must be re-created with this token for ALL admin mutations to succeed.
- Admin panel: fix all three issues (upload posts, maintenance mode, load users) via the actor fix above
- User app UI: premium, professional, attractive redesign — dark/rich color scheme, glassmorphism cards, gradient accents, better typography hierarchy
- BanScreen: update message to exact required text
- MaintenanceScreen: add Refresh button that re-checks status
- SongPost: add Download button (same pattern as DuaPost)
- Post cards: add Comment button and count in action bar
- Admin panel: add comment viewing/moderation in ContentManagement

### Remove
- Nothing removed

## Implementation Plan
1. Regenerate Motoko backend to add comment types and functions (addComment, getComments per post)
2. Fix useActor.ts: always call _initializeAccessControlWithSecret when caffeineAdminToken is in sessionStorage, even for anonymous identity
3. Add SplashScreen component shown on initial app load (3 seconds, then redirects)
4. Add comment functionality to all post components (PoetryPost, DuaPost, SongPost) and modals
5. Add download button to SongPost
6. Redesign user-facing UI to premium/professional aesthetic
7. Update BanScreen message to exact required text
8. Add Refresh button to MaintenanceScreen
9. Wire new backend comment APIs in useQueries.ts
