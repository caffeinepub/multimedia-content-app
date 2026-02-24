import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Song } from '../backend';
import AudioPlayer from './AudioPlayer';

interface SongPostProps {
  song: Song;
}

export default function SongPost({ song }: SongPostProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] duration-300">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl line-clamp-2 urdu-text">{song.title}</CardTitle>
          <Badge variant="secondary" className="shrink-0">Songs</Badge>
        </div>
        <p className="text-sm text-muted-foreground urdu-text">{song.artist}</p>
      </CardHeader>

      <CardContent>
        {song.audio && <AudioPlayer audio={song.audio} title={song.title} />}
      </CardContent>

      <CardFooter className="text-xs text-muted-foreground pt-4 border-t">
        Streaming only - Download not available
      </CardFooter>
    </Card>
  );
}
