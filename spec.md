# Specification

## Summary
**Goal:** Fix the `/admin` route so that navigating directly to the admin URL (e.g., via a shared link) always renders the admin PIN auth guard, regardless of Internet Identity login state.

**Planned changes:**
- Update the router/Layout component so that the `/admin` route is excluded from the main app authentication redirect logic.
- Ensure the `/admin` route renders the `PINAuthGuard` component directly without requiring Internet Identity login first.
- All other protected routes retain their existing unauthenticated redirect behavior.

**User-visible outcome:** Anyone who receives a shared admin URL can open it and be presented with the admin PIN prompt, instead of being redirected to the main app or login page.
