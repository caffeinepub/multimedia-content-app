# Specification

## Summary
**Goal:** Fix two broken features in the admin panel's Users & Controls section: the maintenance mode toggle and the registered users list both fail due to admin actor initialization or authorization errors.

**Planned changes:**
- Fix the maintenance mode toggle in `UsersControlsPanel` by ensuring the admin actor is correctly initialized with admin credentials before calling `toggleMaintenanceMode`, and that the backend authorizes the admin caller properly
- Fix the registered users list by ensuring `getAllUsers` (or equivalent) is called via a correctly initialized admin actor with proper permissions so the user list loads successfully
- Ensure `toggleMaintenanceMode` and the user listing function in `backend/main.mo` properly authorize admin callers without rejection

**User-visible outcome:** Admin can toggle maintenance mode between "App is Live" and "Maintenance Mode" without errors, and the Registered Users section displays all users with working search and block/unblock actions.
