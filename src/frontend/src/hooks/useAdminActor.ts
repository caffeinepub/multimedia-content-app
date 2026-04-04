import { useActor } from "./useActor";

/**
 * useAdminActor — thin wrapper around useActor.
 *
 * The regular actor (useActor) already calls _initializeAccessControlWithSecret
 * with the caffeineAdminToken from sessionStorage, so it already carries admin
 * privileges when the PIN has been entered. There is no need for a separate
 * actor instance; we simply re-export the same actor under the admin alias so
 * that all admin-specific hooks and components continue to work without changes.
 */
export function useAdminActor() {
  const { actor, isFetching } = useActor();
  return { actor, isFetching };
}
