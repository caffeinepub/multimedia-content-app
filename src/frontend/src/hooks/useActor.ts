import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";
import { useInternetIdentity } from "./useInternetIdentity";

const ACTOR_QUERY_KEY = "actor";
const ADMIN_TOKEN_KEY = "caffeineAdminToken";

function getAdminToken(): string {
  try {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function useActor() {
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  // Track whether admin token is present so we can include it in the query key
  const [hasAdminToken, setHasAdminToken] = useState(() => !!getAdminToken());

  // Listen for the custom event dispatched by PINAuthGuard when PIN is entered
  useEffect(() => {
    const handleAdminTokenChanged = () => {
      const tokenNow = !!getAdminToken();
      setHasAdminToken(tokenNow);
      // Force actor query to re-run with the new token
      queryClient.invalidateQueries({ queryKey: [ACTOR_QUERY_KEY] });
      queryClient.refetchQueries({ queryKey: [ACTOR_QUERY_KEY] });
    };

    window.addEventListener("adminTokenChanged", handleAdminTokenChanged);
    return () => {
      window.removeEventListener("adminTokenChanged", handleAdminTokenChanged);
    };
  }, [queryClient]);

  const actorQuery = useQuery<backendInterface>({
    // Include hasAdminToken in the key so the query re-runs when token appears
    queryKey: [
      ACTOR_QUERY_KEY,
      identity?.getPrincipal().toString() ?? "anon",
      hasAdminToken,
    ],
    queryFn: async () => {
      const actorOptions = identity
        ? { agentOptions: { identity } }
        : undefined;

      const actor = await createActorWithConfig(actorOptions);

      // CRITICAL: Always initialize with admin token from sessionStorage if present
      const adminToken = getAdminToken();
      if (adminToken) {
        try {
          await actor._initializeAccessControlWithSecret(adminToken);
        } catch (err) {
          console.warn(
            "[useActor] _initializeAccessControlWithSecret failed:",
            err,
          );
        }
      }

      return actor;
    },
    staleTime: 5 * 60 * 1000, // 5 min — allows invalidation to trigger a refetch
    enabled: true,
  });

  // When the actor changes, invalidate dependent queries so they re-fetch
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
