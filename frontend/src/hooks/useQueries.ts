import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Poetry, Dua, Song, CreatePoetryInput, CreateDuaInput, CreateSongInput } from '../backend';

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

export function useGetAllDuas() {
  const { actor, isFetching } = useActor();

  return useQuery<Dua[]>({
    queryKey: ['duas'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDuas();
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
      return actor.getAllSongs();
    },
    enabled: !!actor && !isFetching,
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
      } catch (err: any) {
        // Extract a clean error message from IC trap errors
        const msg: string = err?.message || String(err);
        const trapMatch = msg.match(/Canister trapped explicitly: (.+)/);
        if (trapMatch) throw new Error(trapMatch[1]);
        throw new Error(msg);
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
      } catch (err: any) {
        const msg: string = err?.message || String(err);
        const trapMatch = msg.match(/Canister trapped explicitly: (.+)/);
        if (trapMatch) throw new Error(trapMatch[1]);
        throw new Error(msg);
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
      } catch (err: any) {
        const msg: string = err?.message || String(err);
        const trapMatch = msg.match(/Canister trapped explicitly: (.+)/);
        if (trapMatch) throw new Error(trapMatch[1]);
        throw new Error(msg);
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
