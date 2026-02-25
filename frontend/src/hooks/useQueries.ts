import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Poetry, Dua, Song, UserRecord } from '../backend';

// ─── Poetry ──────────────────────────────────────────────────────────────────

export function useGetAllPoetry() {
  const { actor, isFetching } = useActor();
  return useQuery<Poetry[]>({
    queryKey: ['poetry'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllPoetry();
      } catch {
        throw new Error('Failed to load poetry. Please try again.');
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreatePoetry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; content: string; image?: any }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPoetry(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poetry'] });
    },
  });
}

export function useDeletePoetry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deletePoetry(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poetry'] });
    },
  });
}

export function useIncrementPoetryLike() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.incrementPoetryLike(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poetry'] });
    },
  });
}

// ─── Dua ─────────────────────────────────────────────────────────────────────

export function useGetAllDua() {
  const { actor, isFetching } = useActor();
  return useQuery<Dua[]>({
    queryKey: ['dua'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllDua();
      } catch {
        throw new Error('Failed to load duas. Please try again.');
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateDua() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; content: string; audio?: any }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createDua(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dua'] });
    },
  });
}

export function useDeleteDua() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteDua(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dua'] });
    },
  });
}

export function useIncrementDuaLike() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.incrementDuaLike(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dua'] });
    },
  });
}

// ─── Songs ────────────────────────────────────────────────────────────────────

export function useGetAllSongs() {
  const { actor, isFetching } = useActor();
  return useQuery<Song[]>({
    queryKey: ['songs'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllSongs();
      } catch {
        throw new Error('Failed to load songs. Please try again.');
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateSong() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; artist: string; audio: any }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createSong(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
  });
}

export function useDeleteSong() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteSong(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
  });
}

export function useIncrementSongLike() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.incrementSongLike(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
  });
}

// ─── User Management ─────────────────────────────────────────────────────────

export function useRegisterUser() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      name,
      server,
      deviceId,
    }: {
      name: string;
      server: string;
      deviceId: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerUser(name, server, deviceId);
    },
  });
}

export function useGetUserByDeviceId(deviceId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<UserRecord | null>({
    queryKey: ['user', deviceId],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getUserByDeviceId(deviceId);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!deviceId,
  });
}

export function useGetMaintenanceMode() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['maintenanceMode'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.getMaintenanceMode();
      } catch {
        throw new Error('Failed to load maintenance mode. Please try again.');
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000,
  });
}

export function useSetMaintenanceMode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!actor) throw new Error('Failed to update maintenance mode. Please try again.');
      try {
        await actor.setMaintenanceMode(enabled);
      } catch {
        throw new Error('Failed to update maintenance mode. Please try again.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceMode'] });
    },
  });
}

export function useGetAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRecord[]>({
    queryKey: ['users'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllUsers();
      } catch {
        throw new Error('Failed to load users. Please try again.');
      }
    },
    enabled: !!actor && !isFetching,
    retry: 2,
    retryDelay: 1000,
  });
}

export function useBlockUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (uniqueCode: string) => {
      if (!actor) throw new Error('Failed to block user. Please try again.');
      try {
        await actor.blockUser(uniqueCode);
      } catch {
        throw new Error('Failed to block user. Please try again.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUnblockUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (uniqueCode: string) => {
      if (!actor) throw new Error('Failed to unblock user. Please try again.');
      try {
        await actor.unblockUser(uniqueCode);
      } catch {
        throw new Error('Failed to unblock user. Please try again.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
