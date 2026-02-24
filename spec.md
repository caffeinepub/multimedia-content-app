# Specification

## Summary
**Goal:** Fix the backend authorization checks that are blocking the admin panel from toggling maintenance mode, loading users, and blocking/unblocking users.

**Planned changes:**
- Remove all caller identity/authorization checks from `setMaintenanceMode` in `backend/main.mo` so any caller (including anonymous) can invoke it without an "Unauthorized" error.
- Remove all caller identity/authorization checks from `getAllUsers` in `backend/main.mo` so it returns all user records to any caller without error.
- Remove all caller identity/authorization checks from `blockUser` and `unblockUser` in `backend/main.mo` so they can be called by any caller without an "Unauthorized" error.

**User-visible outcome:** The admin panel can successfully toggle Maintenance Mode, load and display the Registered Users table, and block/unblock users without any "Unauthorized" error messages.
