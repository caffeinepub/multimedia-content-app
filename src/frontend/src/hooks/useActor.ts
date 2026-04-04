import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";
import { getSecretParameter } from "../utils/urlParams";
import { useInternetIdentity } from "./useInternetIdentity";

const ACTOR_QUERY_KEY = "actor";

/**
 * Reads the admin token from sessionStorage directly.
 * getSecretParameter only reads from the URL hash, so we need to also
 * check sessionStorage where PINAuthGuard stores it after PIN entry.
 */
function getAdminToken(): string | null {
  // First try URL hash (the canonical source)
  const fromHash = getSecretParameter("caffeineAdminToken");
  if (fromHash) return fromHash;
  // Fall back to sessionStorage (set by PINAuthGuard after PIN entry)
  try {
    return sessionStorage.getItem("caffeineAdminToken") || null;
  } catch {
    return null;
  }
}

export function useActor() {
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  // Listen for PIN entry so we can rebuild the actor with admin privileges
  useEffect(() => {
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: [ACTOR_QUERY_KEY] });
    };
    window.addEventListener("adminTokenChanged", handler);
    return () => window.removeEventListener("adminTokenChanged", handler);
  }, [queryClient]);

  const actorQuery = useQuery<backendInterface>({
    queryKey: [ACTOR_QUERY_KEY, identity?.getPrincipal().toString()],
    queryFn: async () => {
      const actorOptions = identity
        ? { agentOptions: { identity } }
        : undefined;

      const actor = await createActorWithConfig(actorOptions);

      // IMPORTANT: Only call _initializeAccessControlWithSecret when an actual
      // admin token is present. Calling it with an empty string causes the
      // canister to reject ALL subsequent calls (getAllPoetry, getAllDua, etc.),
      // which is why posts don't show up for regular users.
      const adminToken = getAdminToken();
      if (adminToken) {
        await actor._initializeAccessControlWithSecret(adminToken);
      }

      return actor;
    },
    staleTime: Number.POSITIVE_INFINITY,
    enabled: true,
  });

  // When the actor changes, invalidate dependent queries so content refreshes
  useEffect(() => {
    if (actorQuery.data) {
      queryClient.invalidateQueries({
        predicate: (query) => !query.queryKey.includes(ACTOR_QUERY_KEY),
      });
      queryClient.refetchQueries({
        predicate: (query) => !query.queryKey.includes(ACTOR_QUERY_KEY),
      });
    }
  }, [actorQuery.data, queryClient]);

  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching,
  };
}
