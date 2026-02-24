import { useGetAllDuas } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import DuaPost from '../components/DuaPost';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function DuaPage() {
  const { isFetching: actorFetching } = useActor();
  const { data: duas, isLoading, isFetching, error, refetch } = useGetAllDuas();
  const queryClient = useQueryClient();

  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ['duas'] });
    refetch();
  };

  const showLoading = actorFetching || isLoading || (isFetching && !duas);

  if (showLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
            Dua
          </h1>
          <p className="text-muted-foreground">Spiritual prayers for peace and guidance</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load duas. Please try again later.</AlertDescription>
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

  if (!duas || duas.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
          Dua
        </h1>
        <p className="text-muted-foreground text-lg">No duas available yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
          Dua
        </h1>
        <p className="text-muted-foreground">Spiritual prayers for peace and guidance</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {duas.map((item) => (
          <DuaPost key={item.id} dua={item} />
        ))}
      </div>
    </div>
  );
}
