import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import { Song } from '../backend';
import NowPlayingModal from './NowPlayingModal';
import { useAudioPlayback } from '../hooks/useAudioPlayback';

interface SongPostProps {
  song: Song;
}

export default function SongPost({ song }: SongPostProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { togglePlayPause, isTrackPlaying } = useAudioPlayback();

  const isCurrentlyPlaying = isTrackPlaying(song.id);

  const handleInlinePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!song.audio) return;
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

  return (
    <>
      <Card
        className="overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] duration-300 cursor-pointer"
        onClick={handleCardClick}
      >
        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-xl line-clamp-2 urdu-text">{song.title}</CardTitle>
            <Badge variant="secondary" className="shrink-0">Songs</Badge>
          </div>
          <p className="text-sm text-muted-foreground urdu-text">{song.artist}</p>
        </CardHeader>

        <CardContent>
          {song.audio && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
              <Button
                onClick={handleInlinePlayPause}
                size="icon"
                variant="default"
                className="h-10 w-10 rounded-full shrink-0"
                aria-label={isCurrentlyPlaying ? 'Pause' : 'Play'}
              >
                {isCurrentlyPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4 ml-0.5" />
                )}
              </Button>
              <div className="flex-1">
                <p className="text-sm font-medium truncate urdu-text">{song.title}</p>
                <p className="text-xs text-muted-foreground">
                  {isCurrentlyPlaying ? 'Playing...' : 'Tap card to open full player'}
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="text-xs text-muted-foreground pt-4 border-t">
          Streaming only · Tap for full player
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
