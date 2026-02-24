import { useGetAllPoetry, useGetAllDua, useGetAllSongs } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import PoetryPost from '../components/PoetryPost';
import DuaPost from '../components/DuaPost';
import SongPost from '../components/SongPost';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

type ContentItem = {
  type: 'poetry' | 'dua' | 'song';
  data: any;
  likes: number;
};

export default function MixPage() {
  const { isFetching: actorFetching } = useActor();
  const { data: poetry, isLoading: poetryLoading, error: poetryError, refetch: refetchPoetry } = useGetAllPoetry();
  const { data: duas, isLoading: duasLoading, error: duasError, refetch: refetchDuas } = useGetAllDua();
  const { data: songs, isLoading: songsLoading, error: songsError, refetch: refetchSongs } = useGetAllSongs();
  const queryClient = useQueryClient();

  const isLoading = actorFetching || poetryLoading || duasLoading || songsLoading;
  const allFailed = poetryError && duasError && songsError;

  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ['poetry'] });
    queryClient.invalidateQueries({ queryKey: ['dua'] });
    queryClient.invalidateQueries({ queryKey: ['songs'] });
    refetchPoetry();
    refetchDuas();
    refetchSongs();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
            Trending Content
          </h1>
          <p className="text-muted-foreground">Discover the most loved spiritual content</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (allFailed) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load content. Please try again later.</AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={handleRetry} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const allContent: ContentItem[] = [
    ...(poetry || []).map((p) => ({
      type: 'poetry' as const,
      data: p,
      likes: p.likes?.count != null ? Number(p.likes.count) : 0,
    })),
    ...(duas || []).map((d) => ({
      type: 'dua' as const,
      data: d,
      likes: d.likes?.count != null ? Number(d.likes.count) : 0,
    })),
    ...(songs || []).map((s) => ({
      type: 'song' as const,
      data: s,
      likes: 0,
    })),
  ];

  const sortedContent = allContent.sort((a, b) => b.likes - a.likes);

  if (sortedContent.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
          Trending Content
        </h1>
        <p className="text-muted-foreground text-lg">No content available yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
          Trending Content
        </h1>
        <p className="text-muted-foreground">Discover the most loved spiritual content</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedContent.map((item, index) => {
          if (item.type === 'poetry') {
            return <PoetryPost key={`poetry-${item.data.id}-${index}`} poetry={item.data} />;
          } else if (item.type === 'dua') {
            return <DuaPost key={`dua-${item.data.id}-${index}`} dua={item.data} />;
          } else {
            return <SongPost key={`song-${item.data.id}-${index}`} song={item.data} />;
          }
        })}
      </div>
    </div>
  );
}
