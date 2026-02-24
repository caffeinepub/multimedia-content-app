import { useGetAllPoetry } from '../hooks/useQueries';
import PoetryPost from '../components/PoetryPost';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function PoetryPage() {
  const { data: poetry, isLoading, error } = useGetAllPoetry();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
            Poetry
          </h1>
          <p className="text-muted-foreground">Beautiful verses to touch your soul</p>
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
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load poetry. Please try again later.</AlertDescription>
      </Alert>
    );
  }

  if (!poetry || poetry.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
          Poetry
        </h1>
        <p className="text-muted-foreground text-lg">No poetry available yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
          Poetry
        </h1>
        <p className="text-muted-foreground">Beautiful verses to touch your soul</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {poetry.map((item) => (
          <PoetryPost key={item.id} poetry={item} />
        ))}
      </div>
    </div>
  );
}
