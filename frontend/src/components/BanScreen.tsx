import { ShieldX } from 'lucide-react';

export default function BanScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background px-6">
      <div className="flex flex-col items-center gap-6 max-w-sm text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Icon */}
        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-destructive/10 border-2 border-destructive/30">
          <ShieldX className="h-12 w-12 text-destructive" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Account Suspended</h1>
          <p className="text-muted-foreground leading-relaxed">
            Your account has been suspended. Please contact support.
          </p>
        </div>

        {/* Decorative divider */}
        <div className="w-16 h-0.5 rounded-full bg-destructive/30" />

        <p className="text-xs text-muted-foreground/60">
          — Developer Ikhlas
        </p>
      </div>
    </div>
  );
}
