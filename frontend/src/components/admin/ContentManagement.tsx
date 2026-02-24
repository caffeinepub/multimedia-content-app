import { useGetAllPoetry, useGetAllDuas, useGetAllSongs, useDeletePoetry, useDeleteDua, useDeleteSong } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function ContentManagement() {
  const { data: poetry, isLoading: poetryLoading } = useGetAllPoetry();
  const { data: duas, isLoading: duasLoading } = useGetAllDuas();
  const { data: songs, isLoading: songsLoading } = useGetAllSongs();

  const deletePoetry = useDeletePoetry();
  const deleteDua = useDeleteDua();
  const deleteSong = useDeleteSong();

  const handleDeletePoetry = async (id: string, title: string) => {
    try {
      await deletePoetry.mutateAsync(id);
      toast.success(`Poetry "${title}" deleted successfully`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete poetry');
    }
  };

  const handleDeleteDua = async (id: string, title: string) => {
    try {
      await deleteDua.mutateAsync(id);
      toast.success(`Dua "${title}" deleted successfully`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete dua');
    }
  };

  const handleDeleteSong = async (id: string, title: string) => {
    try {
      await deleteSong.mutateAsync(id);
      toast.success(`Song "${title}" deleted successfully`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete song');
    }
  };

  const isLoading = poetryLoading || duasLoading || songsLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  const allContent = [
    ...(poetry || []).map((p) => ({ type: 'poetry' as const, data: p })),
    ...(duas || []).map((d) => ({ type: 'dua' as const, data: d })),
    ...(songs || []).map((s) => ({ type: 'song' as const, data: s })),
  ];

  if (allContent.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <p className="text-muted-foreground">No content available to manage</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Content Management</CardTitle>
          <CardDescription>View and delete existing content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {allContent.map((item, index) => {
            const isDeleting =
              (item.type === 'poetry' && deletePoetry.isPending) ||
              (item.type === 'dua' && deleteDua.isPending) ||
              (item.type === 'song' && deleteSong.isPending);

            return (
              <div
                key={`${item.type}-${item.data.id}-${index}`}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium truncate urdu-text">{item.data.title}</h3>
                    <Badge variant="outline" className="shrink-0 capitalize">
                      {item.type}
                    </Badge>
                  </div>
                  {item.type === 'poetry' && (
                    <p className="text-sm text-muted-foreground">
                      {Number(item.data.likes.count).toLocaleString()} likes
                    </p>
                  )}
                  {item.type === 'dua' && (
                    <p className="text-sm text-muted-foreground">
                      {Number(item.data.likes.count).toLocaleString()} likes
                    </p>
                  )}
                  {item.type === 'song' && (
                    <p className="text-sm text-muted-foreground urdu-text">
                      {item.data.artist}
                    </p>
                  )}
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-2 shrink-0"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete "{item.data.title}". This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          if (item.type === 'poetry') {
                            handleDeletePoetry(item.data.id, item.data.title);
                          } else if (item.type === 'dua') {
                            handleDeleteDua(item.data.id, item.data.title);
                          } else if (item.type === 'song') {
                            handleDeleteSong(item.data.id, item.data.title);
                          }
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
