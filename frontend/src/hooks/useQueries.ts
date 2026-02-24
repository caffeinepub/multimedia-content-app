import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Poetry, Dua, Song, CreatePoetryInput, CreateDuaInput, CreateSongInput } from '../backend';

function extractErrorMessage(err: unknown): string {
  const msg: string = (err as any)?.message || String(err);
  const trapMatch = msg.match(/Canister trapped explicitly: (.+)/);
  if (trapMatch) return trapMatch[1];
  return msg;
}

export function useGetAllPoetry() {
  const { actor, isFetching } = useActor();

  return useQuery<Poetry[]>({
    queryKey: ['poetry'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await actor.getAllPoetry();
        return Array.isArray(result) ? result : [];
      } catch (err: unknown) {
        throw new Error(extractErrorMessage(err));
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
    staleTime: 30_000,
  });
}

export function useGetAllDuas() {
  const { actor, isFetching } = useActor();

  return useQuery<Dua[]>({
    queryKey: ['duas'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await actor.getAllDuas();
        return Array.isArray(result) ? result : [];
      } catch (err: unknown) {
        throw new Error(extractErrorMessage(err));
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
    staleTime: 30_000,
  });
}

export function useGetAllSongs() {
  const { actor, isFetching } = useActor();

  return useQuery<Song[]>({
    queryKey: ['songs'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await actor.getAllSongs();
        return Array.isArray(result) ? result : [];
      } catch (err: unknown) {
        throw new Error(extractErrorMessage(err));
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
    staleTime: 30_000,
  });
}

export function useCreatePoetry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePoetryInput) => {
      if (!actor) throw new Error('Actor not available. Please refresh and try again.');
      try {
        return await actor.createPoetry(input);
      } catch (err: unknown) {
        throw new Error(extractErrorMessage(err));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poetry'] });
    },
  });
}

export function useCreateDua() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDuaInput) => {
      if (!actor) throw new Error('Actor not available. Please refresh and try again.');
      try {
        return await actor.createDua(input);
      } catch (err: unknown) {
        throw new Error(extractErrorMessage(err));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['duas'] });
    },
  });
}

export function useCreateSong() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSongInput) => {
      if (!actor) throw new Error('Actor not available. Please refresh and try again.');
      try {
        return await actor.createSong(input);
      } catch (err: unknown) {
        throw new Error(extractErrorMessage(err));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
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

export function useDeleteDua() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteDua(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['duas'] });
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
