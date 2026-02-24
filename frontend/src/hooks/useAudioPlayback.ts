import { useRef, useState, useCallback, useEffect } from 'react';
import { useWebAudioFilters, FilterMode } from './useWebAudioFilters';

export interface AudioTrack {
  id: string;
  title: string;
  artist?: string;
  audioUrl: string;
  category: string;
}

export interface AudioPlaybackState {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  filterMode: FilterMode;
  play: (track: AudioTrack) => void;
  pause: () => void;
  resume: () => void;
  togglePlayPause: (track?: AudioTrack) => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setFilterMode: (mode: FilterMode) => void;
  isTrackPlaying: (trackId: string) => boolean;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

// Singleton audio element for global playback
let globalAudioElement: HTMLAudioElement | null = null;

function getGlobalAudio(): HTMLAudioElement {
  if (!globalAudioElement) {
    globalAudioElement = new Audio();
    globalAudioElement.preload = 'metadata';
  }
  return globalAudioElement;
}

// Global state listeners
type Listener = () => void;
const listeners = new Set<Listener>();

function notifyListeners() {
  listeners.forEach((l) => l());
}

// Shared mutable state
const sharedState = {
  currentTrack: null as AudioTrack | null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
};

export function useAudioPlayback(): AudioPlaybackState {
  const [, forceUpdate] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { filterMode, setFilterMode, connectAudioElement } = useWebAudioFilters();
  const filterModeRef = useRef(filterMode);
  filterModeRef.current = filterMode;

  useEffect(() => {
    const audio = getGlobalAudio();
    audioRef.current = audio;

    const listener = () => forceUpdate((n) => n + 1);
    listeners.add(listener);

    const handleTimeUpdate = () => {
      sharedState.currentTime = audio.currentTime;
      notifyListeners();
    };
    const handleLoadedMetadata = () => {
      sharedState.duration = audio.duration;
      notifyListeners();
    };
    const handleEnded = () => {
      sharedState.isPlaying = false;
      notifyListeners();
    };
    const handlePlay = () => {
      sharedState.isPlaying = true;
      notifyListeners();
    };
    const handlePause = () => {
      sharedState.isPlaying = false;
      notifyListeners();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      listeners.delete(listener);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  const play = useCallback(
    (track: AudioTrack) => {
      const audio = getGlobalAudio();
      audioRef.current = audio;

      if (sharedState.currentTrack?.id !== track.id) {
        audio.src = track.audioUrl;
        sharedState.currentTrack = track;
        sharedState.currentTime = 0;
        sharedState.duration = 0;
      }

      // Connect to Web Audio API
      try {
        connectAudioElement(audio);
      } catch { /* ignore */ }

      audio.volume = sharedState.volume;
      audio.play().catch((err) => console.error('Playback error:', err));
    },
    [connectAudioElement]
  );

  const pause = useCallback(() => {
    const audio = getGlobalAudio();
    audio.pause();
  }, []);

  const resume = useCallback(() => {
    const audio = getGlobalAudio();
    audio.play().catch((err) => console.error('Resume error:', err));
  }, []);

  const togglePlayPause = useCallback(
    (track?: AudioTrack) => {
      if (track) {
        if (sharedState.currentTrack?.id === track.id) {
          if (sharedState.isPlaying) {
            pause();
          } else {
            resume();
          }
        } else {
          play(track);
        }
      } else {
        if (sharedState.isPlaying) {
          pause();
        } else {
          resume();
        }
      }
    },
    [play, pause, resume]
  );

  const seek = useCallback((time: number) => {
    const audio = getGlobalAudio();
    audio.currentTime = time;
    sharedState.currentTime = time;
    notifyListeners();
  }, []);

  const setVolume = useCallback((vol: number) => {
    const audio = getGlobalAudio();
    audio.volume = vol;
    sharedState.volume = vol;
    notifyListeners();
  }, []);

  const isTrackPlaying = useCallback((trackId: string) => {
    return sharedState.currentTrack?.id === trackId && sharedState.isPlaying;
  }, []);

  return {
    currentTrack: sharedState.currentTrack,
    isPlaying: sharedState.isPlaying,
    currentTime: sharedState.currentTime,
    duration: sharedState.duration,
    volume: sharedState.volume,
    filterMode,
    play,
    pause,
    resume,
    togglePlayPause,
    seek,
    setVolume,
    setFilterMode,
    isTrackPlaying,
    audioRef,
  };
}
