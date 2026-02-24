import { useGetAllSongs } from '../hooks/useQueries';
import SongPost from '../components/SongPost';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SongsPage() {
  const { data: songs, isLoading, error } = useGetAllSongs();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
            Songs
          </h1>
          <p className="text-muted-foreground">Relaxing melodies for your soul</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load songs. Please try again later.</AlertDescription>
      </Alert>
    );
  }

  if (!songs || songs.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
          Songs
        </h1>
        <p className="text-muted-foreground text-lg">No songs available yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
          Songs
        </h1>
        <p className="text-muted-foreground">Relaxing melodies for your soul</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {songs.map((item) => (
          <SongPost key={item.id} song={item} />
        ))}
      </div>
    </div>
  );
}
