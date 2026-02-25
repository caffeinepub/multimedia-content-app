# Specification

## Summary
**Goal:** Fix the maintenance mode toggle in the admin panel so it works without errors.

**Planned changes:**
- Remove all authorization/identity checks from the `setMaintenanceMode` function in `backend/main.mo` so it accepts calls from any caller, and ensure the `stable` variable persists across upgrades without re-initializing to false.
- Update the `useSetMaintenanceMode` mutation hook in `frontend/src/hooks/useQueries.ts` to correctly call `actor.setMaintenanceMode(enabled)`, wrap it in a try/catch that throws a human-readable error, and invalidate the `maintenanceMode` query cache on success.
- Update the `onError` handler in `frontend/src/components/admin/UsersControlsPanel.tsx` to show only a friendly toast message ("Failed to update maintenance mode. Please try again.") instead of raw IC rejection details.

**User-visible outcome:** Clicking the maintenance mode toggle in the admin panel succeeds without showing an error, and the toggle immediately reflects the updated state with a success or user-friendly error toast.
