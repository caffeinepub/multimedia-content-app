import { useState } from 'react';
import { useGetAllPoetry, useGetAllDua, useGetAllSongs } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import PoetryPost from '../components/PoetryPost';
import DuaPost from '../components/DuaPost';
import SongPost from '../components/SongPost';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw, Copy, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

type ContentItem = {
  type: 'poetry' | 'dua' | 'song';
  data: any;
  likes: number;
};

function UserIdentityCard() {
  const uniqueCode = localStorage.getItem('dmUser_uniqueCode') || '';
  const userName = localStorage.getItem('dmUser_name') || '';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!uniqueCode) return;
    try {
      await navigator.clipboard.writeText(uniqueCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = uniqueCode;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!uniqueCode && !userName) return null;

  return (
    <div className="flex flex-col items-center gap-3 py-6 px-4">
      {/* Unique Code */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
          Your Unique Code
        </p>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              readOnly
              value={uniqueCode}
              className="text-center font-mono text-lg font-bold tracking-widest bg-primary/10 border border-primary/30 rounded-xl px-4 py-2 text-primary cursor-default select-all focus:outline-none focus:ring-2 focus:ring-primary/40 min-w-[140px]"
              onFocus={(e) => e.target.select()}
            />
          </div>
          <button
            onClick={handleCopy}
            title="Copy code"
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            {copied ? (
              <Check className="h-4 w-4 text-primary" />
            ) : (
              <Copy className="h-4 w-4 text-primary" />
            )}
          </button>
        </div>
      </div>

      {/* User Name */}
      {userName && (
        <p className="text-base text-muted-foreground font-medium">
          Welcome, <span className="text-foreground font-semibold">{userName}</span>
        </p>
      )}

      {/* Divider */}
      <div className="w-24 h-px bg-border/60 mt-1" />
    </div>
  );
}

export default function MixPage() {
  const { isFetching: actorFetching } = useActor();
  const {
    data: poetry,
    isLoading: poetryLoading,
    isFetching: poetryFetching,
    isError: poetryError,
    refetch: refetchPoetry,
  } = useGetAllPoetry();
  const {
    data: duas,
    isLoading: duasLoading,
    isFetching: duasFetching,
    isError: duasError,
    refetch: refetchDuas,
  } = useGetAllDua();
  const {
    data: songs,
    isLoading: songsLoading,
    isFetching: songsFetching,
    isError: songsError,
    refetch: refetchSongs,
  } = useGetAllSongs();
  const queryClient = useQueryClient();

  // Show loading while actor is initializing or any query is still in flight without data
  const isLoading =
    actorFetching ||
    poetryLoading ||
    duasLoading ||
    songsLoading ||
    (poetryFetching && poetry === undefined) ||
    (duasFetching && duas === undefined) ||
    (songsFetching && songs === undefined);

  // Only show error state when ALL three queries have failed
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
        <UserIdentityCard />
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
        <UserIdentityCard />
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
      <div className="space-y-6">
        <UserIdentityCard />
        <div className="text-center py-10 space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
            Trending Content
          </h1>
          <p className="text-muted-foreground text-lg">No content available yet. Check back soon!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* User Identity Card at top center */}
      <UserIdentityCard />

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
