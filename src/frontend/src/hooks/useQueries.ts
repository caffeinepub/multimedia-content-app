import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Dua, Poetry, Song, UserRecord } from "../backend";
import { useActor } from "./useActor";
import { useAdminActor } from "./useAdminActor";

// ─── Content Queries ─────────────────────────────────────────────────────────
// Aggressive refresh: staleTime=0 so data is always considered stale,
// refetchInterval=10s so the feed stays in sync with admin uploads.

export function useGetAllPoetry() {
  const { actor, isFetching } = useActor();
  return useQuery<Poetry[]>({
    queryKey: ["poetry"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllPoetry();
      } catch (_e: unknown) {
        throw new Error("Failed to load poetry");
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    refetchInterval: 10000,
    refetchIntervalInBackground: false,
  });
}

export function useGetAllDua() {
  const { actor, isFetching } = useActor();
  return useQuery<Dua[]>({
    queryKey: ["dua"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllDua();
      } catch (_e: unknown) {
        throw new Error("Failed to load dua");
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    refetchInterval: 10000,
    refetchIntervalInBackground: false,
  });
}

export function useGetAllSongs() {
  const { actor, isFetching } = useActor();
  return useQuery<Song[]>({
    queryKey: ["songs"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllSongs();
      } catch (_e: unknown) {
        throw new Error("Failed to load songs");
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    refetchInterval: 10000,
    refetchIntervalInBackground: false,
  });
}

export function useIncrementPoetryLike() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      try {
        return await actor.incrementPoetryLike(id);
      } catch (_e: unknown) {
        throw new Error("Failed to like poetry");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["poetry"] });
    },
  });
}

export function useIncrementDuaLike() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      try {
        return await actor.incrementDuaLike(id);
      } catch (_e: unknown) {
        throw new Error("Failed to like dua");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dua"] });
    },
  });
}

export function useIncrementSongLike() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      try {
        return await actor.incrementSongLike(id);
      } catch (_e: unknown) {
        throw new Error("Failed to like song");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
    },
  });
}

export function useCreatePoetry() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      input: Parameters<NonNullable<typeof actor>["createPoetry"]>[0],
    ) => {
      if (!actor) throw new Error("Actor not available");
      try {
        return await actor.createPoetry(input);
      } catch (e: any) {
        throw new Error(e?.message || "Failed to create poetry");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["poetry"] });
    },
  });
}

export function useCreateDua() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      input: Parameters<NonNullable<typeof actor>["createDua"]>[0],
    ) => {
      if (!actor) throw new Error("Actor not available");
      try {
        return await actor.createDua(input);
      } catch (e: any) {
        throw new Error(e?.message || "Failed to create dua");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dua"] });
    },
  });
}

export function useCreateSong() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      input: Parameters<NonNullable<typeof actor>["createSong"]>[0],
    ) => {
      if (!actor) throw new Error("Actor not available");
      try {
        return await actor.createSong(input);
      } catch (e: any) {
        throw new Error(e?.message || "Failed to create song");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
    },
  });
}

export function useDeletePoetry() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      try {
        return await actor.deletePoetry(id);
      } catch (_e: unknown) {
        throw new Error("Failed to delete poetry");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["poetry"] });
    },
  });
}

export function useDeleteDua() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      try {
        return await actor.deleteDua(id);
      } catch (_e: unknown) {
        throw new Error("Failed to delete dua");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dua"] });
    },
  });
}

export function useDeleteSong() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      try {
        return await actor.deleteSong(id);
      } catch (_e: unknown) {
        throw new Error("Failed to delete song");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
    },
  });
}

// ─── Maintenance Mode ─────────────────────────────────────────────────────────
// Poll every 10 seconds so the maintenance banner appears quickly.

export function useGetMaintenanceMode() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["maintenanceMode"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.getMaintenanceMode();
      } catch (_e: unknown) {
        throw new Error("Failed to load maintenance mode");
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    refetchInterval: 10000,
    refetchIntervalInBackground: false,
  });
}

export function useSetMaintenanceMode() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!actor)
        throw new Error("Actor not available. Please reload the page.");
      try {
        await actor.setMaintenanceMode(enabled);
      } catch (e: any) {
        throw new Error(
          e?.message || "Failed to update maintenance mode. Please try again.",
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenanceMode"] });
    },
  });
}

// ─── Users ────────────────────────────────────────────────────────────────────
// Poll the users list every 10 seconds in the admin panel.

export function useGetAllUsers() {
  const { actor, isFetching } = useAdminActor();

  return useQuery<UserRecord[]>({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor)
        throw new Error("Actor not available. Please reload the page.");
      try {
        return await actor.getAllUsers();
      } catch (e: any) {
        throw new Error(
          e?.message || "Failed to load users. Please try again.",
        );
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    refetchInterval: 10000,
    retry: 2,
    retryDelay: 1000,
  });
}

export function useBlockUser() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (uniqueCode: string) => {
      if (!actor) throw new Error("Actor not available");
      try {
        await actor.blockUser(uniqueCode);
      } catch (e: any) {
        throw new Error(e?.message || "Failed to block user");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

export function useUnblockUser() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (uniqueCode: string) => {
      if (!actor) throw new Error("Actor not available");
      try {
        await actor.unblockUser(uniqueCode);
      } catch (e: any) {
        throw new Error(e?.message || "Failed to unblock user");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

export function useRegisterUser() {
  const { actor, isFetching } = useActor();
  return useMutation({
    mutationFn: async ({
      name,
      server,
      deviceId,
    }: { name: string; server: string; deviceId: string }) => {
      if (isFetching)
        throw new Error(
          "Connecting to server, please try again in a moment...",
        );
      if (!actor)
        throw new Error(
          "Unable to connect to server. Please refresh and try again.",
        );
      try {
        return await actor.registerUser(name, server, deviceId);
      } catch (e: any) {
        const raw: string = e?.message || "";
        if (
          raw.includes("trap") ||
          raw.includes("IC0508") ||
          raw.includes("Reject")
        ) {
          throw new Error(
            "Registration failed. Please refresh the page and try again.",
          );
        }
        throw new Error(raw || "Registration failed. Please try again.");
      }
    },
  });
}

export function useGetUserByDeviceId(deviceId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<UserRecord | null>({
    queryKey: ["userByDeviceId", deviceId],
    queryFn: async () => {
      if (!actor || !deviceId) return null;
      try {
        return await actor.getUserByDeviceId(deviceId);
      } catch (_e: unknown) {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!deviceId,
    // Poll user record every 10 seconds so blocked status is picked up quickly
    staleTime: 0,
    refetchInterval: 10000,
    refetchIntervalInBackground: false,
  });
}
