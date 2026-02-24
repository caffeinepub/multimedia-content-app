import { useState, useEffect, useRef } from 'react';
import { Menu, X, History, Download, Volume2, Trash2, Play, Pause, PenLine, Mail, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useHistory } from '../hooks/useHistory';
import { useDownloads } from '../hooks/useDownloads';
import { useAudioPlayback } from '../hooks/useAudioPlayback';
import { FilterMode } from '../hooks/useWebAudioFilters';
import { toast } from 'sonner';

type MenuSection = 'history' | 'downloads' | 'volume' | null;

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<MenuSection>(null);
  const [playingDownloadId, setPlayingDownloadId] = useState<string | null>(null);
  const downloadAudioRef = useRef<HTMLAudioElement | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { history, refreshHistory } = useHistory();
  const { downloads, deleteDownload, playDownload, refreshDownloads } = useDownloads();
  const { volume, setVolume, filterMode, setFilterMode, isPlaying, currentTrack } = useAudioPlayback();

  useEffect(() => {
    if (isOpen) {
      refreshHistory();
      refreshDownloads();
    }
  }, [isOpen, refreshHistory, refreshDownloads]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleSection = (section: MenuSection) => {
    setActiveSection((prev) => (prev === section ? null : section));
  };

  const handleDeleteDownload = async (id: string) => {
    if (playingDownloadId === id) {
      downloadAudioRef.current?.pause();
      setPlayingDownloadId(null);
    }
    await deleteDownload(id);
    toast.success('Download deleted');
  };

  const handlePlayDownload = (entry: { id: string; blob: Blob; title: string }) => {
    if (playingDownloadId === entry.id) {
      downloadAudioRef.current?.pause();
      setPlayingDownloadId(null);
      return;
    }

    if (downloadAudioRef.current) {
      downloadAudioRef.current.pause();
    }

    const url = playDownload(entry as any);
    const audio = new Audio(url);
    downloadAudioRef.current = audio;
    audio.play().catch(() => toast.error('Failed to play audio'));
    audio.onended = () => setPlayingDownloadId(null);
    setPlayingDownloadId(entry.id);
  };

  const filterOptions: { mode: FilterMode; label: string; desc: string }[] = [
    { mode: 'standard', label: 'Standard', desc: 'Raw audio, no processing' },
    { mode: 'clean', label: 'Clean Sound', desc: 'High-pass + 3kHz boost' },
    { mode: 'ultraclean', label: 'Ultra Clean', desc: 'Band-pass + compressor' },
  ];

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div ref={menuRef} className="relative">
      {/* Hamburger Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen((prev) => !prev)}
        className="rounded-full"
        aria-label="Open menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Slide-out Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 bg-background border border-border/60 rounded-2xl shadow-2xl z-[200] overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-border/40 bg-muted/30">
            <h2 className="font-semibold text-foreground">Menu</h2>
          </div>

          <ScrollArea className="max-h-[80vh]">
            <div className="p-2 space-y-1">
              {/* History Section */}
              <button
                onClick={() => toggleSection('history')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <History className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">History</span>
                  {history.length > 0 && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      {history.length}
                    </Badge>
                  )}
                </div>
                <ChevronRight
                  className={`h-4 w-4 text-muted-foreground transition-transform ${activeSection === 'history' ? 'rotate-90' : ''}`}
                />
              </button>

              {activeSection === 'history' && (
                <div className="mx-2 mb-2 rounded-xl bg-muted/30 border border-border/30 overflow-hidden">
                  {history.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No history yet</p>
                  ) : (
                    <div className="divide-y divide-border/20">
                      {history.map((entry, i) => (
                        <div key={i} className="flex items-start gap-2 px-3 py-2.5">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate urdu-text">{entry.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="outline" className="text-xs px-1.5 py-0 capitalize">
                                {entry.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(entry.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Downloads Section */}
              <button
                onClick={() => toggleSection('downloads')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Download className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Downloads</span>
                  {downloads.length > 0 && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      {downloads.length}
                    </Badge>
                  )}
                </div>
                <ChevronRight
                  className={`h-4 w-4 text-muted-foreground transition-transform ${activeSection === 'downloads' ? 'rotate-90' : ''}`}
                />
              </button>

              {activeSection === 'downloads' && (
                <div className="mx-2 mb-2 rounded-xl bg-muted/30 border border-border/30 overflow-hidden">
                  {downloads.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No downloads yet. Download Dua audio to access offline.
                    </p>
                  ) : (
                    <div className="divide-y divide-border/20">
                      {downloads.map((entry) => (
                        <div key={entry.id} className="flex items-center gap-2 px-3 py-2.5">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate urdu-text">{entry.title}</p>
                            <Badge variant="outline" className="text-xs px-1.5 py-0 capitalize mt-0.5">
                              {entry.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => handlePlayDownload(entry)}
                              aria-label={playingDownloadId === entry.id ? 'Pause' : 'Play'}
                            >
                              {playingDownloadId === entry.id ? (
                                <Pause className="h-3.5 w-3.5" />
                              ) : (
                                <Play className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 hover:text-destructive"
                              onClick={() => handleDeleteDownload(entry.id)}
                              aria-label="Delete download"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Volume Manager Section */}
              <button
                onClick={() => toggleSection('volume')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Volume2 className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Volume Manager</span>
                </div>
                <ChevronRight
                  className={`h-4 w-4 text-muted-foreground transition-transform ${activeSection === 'volume' ? 'rotate-90' : ''}`}
                />
              </button>

              {activeSection === 'volume' && (
                <div className="mx-2 mb-2 rounded-xl bg-muted/30 border border-border/30 p-3 space-y-4">
                  {/* Master Volume */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Master Volume
                      </span>
                      <span className="text-xs font-mono text-foreground">
                        {Math.round(volume * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[volume]}
                      max={1}
                      step={0.01}
                      onValueChange={(val) => setVolume(val[0])}
                      className="cursor-pointer"
                    />
                  </div>

                  <Separator />

                  {/* Filter Modes */}
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Audio Filter
                    </span>
                    <div className="space-y-1.5">
                      {filterOptions.map(({ mode, label, desc }) => (
                        <button
                          key={mode}
                          onClick={() => setFilterMode(mode)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-left ${
                            filterMode === mode
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border/40 hover:bg-muted/60 text-foreground'
                          }`}
                        >
                          <div>
                            <p className="text-sm font-medium">{label}</p>
                            <p className="text-xs text-muted-foreground">{desc}</p>
                          </div>
                          {filterMode === mode && (
                            <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <Separator className="my-2" />

              {/* External Links */}
              <a
                href="https://wa.me/919541525891?text=Join%20%E2%80%A2%7C-%C2%B0-%7C%E2%80%A2Program.Writter"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-green-500/10 hover:text-green-600 transition-colors text-left"
                onClick={() => setIsOpen(false)}
              >
                <PenLine className="h-4 w-4 text-green-600" />
                <div>
                  <p className="font-medium text-sm">Be a Writer</p>
                  <p className="text-xs text-muted-foreground">Join our writing program</p>
                </div>
              </a>

              <a
                href="mailto:dariqlas744@gmail.com"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-500/10 hover:text-blue-600 transition-colors text-left"
                onClick={() => setIsOpen(false)}
              >
                <Mail className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">Contact</p>
                  <p className="text-xs text-muted-foreground">dariqlas744@gmail.com</p>
                </div>
              </a>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
