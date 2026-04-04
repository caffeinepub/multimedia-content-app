import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";
import { useInternetIdentity } from "./useInternetIdentity";

const ACTOR_QUERY_KEY = "actor";
const ADMIN_TOKEN_KEY = "caffeineAdminToken";

/** Read admin token from sessionStorage — safe, returns empty string if missing */
function readAdminToken(): string {
  try {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function useActor() {
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  // Track the admin token as state so the query key updates when PIN is entered
  const [adminToken, setAdminToken] = useState<string>(readAdminToken);

  // Listen for PIN entry event dispatched by PINAuthGuard
  useEffect(() => {
    const handler = () => {
      const token = readAdminToken();
      setAdminToken(token);
    };
    window.addEventListener("adminTokenChanged", handler);
    return () => window.removeEventListener("adminTokenChanged", handler);
  }, []);

  const actorQuery = useQuery<backendInterface>({
    // Include adminToken in the key so the actor is re-created when PIN is entered
    queryKey: [
      ACTOR_QUERY_KEY,
      identity?.getPrincipal().toString() ?? "anon",
      adminToken,
    ],
    queryFn: async () => {
      const actorOptions = identity
        ? { agentOptions: { identity } }
        : undefined;

      const actor = await createActorWithConfig(actorOptions);

      // Always initialize with the admin token if one is present.
      // For regular users this is a no-op (empty string / not called).
      // For admin users this grants full privileges.
      const token = readAdminToken();
      if (token) {
        await actor._initializeAccessControlWithSecret(token);
      }

      return actor;
    },
    staleTime: Number.POSITIVE_INFINITY,
    enabled: true,
  });

  // When the actor changes, invalidate all dependent queries
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
