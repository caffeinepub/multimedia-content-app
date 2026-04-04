import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Music, Pause, Play, ShieldAlert, X } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import type { Song } from "../backend";
import { useAudioPlayback } from "../hooks/useAudioPlayback";
import { useHistory } from "../hooks/useHistory";

interface NowPlayingModalProps {
  song: Song | null;
  onClose: () => void;
}

function formatTime(time: number): string {
  if (Number.isNaN(time) || !Number.isFinite(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function NowPlayingModal({
  song,
  onClose,
}: NowPlayingModalProps) {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    seek,
    play,
    isPermissionDenied,
  } = useAudioPlayback();
  const { addHistoryEntry } = useHistory();
  const bufferCheckRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!song) return;

    document.body.style.overflow = "hidden";

    // Track history
    addHistoryEntry({
      id: song.id,
      title: song.title,
      category: "song",
    });

    // Auto-play when modal opens (only if permissions are not denied)
    if (song.audio && !isPermissionDenied) {
      const audioUrl = song.audio.getDirectURL();
      const track = {
        id: song.id,
        title: song.title,
        artist: song.artist,
        audioUrl,
        category: "song",
      };
      // Only start playing if not already playing this track
      if (currentTrack?.id !== song.id) {
        play(track);
      }
    }

    return () => {
      document.body.style.overflow = "";
      if (bufferCheckRef.current !== null) {
        clearTimeout(bufferCheckRef.current);
        bufferCheckRef.current = null;
      }
    };
  }, [song, addHistoryEntry, isPermissionDenied, currentTrack?.id, play]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!song) return null;

  const isCurrentSongPlaying = currentTrack?.id === song.id && isPlaying;
  const displayTime = currentTrack?.id === song.id ? currentTime : 0;
  const displayDuration = currentTrack?.id === song.id ? duration : 0;

  const handlePlayPause = () => {
    if (isPermissionDenied) return;
    if (song.audio) {
      const audioUrl = song.audio.getDirectURL();
      togglePlayPause({
        id: song.id,
        title: song.title,
        artist: song.artist,
        audioUrl,
        category: "song",
      });
    }
  };

  const handleSeek = (value: number[]) => {
    seek(value[0]);
  };

  return (
    <dialog
      open
      className="fixed inset-0 z-[100] flex flex-col bg-gradient-to-b from-primary/20 via-background to-background animate-in fade-in duration-300 m-0 p-0 max-w-full max-h-full w-full h-full border-0"
      aria-label={`Now Playing: ${song.title}`}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Now Playing
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="rounded-full h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
          aria-label="Close player"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-8">
        {/* Album Art */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden shadow-2xl border border-border/30 bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
          <div
            className={`flex items-center justify-center w-full h-full ${isCurrentSongPlaying ? "animate-spin" : ""}`}
            style={{ animationDuration: "8s" }}
          >
            <Music className="h-24 w-24 text-primary/60" />
          </div>
          {/* Vinyl center dot */}
          <div className="absolute w-8 h-8 rounded-full bg-background border-2 border-border/40 shadow-inner" />
        </div>

        {/* Song Info */}
        <div className="text-center space-y-1 w-full max-w-xs">
          <h2 className="text-2xl font-bold truncate urdu-text">
            {song.title}
          </h2>
          <p className="text-muted-foreground urdu-text">{song.artist}</p>
        </div>

        {/* Permission Denied Guard */}
        {isPermissionDenied && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm max-w-xs w-full">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <span>
              Please allow audio permissions in settings to hear the music.
            </span>
          </div>
        )}

        {/* Progress Bar */}
        {!isPermissionDenied && (
          <div className="w-full max-w-xs space-y-2">
            <Slider
              value={[displayTime]}
              max={displayDuration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(displayTime)}</span>
              <span>{formatTime(displayDuration)}</span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-6">
          <Button
            onClick={handlePlayPause}
            size="icon"
            variant="default"
            className="h-16 w-16 rounded-full shadow-lg"
            aria-label={isCurrentSongPlaying ? "Pause" : "Play"}
            disabled={!song.audio || isPermissionDenied}
          >
            {isCurrentSongPlaying ? (
              <Pause className="h-7 w-7" />
            ) : (
              <Play className="h-7 w-7 ml-1" />
            )}
          </Button>
        </div>

        {!song.audio && (
          <p className="text-sm text-muted-foreground">
            No audio available for this song.
          </p>
        )}
      </div>

      {/* Bottom padding */}
      <div className="h-8" />
    </dialog>
  );
}
