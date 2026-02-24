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
      return actor.getAllPoetry();
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

// ─── Dua ─────────────────────────────────────────────────────────────────────

export function useGetAllDua() {
  const { actor, isFetching } = useActor();
  return useQuery<Dua[]>({
    queryKey: ['dua'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDua();
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

// ─── Songs ────────────────────────────────────────────────────────────────────

export function useGetAllSongs() {
  const { actor, isFetching } = useActor();
  return useQuery<Song[]>({
    queryKey: ['songs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSongs();
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
    queryKey: ['userByDeviceId', deviceId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUserByDeviceId(deviceId);
    },
    enabled: !!actor && !isFetching && !!deviceId,
    refetchInterval: 15000,
  });
}

export function useGetMaintenanceMode() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['maintenanceMode'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.getMaintenanceMode();
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
      if (!actor) throw new Error('Actor not available');
      return actor.setMaintenanceMode(enabled);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceMode'] });
    },
  });
}

export function useGetAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRecord[]>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await actor.getAllUsers();
        return result;
      } catch (err: any) {
        // If unauthorized (anonymous actor), return empty array with error
        throw err;
      }
    },
    enabled: !!actor && !isFetching,
    retry: 1,
  });
}

export function useBlockUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (uniqueCode: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.blockUser(uniqueCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
}

export function useUnblockUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (uniqueCode: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unblockUser(uniqueCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
}
