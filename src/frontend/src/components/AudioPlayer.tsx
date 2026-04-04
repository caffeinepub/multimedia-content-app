import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Pause, Play, ShieldAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { ExternalBlob } from "../backend";

interface AudioPlayerProps {
  audio: ExternalBlob;
  title: string;
}

// Check audio/media permissions using the Web Permissions API
async function checkAudioPermissionLocal(): Promise<boolean> {
  try {
    if (!navigator.permissions) return true;
    const result = await (navigator.permissions as any).query({
      name: "autoplay",
    });
    return result.state !== "denied";
  } catch {
    return true;
  }
}

// Request audio focus by resuming/creating an AudioContext
let duaAudioContext: AudioContext | null = null;

async function requestAudioFocusLocal(): Promise<void> {
  try {
    if (!duaAudioContext) {
      duaAudioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
    }
    if (duaAudioContext.state !== "running") {
      console.log("Audio focus requested");
      await duaAudioContext.resume();
    }
  } catch {
    // Silently ignore
  }
}

export default function AudioPlayer({ audio, title }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const bufferCheckRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const audioUrl = audio.getDirectURL();

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    // ALWAYS force unmuted and full volume — never read from state/storage
    audioElement.muted = false;
    audioElement.volume = 1.0;
    // Route to media/music stream (Safari/iOS AirPlay compatibility)
    audioElement.setAttribute("x-webkit-airplay", "allow");

    const handleTimeUpdate = () => setCurrentTime(audioElement.currentTime);
    const handleLoadedMetadata = () => setDuration(audioElement.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      if (bufferCheckRef.current !== null) {
        clearTimeout(bufferCheckRef.current);
        bufferCheckRef.current = null;
      }
      try {
        if ("mediaSession" in navigator) {
          navigator.mediaSession.playbackState = "none";
        }
      } catch {
        /* silently ignore */
      }
    };
    const handleVolumeChange = () => {
      // Enforce: never allow muted or volume < 1.0
      if (audioElement.muted) {
        audioElement.muted = false;
      }
      if (audioElement.volume < 1.0) {
        audioElement.volume = 1.0;
      }
    };
    const handleStalled = () => {
      toast.error("Audio data not found.");
    };
    const handlePlaying = () => {
      // Audio is actually playing — clear the buffer check timeout
      if (bufferCheckRef.current !== null) {
        clearTimeout(bufferCheckRef.current);
        bufferCheckRef.current = null;
      }
    };

    audioElement.addEventListener("timeupdate", handleTimeUpdate);
    audioElement.addEventListener("loadedmetadata", handleLoadedMetadata);
    audioElement.addEventListener("ended", handleEnded);
    audioElement.addEventListener("volumechange", handleVolumeChange);
    audioElement.addEventListener("stalled", handleStalled);
    audioElement.addEventListener("playing", handlePlaying);

    // Check permissions on mount
    checkAudioPermissionLocal().then((allowed) => {
      if (!allowed) setIsPermissionDenied(true);
    });

    return () => {
      audioElement.removeEventListener("timeupdate", handleTimeUpdate);
      audioElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audioElement.removeEventListener("ended", handleEnded);
      audioElement.removeEventListener("volumechange", handleVolumeChange);
      audioElement.removeEventListener("stalled", handleStalled);
      audioElement.removeEventListener("playing", handlePlaying);
      if (bufferCheckRef.current !== null) {
        clearTimeout(bufferCheckRef.current);
        bufferCheckRef.current = null;
      }
    };
  }, []);

  const handlePlayPause = async () => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    // Permission guard
    const allowed = await checkAudioPermissionLocal();
    if (!allowed) {
      setIsPermissionDenied(true);
      toast.error(
        "Please allow audio permissions in settings to hear the music.",
      );
      return;
    }
    setIsPermissionDenied(false);

    if (isPlaying) {
      audioElement.pause();
      setIsPlaying(false);
      try {
        if ("mediaSession" in navigator) {
          navigator.mediaSession.playbackState = "paused";
        }
      } catch {
        /* silently ignore */
      }
    } else {
      // Request audio focus from the OS
      await requestAudioFocusLocal();

      // Force volume and mute state unconditionally before every play
      audioElement.muted = false;
      audioElement.volume = 1.0;

      // Set MediaSession metadata so OS routes audio to media/music stream
      try {
        if ("mediaSession" in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: title,
            artist: "",
            album: "Dua",
          });
        }
      } catch {
        /* silently ignore */
      }

      try {
        await audioElement.play();
        setIsPlaying(true);

        // After play() resolves, mark playback state in OS media session
        try {
          if ("mediaSession" in navigator) {
            navigator.mediaSession.playbackState = "playing";
          }
        } catch {
          /* silently ignore */
        }

        // Start buffer health check
        if (bufferCheckRef.current !== null) {
          clearTimeout(bufferCheckRef.current);
        }
        bufferCheckRef.current = setTimeout(() => {
          if (audioElement.buffered.length === 0 && !audioElement.paused) {
            toast.error("Audio data not found.");
          }
        }, 5000);
      } catch (err: any) {
        if (err?.name === "NotAllowedError") {
          setIsPermissionDenied(true);
          toast.error(
            "Please allow audio permissions in settings to hear the music.",
          );
        } else {
          console.error("Playback error:", err);
        }
      }
    }
  };

  const handleSeek = (value: number[]) => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    audioElement.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const formatTime = (time: number): string => {
    if (Number.isNaN(time) || !Number.isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-3">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        x-webkit-airplay="allow"
      />

      {/* Permission denied guard */}
      {isPermissionDenied && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>
            Please allow audio permissions in settings to hear the music.
          </span>
        </div>
      )}

      {/* Player controls */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handlePlayPause}
          size="icon"
          variant="default"
          className="h-10 w-10 rounded-full shrink-0"
          aria-label={isPlaying ? "Pause" : "Play"}
          disabled={isPermissionDenied}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 ml-0.5" />
          )}
        </Button>

        <div className="flex-1 space-y-1">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
            disabled={isPermissionDenied}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
