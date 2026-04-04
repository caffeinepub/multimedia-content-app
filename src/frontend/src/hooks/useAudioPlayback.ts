import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

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
  isPermissionDenied: boolean;
  play: (track: AudioTrack) => void;
  pause: () => void;
  resume: () => void;
  togglePlayPause: (track?: AudioTrack) => void;
  seek: (time: number) => void;
  isTrackPlaying: (trackId: string) => boolean;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

// Singleton audio element for global playback
let globalAudioElement: HTMLAudioElement | null = null;

function getGlobalAudio(): HTMLAudioElement {
  if (!globalAudioElement) {
    globalAudioElement = new Audio();
    globalAudioElement.preload = "auto";
    // ALWAYS force unmuted and full volume — never read from state/storage
    globalAudioElement.muted = false;
    globalAudioElement.volume = 1.0;
    // Route to media/music stream (Safari/iOS AirPlay compatibility)
    globalAudioElement.setAttribute("x-webkit-airplay", "allow");
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
  isPermissionDenied: false,
};

// Wake Lock management
let wakeLockSentinel: WakeLockSentinel | null = null;

async function acquireWakeLock(): Promise<void> {
  try {
    if ("wakeLock" in navigator) {
      wakeLockSentinel = await (navigator as any).wakeLock.request("screen");
    }
  } catch {
    // Wake Lock not supported or denied — silently ignore
  }
}

async function releaseWakeLock(): Promise<void> {
  try {
    if (wakeLockSentinel) {
      await wakeLockSentinel.release();
      wakeLockSentinel = null;
    }
  } catch {
    // Silently ignore release errors
  }
}

// Buffer check timeout reference
let bufferCheckTimeout: ReturnType<typeof setTimeout> | null = null;

function clearBufferCheck() {
  if (bufferCheckTimeout !== null) {
    clearTimeout(bufferCheckTimeout);
    bufferCheckTimeout = null;
  }
}

function startBufferCheck(audio: HTMLAudioElement) {
  clearBufferCheck();
  bufferCheckTimeout = setTimeout(() => {
    if (audio.buffered.length === 0 && !audio.paused) {
      toast.error("Audio data not found.");
    }
  }, 5000);
}

// Check audio/media permissions using the Web Permissions API
async function checkAudioPermission(): Promise<boolean> {
  try {
    if (!navigator.permissions) return true; // API not supported — assume allowed
    // Try querying autoplay permission (Chrome/Edge support this)
    const result = await (navigator.permissions as any).query({
      name: "autoplay",
    });
    if (result.state === "denied") {
      sharedState.isPermissionDenied = true;
      notifyListeners();
      return false;
    }
    sharedState.isPermissionDenied = false;
    notifyListeners();
    return true;
  } catch {
    // Permission query not supported for this name — assume allowed
    return true;
  }
}

// Request audio focus by resuming/creating an AudioContext
let audioContext: AudioContext | null = null;

async function requestAudioFocus(): Promise<void> {
  try {
    if (!audioContext) {
      audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
    }
    if (audioContext.state !== "running") {
      console.log("Audio focus requested");
      await audioContext.resume();
    }
  } catch {
    // AudioContext not supported or resume failed — silently ignore
  }
}

// Set MediaSession metadata for OS media routing (routes to media/music stream)
function setMediaSessionMetadata(track: AudioTrack): void {
  try {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist || "",
        album: track.category || "",
      });
    }
  } catch {
    // MediaSession API not supported — silently ignore
  }
}

function setMediaSessionPlaybackState(state: MediaSessionPlaybackState): void {
  try {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = state;
    }
  } catch {
    // Silently ignore
  }
}

export function useAudioPlayback(): AudioPlaybackState {
  const [, forceUpdate] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      clearBufferCheck();
      releaseWakeLock();
      setMediaSessionPlaybackState("none");
      notifyListeners();
    };
    const handlePlay = () => {
      sharedState.isPlaying = true;
      notifyListeners();
    };
    const handlePause = () => {
      sharedState.isPlaying = false;
      clearBufferCheck();
      releaseWakeLock();
      setMediaSessionPlaybackState("paused");
      notifyListeners();
    };
    const handlePlaying = () => {
      // Audio is actually playing — clear the buffer check timeout
      clearBufferCheck();
    };
    const handleStalled = () => {
      toast.error("Audio data not found.");
    };
    const handleVolumeChange = () => {
      // Enforce: never allow muted or volume < 1.0
      if (audio.muted) {
        audio.muted = false;
      }
      if (audio.volume < 1.0) {
        audio.volume = 1.0;
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("stalled", handleStalled);
    audio.addEventListener("volumechange", handleVolumeChange);

    // Run permission check on mount
    checkAudioPermission();

    return () => {
      listeners.delete(listener);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("stalled", handleStalled);
      audio.removeEventListener("volumechange", handleVolumeChange);
      // Release wake lock on unmount
      releaseWakeLock();
    };
  }, []);

  const play = useCallback(async (track: AudioTrack) => {
    // Permission guard — do not attempt playback if denied
    const allowed = await checkAudioPermission();
    if (!allowed) {
      toast.error(
        "Please allow audio permissions in settings to hear the music.",
      );
      return;
    }

    const audio = getGlobalAudio();
    audioRef.current = audio;

    if (sharedState.currentTrack?.id !== track.id) {
      // Set src BEFORE play — assign correct URL
      audio.src = track.audioUrl;
      // ALWAYS force unmuted and full volume — never read from any state/storage
      audio.muted = false;
      audio.volume = 1.0;
      sharedState.currentTrack = track;
      sharedState.currentTime = 0;
      sharedState.duration = 0;
    }

    // Request audio focus from the OS (simulates Android AudioFocus)
    await requestAudioFocus();

    // Force volume and mute state unconditionally before every play
    audio.muted = false;
    audio.volume = 1.0;

    // Set MediaSession metadata so OS routes audio to media/music stream
    setMediaSessionMetadata(track);

    try {
      await audio.play();
      // After play() resolves, mark playback state in OS media session
      setMediaSessionPlaybackState("playing");
      // Start buffer health check after play() resolves
      startBufferCheck(audio);
      // Acquire wake lock to prevent device sleep during playback
      await acquireWakeLock();
    } catch (err: any) {
      if (err?.name === "NotAllowedError") {
        // Autoplay blocked — user needs to interact first
        sharedState.isPermissionDenied = true;
        notifyListeners();
        toast.error(
          "Please allow audio permissions in settings to hear the music.",
        );
      } else {
        console.error("Playback error:", err);
      }
    }
  }, []);

  const pause = useCallback(() => {
    const audio = getGlobalAudio();
    audio.pause();
    clearBufferCheck();
    releaseWakeLock();
    setMediaSessionPlaybackState("paused");
  }, []);

  const resume = useCallback(async () => {
    // Permission guard — do not attempt playback if denied
    const allowed = await checkAudioPermission();
    if (!allowed) {
      toast.error(
        "Please allow audio permissions in settings to hear the music.",
      );
      return;
    }

    const audio = getGlobalAudio();

    // Request audio focus from the OS
    await requestAudioFocus();

    // Enforce volume before resuming
    audio.muted = false;
    audio.volume = 1.0;

    // Re-apply MediaSession metadata if we have a current track
    if (sharedState.currentTrack) {
      setMediaSessionMetadata(sharedState.currentTrack);
    }

    try {
      await audio.play();
      setMediaSessionPlaybackState("playing");
      startBufferCheck(audio);
      await acquireWakeLock();
    } catch (err: any) {
      if (err?.name === "NotAllowedError") {
        sharedState.isPermissionDenied = true;
        notifyListeners();
        toast.error(
          "Please allow audio permissions in settings to hear the music.",
        );
      } else {
        console.error("Resume error:", err);
      }
    }
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
    [play, pause, resume],
  );

  const seek = useCallback((time: number) => {
    const audio = getGlobalAudio();
    audio.currentTime = time;
    sharedState.currentTime = time;
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
    isPermissionDenied: sharedState.isPermissionDenied,
    play,
    pause,
    resume,
    togglePlayPause,
    seek,
    isTrackPlaying,
    audioRef,
  };
}
