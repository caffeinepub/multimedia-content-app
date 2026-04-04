import { MessageCircle, ShieldX } from "lucide-react";

const WHATSAPP_URL = `https://wa.me/919541525891?text=${encodeURIComponent("Blocked.API.9.0")}`;

export default function BanScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background px-6">
      {/* Ambient background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, oklch(0.2 0.06 15) 0%, oklch(0.1 0.02 15) 70%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-6 max-w-sm text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Icon */}
        <div
          className="flex items-center justify-center w-24 h-24 rounded-2xl border"
          style={{
            background: "oklch(0.18 0.04 15 / 0.6)",
            borderColor: "oklch(0.5 0.18 15 / 0.4)",
            boxShadow: "0 0 32px oklch(0.5 0.18 15 / 0.2)",
          }}
        >
          <ShieldX className="h-12 w-12 text-destructive" />
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-foreground">Account Banned</h1>
          <p className="text-muted-foreground leading-relaxed text-sm">
            Our system detects unusual activity from your account. That’s why
            your account has been banned by Developer. If this was by mistake,
            kindly contact us for suggestions and solving queries.
          </p>
        </div>

        {/* Contact Admin Button */}
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-base shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: "#25D366",
            color: "#fff",
            boxShadow: "0 8px 32px rgba(37,211,102,0.35)",
          }}
          data-ocid="ban.primary_button"
        >
          <MessageCircle className="h-5 w-5 flex-shrink-0" />
          Contact Admin
        </a>

        <div className="w-16 h-0.5 rounded-full bg-destructive/30" />
        <p className="text-xs text-muted-foreground/60">— Developer Ikhlas</p>
      </div>
    </div>
  );
}
