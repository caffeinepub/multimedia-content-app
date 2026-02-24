import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Download } from 'lucide-react';
import { Dua } from '../backend';
import AudioPlayer from './AudioPlayer';
import { toast } from 'sonner';

interface DuaPostProps {
  dua: Dua;
}

export default function DuaPost({ dua }: DuaPostProps) {
  const handleDownload = async () => {
    if (!dua.audio) {
      toast.error('No audio available to download');
      return;
    }

    try {
      const bytes = await dua.audio.getBytes();
      const blob = new Blob([bytes], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dua.title.replace(/\s+/g, '_')}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Download started!');
    } catch (error) {
      toast.error('Failed to download audio');
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] duration-300">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl line-clamp-2 urdu-text">{dua.title}</CardTitle>
          <Badge variant="secondary" className="shrink-0">Dua</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-4 urdu-text whitespace-pre-wrap">
          {dua.content}
        </p>
        {dua.audio && <AudioPlayer audio={dua.audio} title={dua.title} />}
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2 pt-4 border-t">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
          <span className="text-sm font-medium">{Number(dua.likes.count).toLocaleString()}</span>
        </div>
        <Button onClick={handleDownload} size="sm" variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Download
        </Button>
      </CardFooter>
    </Card>
  );
}
