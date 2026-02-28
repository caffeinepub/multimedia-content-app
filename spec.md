# Specification

## Summary
**Goal:** Fix the "Failed to load users. Please try again." error in the UsersControlsPanel of the Dard-e-munasif admin panel.

**Planned changes:**
- Fix admin actor initialization in UsersControlsPanel to ensure the secret token is correctly set before calling the getAllUsers (or equivalent) backend query
- Ensure the admin authorization check passes so the registered users list loads successfully without an authorization rejection

**User-visible outcome:** When an authenticated admin opens the "Users & Controls" tab, the registered users list loads correctly instead of showing the "Failed to load users. Please try again." error. Maintenance mode toggle continues to work as before.
