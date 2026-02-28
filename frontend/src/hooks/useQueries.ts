import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useAdminActor } from './useAdminActor';
import type { Poetry, Dua, Song, UserRecord } from '../backend';

export function useGetAllPoetry() {
  const { actor, isFetching } = useActor();
  return useQuery<Poetry[]>({
    queryKey: ['poetry'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllPoetry();
      } catch (e: any) {
        throw new Error('Failed to load poetry');
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllDua() {
  const { actor, isFetching } = useActor();
  return useQuery<Dua[]>({
    queryKey: ['dua'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllDua();
      } catch (e: any) {
        throw new Error('Failed to load dua');
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllSongs() {
  const { actor, isFetching } = useActor();
  return useQuery<Song[]>({
    queryKey: ['songs'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllSongs();
      } catch (e: any) {
        throw new Error('Failed to load songs');
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIncrementPoetryLike() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.incrementPoetryLike(id);
      } catch (e: any) {
        throw new Error('Failed to like poetry');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poetry'] });
    },
  });
}

export function useIncrementDuaLike() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.incrementDuaLike(id);
      } catch (e: any) {
        throw new Error('Failed to like dua');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dua'] });
    },
  });
}

export function useIncrementSongLike() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.incrementSongLike(id);
      } catch (e: any) {
        throw new Error('Failed to like song');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
  });
}

export function useCreatePoetry() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Parameters<NonNullable<typeof actor>['createPoetry']>[0]) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.createPoetry(input);
      } catch (e: any) {
        throw new Error(e?.message || 'Failed to create poetry');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poetry'] });
    },
  });
}

export function useCreateDua() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Parameters<NonNullable<typeof actor>['createDua']>[0]) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.createDua(input);
      } catch (e: any) {
        throw new Error(e?.message || 'Failed to create dua');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dua'] });
    },
  });
}

export function useCreateSong() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Parameters<NonNullable<typeof actor>['createSong']>[0]) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.createSong(input);
      } catch (e: any) {
        throw new Error(e?.message || 'Failed to create song');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
  });
}

export function useDeletePoetry() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.deletePoetry(id);
      } catch (e: any) {
        throw new Error('Failed to delete poetry');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poetry'] });
    },
  });
}

export function useDeleteDua() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.deleteDua(id);
      } catch (e: any) {
        throw new Error('Failed to delete dua');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dua'] });
    },
  });
}

export function useDeleteSong() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.deleteSong(id);
      } catch (e: any) {
        throw new Error('Failed to delete song');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
  });
}

// getMaintenanceMode is a public query — use the regular actor (no admin required)
export function useGetMaintenanceMode() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['maintenanceMode'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.getMaintenanceMode();
      } catch (e: any) {
        throw new Error('Failed to load maintenance mode');
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetMaintenanceMode() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!actor) throw new Error('Admin actor not available. Please reload the page.');
      try {
        await actor.setMaintenanceMode(enabled);
      } catch (e: any) {
        const msg: string = e?.message || '';
        if (msg.includes('Unauthorized') || msg.includes('trap')) {
          throw new Error('Admin authorization failed. Please reload the page and try again.');
        }
        throw new Error('Failed to update maintenance mode. Please try again.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceMode'] });
    },
  });
}

export function useGetAllUsers() {
  const { actor, isFetching } = useAdminActor();
  // Include the admin token in the query key so the query re-runs when the
  // token changes (i.e. after the PIN is entered and the actor is refreshed).
  const adminToken = (() => {
    try {
      return sessionStorage.getItem('caffeineAdminToken') || '';
    } catch {
      return '';
    }
  })();

  return useQuery<UserRecord[]>({
    queryKey: ['allUsers', adminToken],
    queryFn: async () => {
      if (!actor) throw new Error('Admin actor not available. Please reload the page.');
      try {
        return await actor.getAllUsers();
      } catch (e: any) {
        const msg: string = e?.message || '';
        if (msg.includes('Unauthorized') || msg.includes('trap')) {
          throw new Error('Admin authorization failed. Please reload the page and try again.');
        }
        throw new Error('Failed to load users. Please try again.');
      }
    },
    // Only run when actor is ready AND the admin token is present
    enabled: !!actor && !isFetching && !!adminToken,
    retry: (failureCount, error: any) => {
      // Don't retry on authorization errors
      const msg: string = error?.message || '';
      if (msg.includes('authorization') || msg.includes('Unauthorized')) return false;
      return failureCount < 2;
    },
    retryDelay: 1500,
  });
}

export function useBlockUser() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (uniqueCode: string) => {
      if (!actor) throw new Error('Admin actor not available');
      try {
        await actor.blockUser(uniqueCode);
      } catch (e: any) {
        throw new Error('Failed to block user');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
}

export function useUnblockUser() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (uniqueCode: string) => {
      if (!actor) throw new Error('Admin actor not available');
      try {
        await actor.unblockUser(uniqueCode);
      } catch (e: any) {
        throw new Error('Failed to unblock user');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
}

export function useRegisterUser() {
  const { actor, isFetching } = useActor();
  return useMutation({
    mutationFn: async ({ name, server, deviceId }: { name: string; server: string; deviceId: string }) => {
      // Wait for actor to be ready if it's still initializing
      if (isFetching) throw new Error('Connecting to server, please try again in a moment...');
      if (!actor) throw new Error('Unable to connect to server. Please refresh and try again.');
      try {
        return await actor.registerUser(name, server, deviceId);
      } catch (e: any) {
        // Extract a clean error message
        const raw: string = e?.message || '';
        if (raw.includes('trap') || raw.includes('IC0508') || raw.includes('Reject')) {
          throw new Error('Registration failed. Please refresh the page and try again.');
        }
        throw new Error(raw || 'Registration failed. Please try again.');
      }
    },
  });
}

export function useGetUserByDeviceId(deviceId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<UserRecord | null>({
    queryKey: ['userByDeviceId', deviceId],
    queryFn: async () => {
      if (!actor || !deviceId) return null;
      try {
        return await actor.getUserByDeviceId(deviceId);
      } catch (e: any) {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!deviceId,
  });
}
