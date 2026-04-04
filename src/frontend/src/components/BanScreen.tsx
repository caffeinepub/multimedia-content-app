import { MessageCircle, ShieldX } from "lucide-react";

const WHATSAPP_URL = `https://wa.me/919541525891?text=${encodeURIComponent("Blocked.API.9.0")}`;

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
          <h1 className="text-2xl font-bold text-foreground">
            Account Suspended
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Your account has been suspended. Please contact support.
          </p>
        </div>

        {/* Contact Admin Button */}
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#25D366] hover:bg-[#1ebe5d] active:bg-[#17a852] text-white font-semibold text-base shadow-lg shadow-[#25D366]/30 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <MessageCircle className="h-5 w-5 flex-shrink-0" />
          Contact Admin
        </a>

        {/* Decorative divider */}
        <div className="w-16 h-0.5 rounded-full bg-destructive/30" />

        <p className="text-xs text-muted-foreground/60">— Developer Ikhlas</p>
      </div>
    </div>
  );
}
