import { useEffect, useCallback } from 'react';
import { X, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Poetry, Dua } from '../backend';
import AudioPlayer from './AudioPlayer';
import { useHistory } from '../hooks/useHistory';

interface FullScreenPostModalProps {
  post: Poetry | Dua | null;
  postType: 'poetry' | 'dua';
  onClose: () => void;
}

function isPoetry(post: Poetry | Dua): post is Poetry {
  return 'image' in post;
}

export default function FullScreenPostModal({ post, postType, onClose }: FullScreenPostModalProps) {
  const { addHistoryEntry } = useHistory();

  useEffect(() => {
    if (!post) return;

    // Lock background scroll
    document.body.style.overflow = 'hidden';

    // Track history
    addHistoryEntry({
      id: post.id,
      title: post.title,
      category: postType,
    });

    return () => {
      document.body.style.overflow = '';
    };
  }, [post, postType, addHistoryEntry]);

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

  if (!post) return null;

  const likesCount = post.likeCount != null ? Number(post.likeCount) : 0;

  let imageUrl: string | undefined;
  if (isPoetry(post) && post.image) {
    try {
      imageUrl = post.image.getDirectURL?.();
    } catch {
      imageUrl = undefined;
    }
  }

  const duaPost = !isPoetry(post) ? (post as Dua) : null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-background/98 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={post.title}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="capitalize">
            {postType}
          </Badge>
          <span className="text-sm text-muted-foreground hidden sm:block">
            {post.title}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="rounded-full h-9 w-9 hover:bg-destructive/10 hover:text-destructive transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          {/* Title */}
          <h1 className="text-3xl font-bold urdu-text leading-relaxed text-foreground">
            {post.title}
          </h1>

          {/* Image (Poetry) */}
          {imageUrl && (
            <div className="rounded-xl overflow-hidden border border-border/40 shadow-lg">
              <img
                src={imageUrl}
                alt={post.title}
                className="w-full object-cover max-h-[60vh]"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-lg leading-relaxed urdu-text whitespace-pre-wrap text-foreground/90">
              {post.content}
            </p>
          </div>

          {/* Audio (Dua) */}
          {duaPost?.audio && (
            <div className="mt-4">
              <AudioPlayer audio={duaPost.audio} title={duaPost.title} />
            </div>
          )}

          {/* Likes */}
          <div className="flex items-center gap-2 text-muted-foreground pt-4 border-t border-border/40">
            <Heart className="h-5 w-5 fill-red-500 text-red-500" />
            <span className="text-base font-medium">{likesCount.toLocaleString()} likes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
