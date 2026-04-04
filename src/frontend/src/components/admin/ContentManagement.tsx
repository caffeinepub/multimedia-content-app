import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useDeleteDua,
  useDeletePoetry,
  useDeleteSong,
  useGetAllDua,
  useGetAllPoetry,
  useGetAllSongs,
} from "../../hooks/useQueries";

type ContentItem =
  | { type: "poetry"; data: { id: string; title: string; likeCount: bigint } }
  | { type: "dua"; data: { id: string; title: string; likeCount: bigint } }
  | { type: "song"; data: { id: string; title: string; artist: string } };

export default function ContentManagement() {
  const queryClient = useQueryClient();
  const {
    data: poetry,
    isLoading: poetryLoading,
    refetch: refetchPoetry,
  } = useGetAllPoetry();
  const {
    data: duas,
    isLoading: duasLoading,
    refetch: refetchDuas,
  } = useGetAllDua();
  const {
    data: songs,
    isLoading: songsLoading,
    refetch: refetchSongs,
  } = useGetAllSongs();

  const deletePoetry = useDeletePoetry();
  const deleteDua = useDeleteDua();
  const deleteSong = useDeleteSong();

  // Track which specific item is pending deletion
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Track which item the confirmation dialog is open for
  const [confirmItem, setConfirmItem] = useState<ContentItem | null>(null);

  const handleRefreshAll = () => {
    refetchPoetry();
    refetchDuas();
    refetchSongs();
  };

  const handleConfirmDelete = async () => {
    if (!confirmItem) return;

    const { type, data } = confirmItem;
    setDeletingId(data.id);
    setConfirmItem(null);

    try {
      let success = false;

      if (type === "poetry") {
        success = await deletePoetry.mutateAsync(data.id);
      } else if (type === "dua") {
        success = await deleteDua.mutateAsync(data.id);
      } else if (type === "song") {
        success = await deleteSong.mutateAsync(data.id);
      }

      if (success) {
        toast.success(`"${data.title}" deleted successfully`);
        // Immediately invalidate and refetch to update the UI
        if (type === "poetry") {
          await queryClient.invalidateQueries({ queryKey: ["poetry"] });
          refetchPoetry();
        } else if (type === "dua") {
          await queryClient.invalidateQueries({ queryKey: ["dua"] });
          refetchDuas();
        } else if (type === "song") {
          await queryClient.invalidateQueries({ queryKey: ["songs"] });
          refetchSongs();
        }
      } else {
        toast.error(
          `Could not delete "${data.title}". It may have already been removed.`,
        );
      }
    } catch (error: any) {
      const msg: string = error?.message || String(error);
      toast.error(msg || "Failed to delete. Please try again.");
    } finally {
      setDeletingId(null);
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

  const allContent: ContentItem[] = [
    ...(poetry || []).map((p) => ({ type: "poetry" as const, data: p })),
    ...(duas || []).map((d) => ({ type: "dua" as const, data: d })),
    ...(songs || []).map((s) => ({ type: "song" as const, data: s })),
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Content Management</CardTitle>
              <CardDescription>
                View and delete existing content ({allContent.length} items)
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAll}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {allContent.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-muted-foreground">
                No content available to manage
              </p>
            </div>
          ) : (
            allContent.map((item, index) => {
              const isThisItemDeleting = deletingId === item.data.id;

              return (
                <div
                  key={`${item.type}-${item.data.id}-${index}`}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate urdu-text">
                        {item.data.title}
                      </h3>
                      <Badge variant="outline" className="shrink-0 capitalize">
                        {item.type}
                      </Badge>
                    </div>
                    {(item.type === "poetry" || item.type === "dua") && (
                      <p className="text-sm text-muted-foreground">
                        {Number(item.data.likeCount).toLocaleString()} likes
                      </p>
                    )}
                    {item.type === "song" && (
                      <p className="text-sm text-muted-foreground urdu-text">
                        {item.data.artist}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-2 shrink-0 ml-3"
                    disabled={isThisItemDeleting || deletingId !== null}
                    onClick={() => setConfirmItem(item)}
                  >
                    {isThisItemDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    {isThisItemDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Single shared confirmation dialog */}
      <AlertDialog
        open={!!confirmItem}
        onOpenChange={(open) => {
          if (!open) setConfirmItem(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold">
                &quot;{confirmItem?.data.title}&quot;
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmItem(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
