import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Copy, Download, Heart, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Poetry } from "../backend";
import { useIncrementPoetryLike } from "../hooks/useQueries";
import { timeAgo } from "../utils/timeAgo";
import FullScreenPostModal from "./FullScreenPostModal";

interface PoetryPostProps {
  poetry: Poetry;
}

export default function PoetryPost({ poetry }: PoetryPostProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState<number>(
    poetry.likeCount != null ? Number(poetry.likeCount) : 0,
  );
  const [timeLabel, setTimeLabel] = useState(() => timeAgo(poetry.createdAt));
  const [copied, setCopied] = useState(false);

  const incrementLike = useIncrementPoetryLike();

  // Update like count when backend data changes (but not if user has liked locally)
  useEffect(() => {
    if (!isLiked) {
      setLocalLikeCount(
        poetry.likeCount != null ? Number(poetry.likeCount) : 0,
      );
    }
  }, [poetry.likeCount, isLiked]);

  // Refresh timestamp every 60 seconds
  useEffect(() => {
    setTimeLabel(timeAgo(poetry.createdAt));
    const interval = setInterval(() => {
      setTimeLabel(timeAgo(poetry.createdAt));
    }, 60_000);
    return () => clearInterval(interval);
  }, [poetry.createdAt]);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!poetry.image) {
      toast.error("No image available to download");
      return;
    }
    try {
      const bytes = await poetry.image.getBytes();
      const blob = new Blob([bytes], { type: "image/jpeg" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${poetry.title.replace(/\s+/g, "_")}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Download started!");
    } catch {
      toast.error("Failed to download image");
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiked) return;
    setIsLiked(true);
    setLocalLikeCount((prev) => prev + 1);
    incrementLike.mutate(poetry.id);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `${poetry.title}\n\n${poetry.content}\n\nShared via Be Asar App`;
    if (navigator.share) {
      try {
        await navigator.share({ title: poetry.title, text: shareText });
      } catch {
        // User cancelled or error — silently ignore
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success("Copied to clipboard for sharing!");
      } catch {
        toast.error("Unable to share");
      }
    }
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const copyText = `${poetry.title}\n\n${poetry.content}`;
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      toast.success("Text Copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy text");
    }
  };

  let imageUrl: string | undefined;
  try {
    imageUrl = poetry.image?.getDirectURL?.();
  } catch {
    imageUrl = undefined;
  }

  return (
    <>
      <Card
        className="overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] duration-300 cursor-pointer flex flex-col"
        onClick={() => setIsModalOpen(true)}
      >
        <CardHeader className="space-y-2 pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-xl line-clamp-2 poetry-title">
              {poetry.title}
            </CardTitle>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <Badge variant="secondary">Poetry</Badge>
              {timeLabel && (
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {timeLabel}
                </span>
              )}
            </div>
          </div>
        </CardHeader>

        {imageUrl && (
          <div className="relative aspect-video overflow-hidden">
            <img
              src={imageUrl}
              alt={poetry.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}

        <CardContent className="pt-4 flex-1">
          <p className="text-sm text-muted-foreground line-clamp-3 poetry-content whitespace-pre-wrap">
            {poetry.content}
          </p>
        </CardContent>

        {/* Download button row */}
        <div className="px-6 pb-2 flex justify-end">
          <Button
            onClick={handleDownload}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>

        {/* Action Bar */}
        <CardFooter
          className="flex items-center justify-between gap-1 pt-3 border-t"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Like */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              isLiked
                ? "text-rose-500 bg-rose-50 dark:bg-rose-950/30"
                : "text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            }`}
            aria-label="Like"
          >
            <Heart
              className={`h-4 w-4 transition-all duration-200 ${
                isLiked ? "fill-rose-500 text-rose-500 scale-110" : ""
              }`}
            />
            <span>{localLikeCount.toLocaleString()}</span>
          </button>

          <div className="flex items-center gap-1">
            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
              aria-label="Share"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* Copy */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
              aria-label="Copy text"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {copied ? "Copied!" : "Copy"}
              </span>
            </button>
          </div>
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
