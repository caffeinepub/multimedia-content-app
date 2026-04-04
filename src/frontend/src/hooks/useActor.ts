import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";
import { useInternetIdentity } from "./useInternetIdentity";

const ACTOR_QUERY_KEY = "actor";
const ADMIN_TOKEN_KEY = "caffeineAdminToken";

export function useActor() {
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  // Track admin token version so the query key changes when the token is set
  const [adminTokenVersion, setAdminTokenVersion] = useState(() => {
    try {
      return sessionStorage.getItem(ADMIN_TOKEN_KEY) ? 1 : 0;
    } catch {
      return 0;
    }
  });

  // Listen for adminTokenChanged event dispatched by PINAuthGuard
  useEffect(() => {
    const handler = () => {
      setAdminTokenVersion((v) => v + 1);
    };
    window.addEventListener("adminTokenChanged", handler);
    return () => window.removeEventListener("adminTokenChanged", handler);
  }, []);

  const actorQuery = useQuery<backendInterface>({
    // Include adminTokenVersion in the key so a new actor is created after PIN entry
    queryKey: [
      ACTOR_QUERY_KEY,
      identity?.getPrincipal().toString() ?? "anon",
      adminTokenVersion,
    ],
    queryFn: async () => {
      const actorOptions = identity
        ? { agentOptions: { identity } }
        : undefined;

      const actor = await createActorWithConfig(actorOptions);

      // Read the token from sessionStorage at call time (not at hook creation time)
      let adminToken: string | null = null;
      try {
        adminToken = sessionStorage.getItem(ADMIN_TOKEN_KEY);
      } catch {
        // sessionStorage not available
      }

      if (adminToken) {
        await actor._initializeAccessControlWithSecret(adminToken);
      }

      return actor;
    },
    staleTime: Number.POSITIVE_INFINITY,
    enabled: true,
  });

  // When the actor changes, invalidate dependent queries
  useEffect(() => {
    if (actorQuery.data) {
      queryClient.invalidateQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        },
      });
      queryClient.refetchQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        },
      });
    }
  }, [actorQuery.data, queryClient]);

  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching,
  };
}
