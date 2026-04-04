import { Wrench } from "lucide-react";

export default function MaintenanceScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background px-6">
      <div className="flex flex-col items-center gap-6 max-w-md text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Animated icon */}
        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/30">
          <Wrench className="h-12 w-12 text-primary animate-pulse" />
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-foreground">
            Under Maintenance
          </h1>
          <p className="text-muted-foreground leading-relaxed text-base">
            App is currently under maintenance for a better experience. We will
            be back online shortly – Developer Ikhlas.
          </p>
        </div>

        {/* Decorative dots */}
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}
