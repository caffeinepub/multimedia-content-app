# Specification

## Summary
**Goal:** Fix the Admin Panel users table to correctly display all registered users and add a "Search by Unique ID" filter bar above the table.

**Planned changes:**
- Fix `UsersControlsPanel` component to properly call `useGetAllUsers` hook so all registered users are fetched and displayed when the "Users & Controls" tab is active
- Ensure the users table renders each user's Name, Server, Unique Code, truncated Device ID, isBlocked status, and Block/Unblock buttons
- Add a loading skeleton while user data is being fetched
- Add an empty-state message "No users registered yet" when no users exist
- Ensure table data refreshes automatically after Block/Unblock actions invalidate the query cache
- Add a "Search by Unique ID" text input above the users table that filters rows client-side by Unique Code (case-insensitive), restoring all rows when cleared
- Verify and fix the backend `getAllUsers()` function in `main.mo` to reliably return all stored user records with correct fields (uniqueCode, deviceId, name, server, isBlocked) without trapping or rejecting

**User-visible outcome:** The admin can open the "Users & Controls" tab and see all registered users in the table, search/filter them by Unique ID using the new search bar, and block or unblock users with the table updating automatically.
