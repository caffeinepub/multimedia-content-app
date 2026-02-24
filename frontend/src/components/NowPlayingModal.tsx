import { useEffect, useCallback } from 'react';
import { X, Play, Pause, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Song } from '../backend';
import { useAudioPlayback } from '../hooks/useAudioPlayback';
import { useHistory } from '../hooks/useHistory';

interface NowPlayingModalProps {
  song: Song | null;
  onClose: () => void;
}

function formatTime(time: number): string {
  if (isNaN(time) || !isFinite(time)) return '0:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function NowPlayingModal({ song, onClose }: NowPlayingModalProps) {
  const { currentTrack, isPlaying, currentTime, duration, togglePlayPause, seek, play } =
    useAudioPlayback();
  const { addHistoryEntry } = useHistory();

  useEffect(() => {
    if (!song) return;

    document.body.style.overflow = 'hidden';

    // Track history
    addHistoryEntry({
      id: song.id,
      title: song.title,
      category: 'song',
    });

    // Auto-play when modal opens
    if (song.audio) {
      const audioUrl = song.audio.getDirectURL();
      const track = {
        id: song.id,
        title: song.title,
        artist: song.artist,
        audioUrl,
        category: 'song',
      };
      // Only start playing if not already playing this track
      if (currentTrack?.id !== song.id) {
        play(track);
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!song) return null;

  const isCurrentSongPlaying = currentTrack?.id === song.id && isPlaying;
  const displayTime = currentTrack?.id === song.id ? currentTime : 0;
  const displayDuration = currentTrack?.id === song.id ? duration : 0;
  const progress = displayDuration > 0 ? (displayTime / displayDuration) * 100 : 0;

  const handlePlayPause = () => {
    if (song.audio) {
      const audioUrl = song.audio.getDirectURL();
      togglePlayPause({
        id: song.id,
        title: song.title,
        artist: song.artist,
        audioUrl,
        category: 'song',
      });
    }
  };

  const handleSeek = (value: number[]) => {
    seek(value[0]);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-gradient-to-b from-primary/20 via-background to-background animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
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
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden shadow-2xl border border-border/30 bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/30 flex items-center justify-center">
          <div
            className={`absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 ${isCurrentSongPlaying ? 'animate-pulse' : ''}`}
          />
          <Music className="h-24 w-24 text-primary/60 relative z-10" />
          {/* Vinyl record effect */}
          <div
            className={`absolute inset-0 rounded-full border-4 border-primary/10 m-8 ${isCurrentSongPlaying ? 'animate-spin' : ''}`}
            style={{ animationDuration: '3s' }}
          />
        </div>

        {/* Song Info */}
        <div className="text-center space-y-2 w-full max-w-sm">
          <h2 className="text-2xl font-bold urdu-text leading-tight text-foreground line-clamp-2">
            {song.title}
          </h2>
          <p className="text-muted-foreground urdu-text">{song.artist}</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-sm space-y-2">
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
          {/* Visual progress bar */}
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          <Button
            onClick={handlePlayPause}
            size="icon"
            className="h-16 w-16 rounded-full shadow-lg text-primary-foreground"
            aria-label={isCurrentSongPlaying ? 'Pause' : 'Play'}
          >
            {isCurrentSongPlaying ? (
              <Pause className="h-7 w-7" />
            ) : (
              <Play className="h-7 w-7 ml-1" />
            )}
          </Button>
        </div>
      </div>

      {/* Bottom padding */}
      <div className="h-12" />
    </div>
  );
}
