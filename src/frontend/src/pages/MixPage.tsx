import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Check, Copy, RefreshCw, Star, User } from "lucide-react";
import { useState } from "react";
import DuaPost from "../components/DuaPost";
import PoetryPost from "../components/PoetryPost";
import SongPost from "../components/SongPost";
import { useActor } from "../hooks/useActor";
import {
  useGetAllDua,
  useGetAllPoetry,
  useGetAllSongs,
} from "../hooks/useQueries";

type CategoryFilter = "all" | "poetry" | "dua" | "songs";

type ContentItem = {
  type: "poetry" | "dua" | "song";
  data: any;
  createdAt: bigint;
};

function UserProfileCard() {
  const uniqueCode = localStorage.getItem("dmUser_uniqueCode") || "";
  const userName = localStorage.getItem("dmUser_name") || "";
  const serverName = localStorage.getItem("dmUser_server") || "";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!uniqueCode) return;
    try {
      await navigator.clipboard.writeText(uniqueCode);
    } catch {
      const el = document.createElement("textarea");
      el.value = uniqueCode;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!uniqueCode && !userName) return null;

  return (
    <div className="flex justify-center py-4">
      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.18 0.05 280 / 0.95) 0%, oklch(0.22 0.06 300 / 0.95) 100%)",
          border: "1px solid oklch(0.4 0.1 280 / 0.4)",
          boxShadow:
            "0 8px 40px oklch(0.5 0.2 280 / 0.2), 0 1px 0 oklch(0.6 0.15 280 / 0.2) inset",
        }}
      >
        {/* Subtle top shine */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, oklch(0.7 0.18 280 / 0.6), transparent)",
          }}
        />

        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 20%, oklch(0.7 0.22 280) 0%, transparent 50%)",
          }}
        />

        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <Star
              className="h-4 w-4"
              style={{ color: "oklch(0.75 0.18 60)" }}
            />
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "oklch(0.6 0.1 280)" }}
            >
              Profile
            </span>
          </div>

          {/* Avatar + Name */}
          <div className="flex items-center gap-4 mb-5">
            <div
              className="flex items-center justify-center w-14 h-14 rounded-2xl shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.5 0.22 280 / 0.3), oklch(0.55 0.2 320 / 0.3))",
                border: "1.5px solid oklch(0.55 0.18 280 / 0.5)",
              }}
            >
              <User
                className="h-7 w-7"
                style={{ color: "oklch(0.72 0.18 280)" }}
              />
            </div>
            <div>
              <p
                className="text-lg font-bold leading-tight"
                style={{ color: "oklch(0.94 0.01 270)" }}
              >
                {userName || "Guest"}
              </p>
              {serverName && (
                <p
                  className="text-xs mt-0.5 font-mono truncate max-w-[180px]"
                  style={{ color: "oklch(0.55 0.08 280)" }}
                >
                  {serverName}
                </p>
              )}
            </div>
          </div>

          {/* Divider */}
          <div
            className="h-px mb-4"
            style={{
              background:
                "linear-gradient(90deg, transparent, oklch(0.45 0.1 280 / 0.4), transparent)",
            }}
          />

          {/* Unique ID */}
          <div className="space-y-2">
            <p
              className="text-[10px] uppercase tracking-widest font-semibold"
              style={{ color: "oklch(0.5 0.08 280)" }}
            >
              Your Unique ID
            </p>
            <div className="flex items-center gap-2">
              <div
                className="flex-1 px-3 py-2 rounded-xl font-mono text-sm font-bold tracking-widest text-center select-all"
                style={{
                  background: "oklch(0.14 0.03 270 / 0.8)",
                  border: "1px solid oklch(0.45 0.12 280 / 0.4)",
                  color: "oklch(0.78 0.2 280)",
                }}
              >
                {uniqueCode || "—"}
              </div>
              <button
                type="button"
                onClick={handleCopy}
                title="Copy ID"
                className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-150 hover:scale-105 active:scale-95 shrink-0"
                style={{
                  background: copied
                    ? "oklch(0.5 0.18 160 / 0.2)"
                    : "oklch(0.5 0.18 280 / 0.15)",
                  border: `1px solid ${
                    copied
                      ? "oklch(0.55 0.18 160 / 0.4)"
                      : "oklch(0.5 0.15 280 / 0.35)"
                  }`,
                }}
                data-ocid="profile.button"
              >
                {copied ? (
                  <Check
                    className="h-4 w-4"
                    style={{ color: "oklch(0.7 0.18 160)" }}
                  />
                ) : (
                  <Copy
                    className="h-4 w-4"
                    style={{ color: "oklch(0.65 0.18 280)" }}
                  />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const CATEGORY_TABS: { label: string; value: CategoryFilter; emoji: string }[] =
  [
    { label: "All", value: "all", emoji: "\u2728" },
    { label: "Poetry", value: "poetry", emoji: "\uD83D\uDCDD" },
    { label: "Dua", value: "dua", emoji: "\uD83E\uDD32" },
    { label: "Songs", value: "songs", emoji: "\uD83C\uDFB5" },
  ];

export default function MixPage() {
  const { isFetching: actorFetching } = useActor();
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");

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

  const isLoading =
    actorFetching ||
    poetryLoading ||
    duasLoading ||
    songsLoading ||
    (poetryFetching && poetry === undefined) ||
    (duasFetching && duas === undefined) ||
    (songsFetching && songs === undefined);

  const allFailed = poetryError && duasError && songsError;

  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ["poetry"] });
    queryClient.invalidateQueries({ queryKey: ["dua"] });
    queryClient.invalidateQueries({ queryKey: ["songs"] });
    refetchPoetry();
    refetchDuas();
    refetchSongs();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <UserProfileCard />
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold gradient-text">Latest Content</h1>
          <p className="text-muted-foreground">
            Discover the newest spiritual content
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => `s${i}`).map((k) => (
            <Skeleton key={k} className="h-80 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (allFailed) {
    return (
      <div className="space-y-4">
        <UserProfileCard />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load content. Please try again later.
          </AlertDescription>
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

  // Combine all content
  const allContent: ContentItem[] = [
    ...(poetry || []).map((p) => ({
      type: "poetry" as const,
      data: p,
      createdAt: p.createdAt ?? 0n,
    })),
    ...(duas || []).map((d) => ({
      type: "dua" as const,
      data: d,
      createdAt: d.createdAt ?? 0n,
    })),
    ...(songs || []).map((s) => ({
      type: "song" as const,
      data: s,
      createdAt: s.createdAt ?? 0n,
    })),
  ];

  // Sort newest first
  const sortedContent = [...allContent].sort((a, b) => {
    const aTs = a.createdAt ?? 0n;
    const bTs = b.createdAt ?? 0n;
    if (aTs === 0n && bTs === 0n) return 0;
    if (aTs === 0n) return 1;
    if (bTs === 0n) return -1;
    return bTs > aTs ? 1 : bTs < aTs ? -1 : 0;
  });

  const filteredContent = sortedContent.filter((item) => {
    if (activeCategory === "all") return true;
    if (activeCategory === "poetry") return item.type === "poetry";
    if (activeCategory === "dua") return item.type === "dua";
    if (activeCategory === "songs") return item.type === "song";
    return true;
  });

  return (
    <div className="space-y-8">
      <UserProfileCard />

      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold gradient-text">Latest Content</h1>
        <p className="text-muted-foreground">
          Discover the newest spiritual content
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap px-2">
        {CATEGORY_TABS.map((tab) => (
          <button
            type="button"
            key={tab.value}
            onClick={() => setActiveCategory(tab.value)}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${
              activeCategory === tab.value
                ? "pill-active text-white border-transparent"
                : "bg-card text-muted-foreground border-border/50 hover:border-primary/40 hover:text-foreground hover:bg-accent"
            }`}
            data-ocid="mix.tab"
          >
            <span>{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {filteredContent.length === 0 ? (
        <div
          className="text-center py-16 space-y-4"
          data-ocid="mix.empty_state"
        >
          <p className="text-muted-foreground text-lg">
            No content available yet. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredContent.map((item, index) => {
            if (item.type === "poetry") {
              return (
                <PoetryPost
                  key={`poetry-${item.data.id}-${index}`}
                  poetry={item.data}
                />
              );
            }
            if (item.type === "dua") {
              return (
                <DuaPost key={`dua-${item.data.id}-${index}`} dua={item.data} />
              );
            }
            return (
              <SongPost
                key={`song-${item.data.id}-${index}`}
                song={item.data}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
