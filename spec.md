# Specification

## Summary
**Goal:** Fix two broken admin panel features in the "Users & Controls" tab — the failed user listing and the failed maintenance mode toggle.

**Planned changes:**
- Fix the backend query for fetching registered users so it returns successfully, and update the frontend to correctly call and handle the response, eliminating the "Failed to load users. Please try again." error.
- Fix the backend mutation for toggling maintenance mode so it succeeds with proper authorization, and update the frontend to correctly call and handle the response, eliminating the "Failed to update maintenance mode. Please try again." error toast.
- Ensure the Maintenance Mode switch state and "App is Live" / maintenance active label reflect the actual backend state after a successful toggle.
- Show an appropriate empty state in the Registered Users section if no users are registered, instead of an error.

**User-visible outcome:** The admin panel's Users & Controls tab correctly loads and displays registered users with a working search field, and the Maintenance Mode toggle works without errors.
