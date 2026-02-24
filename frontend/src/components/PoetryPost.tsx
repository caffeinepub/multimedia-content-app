import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Download } from 'lucide-react';
import { Poetry } from '../backend';
import { toast } from 'sonner';
import FullScreenPostModal from './FullScreenPostModal';

interface PoetryPostProps {
  poetry: Poetry;
}

export default function PoetryPost({ poetry }: PoetryPostProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!poetry.image) {
      toast.error('No image available to download');
      return;
    }

    try {
      const bytes = await poetry.image.getBytes();
      const blob = new Blob([bytes], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${poetry.title.replace(/\s+/g, '_')}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Download started!');
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  // Safely get image URL
  let imageUrl: string | undefined;
  try {
    imageUrl = poetry.image?.getDirectURL?.();
  } catch {
    imageUrl = undefined;
  }

  const likesCount = poetry.likes?.count != null ? Number(poetry.likes.count) : 0;

  return (
    <>
      <Card
        className="overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] duration-300 cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-xl line-clamp-2 urdu-text">{poetry.title}</CardTitle>
            <Badge variant="secondary" className="shrink-0">Poetry</Badge>
          </div>
        </CardHeader>

        {imageUrl && (
          <div className="relative aspect-video overflow-hidden">
            <img
              src={imageUrl}
              alt={poetry.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground line-clamp-3 urdu-text whitespace-pre-wrap">
            {poetry.content}
          </p>
        </CardContent>

        <CardFooter className="flex items-center justify-between gap-2 pt-4 border-t">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            <span className="text-sm font-medium">{likesCount.toLocaleString()}</span>
          </div>
          <Button onClick={handleDownload} size="sm" variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </CardFooter>
      </Card>

      {isModalOpen && (
        <FullScreenPostModal
          post={poetry}
          postType="poetry"
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
