import { Button } from "@/components/ui/button";
import { RefreshCw, Wrench } from "lucide-react";

export default function MaintenanceScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background px-6">
      {/* Ambient background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, oklch(0.25 0.06 280) 0%, oklch(0.12 0.02 270) 70%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-6 max-w-md text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Animated icon */}
        <div
          className="flex items-center justify-center w-24 h-24 rounded-2xl border"
          style={{
            background: "oklch(0.2 0.05 280 / 0.5)",
            borderColor: "oklch(0.45 0.12 280 / 0.4)",
            boxShadow: "0 0 32px oklch(0.45 0.12 280 / 0.2)",
          }}
        >
          <Wrench className="h-12 w-12 text-primary animate-pulse" />
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Under Maintenance
          </h1>
          <p className="text-muted-foreground leading-relaxed text-base">
            App is currently under maintenance for a better experience. We will
            be back online shortly. Thank you for your patience – Developer
            Ikhlas.
          </p>
        </div>

        {/* Check Status button */}
        <Button
          onClick={() => window.location.reload()}
          size="lg"
          className="gap-2 rounded-xl px-8 font-semibold"
          data-ocid="maintenance.primary_button"
        >
          <RefreshCw className="h-5 w-5" />
          Check Status
        </Button>

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
