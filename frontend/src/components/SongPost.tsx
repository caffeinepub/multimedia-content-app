import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Pause, ShieldAlert, Heart, Share2, Copy, Check } from 'lucide-react';
import { Song } from '../backend';
import { toast } from 'sonner';
import NowPlayingModal from './NowPlayingModal';
import { useAudioPlayback } from '../hooks/useAudioPlayback';
import { useIncrementSongLike } from '../hooks/useQueries';
import { timeAgo } from '../utils/timeAgo';

interface SongPostProps {
  song: Song;
}

export default function SongPost({ song }: SongPostProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState<number>(
    song.likeCount != null ? Number(song.likeCount) : 0
  );
  const [timeLabel, setTimeLabel] = useState(() => timeAgo(song.createdAt));
  const [copied, setCopied] = useState(false);

  const { togglePlayPause, isTrackPlaying, isPermissionDenied } = useAudioPlayback();
  const incrementLike = useIncrementSongLike();

  const isCurrentlyPlaying = isTrackPlaying(song.id);

  useEffect(() => {
    if (!isLiked) {
      setLocalLikeCount(song.likeCount != null ? Number(song.likeCount) : 0);
    }
  }, [song.likeCount, isLiked]);

  useEffect(() => {
    setTimeLabel(timeAgo(song.createdAt));
    const interval = setInterval(() => {
      setTimeLabel(timeAgo(song.createdAt));
    }, 60_000);
    return () => clearInterval(interval);
  }, [song.createdAt]);

  const handleInlinePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!song.audio) return;
    if (isPermissionDenied) return;
    const audioUrl = song.audio.getDirectURL();
    togglePlayPause({
      id: song.id,
      title: song.title,
      artist: song.artist,
      audioUrl,
      category: 'song',
    });
  };

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiked) return;
    setIsLiked(true);
    setLocalLikeCount((prev) => prev + 1);
    incrementLike.mutate(song.id);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `${song.title} — ${song.artist}\n\nShared via Be Asar App`;
    if (navigator.share) {
      try {
        await navigator.share({ title: song.title, text: shareText });
      } catch {
        // User cancelled or error — silently ignore
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success('Copied to clipboard for sharing!');
      } catch {
        toast.error('Unable to share');
      }
    }
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const copyText = `${song.title} — ${song.artist}`;
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      toast.success('Text Copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy text');
    }
  };

  return (
    <>
      <Card
        className="overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] duration-300 cursor-pointer flex flex-col"
        onClick={handleCardClick}
      >
        <CardHeader className="space-y-2 pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-xl line-clamp-2 poetry-title">{song.title}</CardTitle>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <Badge variant="secondary">Songs</Badge>
              {timeLabel && (
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">{timeLabel}</span>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground poetry-content">{song.artist}</p>
        </CardHeader>

        <CardContent className="flex-1">
          {song.audio && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                <Button
                  onClick={handleInlinePlayPause}
                  size="icon"
                  variant="default"
                  className="h-10 w-10 rounded-full shrink-0"
                  aria-label={isCurrentlyPlaying ? 'Pause' : 'Play'}
                  disabled={isPermissionDenied}
                >
                  {isCurrentlyPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4 ml-0.5" />
                  )}
                </Button>
                <div className="flex-1">
                  <p className="text-sm font-medium truncate poetry-title">{song.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {isCurrentlyPlaying ? 'Playing...' : 'Tap card to open full player'}
                  </p>
                </div>
              </div>
              {isPermissionDenied && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>Please allow audio permissions in settings to hear the music.</span>
                </div>
              )}
            </div>
          )}
        </CardContent>

        {/* Action Bar */}
        <CardFooter
          className="flex items-center justify-between gap-1 pt-3 border-t"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Like */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              isLiked
                ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/30'
                : 'text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30'
            }`}
            aria-label="Like"
          >
            <Heart
              className={`h-4 w-4 transition-all duration-200 ${
                isLiked ? 'fill-rose-500 text-rose-500 scale-110' : ''
              }`}
            />
            <span>{localLikeCount.toLocaleString()}</span>
          </button>

          <div className="flex items-center gap-1">
            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
              aria-label="Share"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* Copy */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
              aria-label="Copy text"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </CardFooter>
      </Card>

      {isModalOpen && (
        <NowPlayingModal
          song={song}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
