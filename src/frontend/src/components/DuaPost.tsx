import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Check,
  Copy,
  Download,
  Heart,
  MessageCircle,
  Send,
  Share2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Dua } from "../backend";
import { useDownloads } from "../hooks/useDownloads";
import { useIncrementDuaLike } from "../hooks/useQueries";
import { timeAgo } from "../utils/timeAgo";
import FullScreenPostModal from "./FullScreenPostModal";

interface Comment {
  author: string;
  text: string;
  ts: number;
}

function loadComments(postId: string): Comment[] {
  try {
    const raw = localStorage.getItem(`comments_${postId}`);
    return raw ? (JSON.parse(raw) as Comment[]) : [];
  } catch {
    return [];
  }
}

function saveComments(postId: string, comments: Comment[]) {
  try {
    localStorage.setItem(`comments_${postId}`, JSON.stringify(comments));
  } catch {
    // ignore
  }
}

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
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>(() =>
    loadComments(dua.id),
  );
  const [commentText, setCommentText] = useState("");
  const commentInputRef = useRef<HTMLInputElement>(null);

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
        // User cancelled
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

  const handleToggleComments = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowComments((prev) => {
      const next = !prev;
      if (next) setTimeout(() => commentInputRef.current?.focus(), 100);
      return next;
    });
  };

  const handlePostComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = commentText.trim();
    if (!text) return;
    const author = localStorage.getItem("dmUser_name") || "Guest";
    const newComment: Comment = { author, text, ts: Date.now() };
    const updated = [newComment, ...comments];
    setComments(updated);
    saveComments(dua.id, updated);
    setCommentText("");
    toast.success("Comment posted!");
  };

  return (
    <>
      <Card
        className="overflow-hidden transition-all hover:shadow-xl hover:-translate-y-0.5 duration-300 cursor-pointer flex flex-col border-border/60 bg-card/90 backdrop-blur-sm"
        onClick={() => setIsModalOpen(true)}
      >
        <CardHeader className="space-y-2 pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-xl line-clamp-2 poetry-title">
              {dua.title}
            </CardTitle>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <Badge
                className="text-xs font-semibold"
                style={{
                  background: "oklch(0.55 0.2 160 / 0.15)",
                  color: "oklch(0.72 0.16 160)",
                  borderColor: "oklch(0.55 0.2 160 / 0.3)",
                  border: "1px solid",
                }}
              >
                Dua
              </Badge>
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
            className="gap-2 rounded-full text-xs border-border/60 hover:border-primary/50"
            disabled={isDownloading}
          >
            <Download className="h-3.5 w-3.5" />
            {isDownloading ? "Saving..." : "Download"}
          </Button>
        </div>

        {/* Action Bar */}
        <CardFooter
          className="flex items-center justify-between gap-1 pt-3 border-t border-border/40"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Like */}
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              isLiked
                ? "text-rose-500 bg-rose-500/10"
                : "text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
            }`}
            aria-label="Like"
            data-ocid="dua.toggle"
          >
            <Heart
              className={`h-4 w-4 transition-all duration-200 ${
                isLiked ? "fill-rose-500 text-rose-500 scale-110" : ""
              }`}
            />
            <span>{localLikeCount.toLocaleString()}</span>
          </button>

          <div className="flex items-center gap-1">
            {/* Comment */}
            <button
              type="button"
              onClick={handleToggleComments}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                showComments
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/10"
              }`}
              aria-label="Comment"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">
                {comments.length > 0 ? comments.length : ""}
              </span>
            </button>

            {/* Share */}
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
              aria-label="Share"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* Copy */}
            <button
              type="button"
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

        {/* Comment Section */}
        {showComments && (
          <div
            className="px-4 pb-4 border-t border-border/40 space-y-3 pt-3"
            onKeyDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex gap-2">
              <input
                ref={commentInputRef}
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handlePostComment(e as any);
                }}
                className="flex-1 text-sm px-3 py-2 rounded-xl bg-muted/50 border border-border/40 focus:outline-none focus:ring-1 focus:ring-primary/40 text-foreground placeholder:text-muted-foreground/60"
                data-ocid="dua.input"
              />
              <button
                type="button"
                onClick={handlePostComment}
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                data-ocid="dua.submit_button"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            {comments.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {comments.map((c) => (
                  <div key={c.ts} className="flex gap-2 text-xs">
                    <span className="font-semibold text-foreground shrink-0">
                      {c.author}
                    </span>
                    <span className="text-muted-foreground">{c.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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
