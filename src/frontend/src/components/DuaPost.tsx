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
import type { Dua } from "../backend";
import { useDownloads } from "../hooks/useDownloads";
import { useIncrementDuaLike } from "../hooks/useQueries";
import { timeAgo } from "../utils/timeAgo";
import FullScreenPostModal from "./FullScreenPostModal";

interface DuaPostProps {
  dua: Dua;
}

export default function DuaPost({ dua }: DuaPostProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState<number>(
    dua.likeCount != null ? Number(dua.likeCount) : 0,
  );
  const [timeLabel, setTimeLabel] = useState(() => timeAgo(dua.createdAt));
  const [copied, setCopied] = useState(false);

  const { addDownload } = useDownloads();
  const incrementLike = useIncrementDuaLike();

  useEffect(() => {
    if (!isLiked) {
      setLocalLikeCount(dua.likeCount != null ? Number(dua.likeCount) : 0);
    }
  }, [dua.likeCount, isLiked]);

  useEffect(() => {
    setTimeLabel(timeAgo(dua.createdAt));
    const interval = setInterval(() => {
      setTimeLabel(timeAgo(dua.createdAt));
    }, 60_000);
    return () => clearInterval(interval);
  }, [dua.createdAt]);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!dua.audio) {
      toast.error("No audio available to download");
      return;
    }
    setIsDownloading(true);
    try {
      const bytes = await dua.audio.getBytes();
      const blob = new Blob([bytes], { type: "audio/mpeg" });
      await addDownload({
        id: dua.id,
        title: dua.title,
        category: "dua",
        blob,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${dua.title.replace(/\s+/g, "_")}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Downloaded and saved for offline access!");
    } catch {
      toast.error("Failed to download audio");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiked) return;
    setIsLiked(true);
    setLocalLikeCount((prev) => prev + 1);
    incrementLike.mutate(dua.id);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `${dua.title}\n\n${dua.content}\n\nShared via Be Asar App`;
    if (navigator.share) {
      try {
        await navigator.share({ title: dua.title, text: shareText });
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
    const copyText = `${dua.title}\n\n${dua.content}`;
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      toast.success("Text Copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy text");
    }
  };

  return (
    <>
      <Card
        className="overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] duration-300 cursor-pointer flex flex-col"
        onClick={() => setIsModalOpen(true)}
      >
        <CardHeader className="space-y-2 pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-xl line-clamp-2 poetry-title">
              {dua.title}
            </CardTitle>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <Badge variant="secondary">Dua</Badge>
              {timeLabel && (
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {timeLabel}
                </span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 flex-1">
          <p className="text-sm text-muted-foreground line-clamp-4 poetry-content whitespace-pre-wrap">
            {dua.content}
          </p>
        </CardContent>

        {/* Download button row */}
        <div className="px-6 pb-2 flex justify-end">
          <Button
            onClick={handleDownload}
            size="sm"
            variant="outline"
            className="gap-2"
            disabled={isDownloading}
          >
            <Download className="h-4 w-4" />
            {isDownloading ? "Saving..." : "Download"}
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
          post={dua}
          postType="dua"
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
