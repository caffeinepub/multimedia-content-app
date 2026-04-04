import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, Loader2, Phone, User, Wifi } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useActor } from "../hooks/useActor";
import { useRegisterUser } from "../hooks/useQueries";

/**
 * Generate a stable device fingerprint from browser properties.
 * Stored in localStorage under 'dmUser_deviceId'.
 */
function getOrCreateDeviceId(): string {
  const stored = localStorage.getItem("dmUser_deviceId");
  if (stored) return stored;

  const raw = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    navigator.hardwareConcurrency ?? 0,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.platform ?? "",
  ].join("|");

  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const deviceId = `DID-${Math.abs(hash).toString(16).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  localStorage.setItem("dmUser_deviceId", deviceId);
  return deviceId;
}

/**
 * Validate Indian phone numbers only.
 * Accepts:
 *  - +91XXXXXXXXXX  (13 chars)
 *  - 91XXXXXXXXXX   (12 chars)
 *  - 0XXXXXXXXXX    (11 chars)
 *  - XXXXXXXXXX     (10 chars)
 * Where XXXXXXXXXX is a 10-digit number starting with 6, 7, 8, or 9.
 */
function validateIndianPhone(value: string): boolean {
  const cleaned = value.replace(/[\s\-()]/g, "");
  // Strip country prefix variants
  let digits = cleaned;
  if (digits.startsWith("+91")) digits = digits.slice(3);
  else if (digits.startsWith("91") && digits.length === 12)
    digits = digits.slice(2);
  else if (digits.startsWith("0") && digits.length === 11)
    digits = digits.slice(1);

  // Must be exactly 10 digits starting with 6, 7, 8, or 9
  return /^[6-9]\d{9}$/.test(digits);
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [waitingForActor, setWaitingForActor] = useState(false);

  const { actor, isFetching: actorLoading } = useActor();
  const registerUser = useRegisterUser();

  // Ref to track pending login attempt while waiting for actor
  const pendingLoginRef = useRef(false);

  // If user is already registered, redirect to home
  useEffect(() => {
    const existingCode = localStorage.getItem("dmUser_uniqueCode");
    if (existingCode) {
      navigate({ to: "/" });
    }
  }, [navigate]);

  // When actor becomes available after a pending login attempt, auto-submit
  useEffect(() => {
    if (!actorLoading && actor && pendingLoginRef.current) {
      pendingLoginRef.current = false;
      setWaitingForActor(false);
      performLogin();
    }
  }, [actorLoading, actor]);

  const performLogin = async () => {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName || !trimmedPhone) return;
    if (!actor) return;

    setIsSubmitting(true);
    setRegisterError("");

    const deviceId = getOrCreateDeviceId();

    try {
      const uniqueCode = await registerUser.mutateAsync({
        name: trimmedName,
        server: trimmedPhone,
        deviceId,
      });

      localStorage.setItem("dmUser_name", trimmedName);
      localStorage.setItem("dmUser_server", trimmedPhone);
      localStorage.setItem("dmUser_uniqueCode", uniqueCode);

      navigate({ to: "/" });
    } catch (err: unknown) {
      const raw = (err as any)?.message || "";
      setRegisterError(raw || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async () => {
    let valid = true;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("Please enter your name to continue.");
      valid = false;
    } else {
      setNameError("");
    }

    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      setPhoneError("Please enter your phone number.");
      valid = false;
    } else if (!validateIndianPhone(trimmedPhone)) {
      setPhoneError("Only Indian numbers are allowed (e.g. +91 98765 43210).");
      valid = false;
    } else {
      setPhoneError("");
    }

    if (!valid) return;

    // If actor is still loading, queue the login attempt
    if (actorLoading || !actor) {
      setWaitingForActor(true);
      pendingLoginRef.current = true;
      setRegisterError("");
      return;
    }

    await performLogin();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  const isLoading = isSubmitting || waitingForActor;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 flex flex-col items-center justify-center px-4">
      {/* Logo / Brand */}
      <div className="mb-8 flex flex-col items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
        <img
          src="/assets/generated/dard-e-munasif-logo.dim_200x200.png"
          alt="Dard-e-munasif"
          className="h-20 w-20 rounded-full object-cover border-2 border-primary/30 shadow-lg shadow-primary/20"
        />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent tracking-tight">
          Dard-e-munasif
        </h1>
        <p className="text-sm text-muted-foreground">
          Connect to experience poetry, dua &amp; music
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-xl shadow-primary/5 p-8">
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-4">
                <User className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Welcome</h2>
              <p className="text-sm text-muted-foreground">
                Enter your details to get started
              </p>
            </div>

            {/* Name field */}
            <div className="space-y-2">
              <Label
                htmlFor="name-input"
                className="text-sm font-medium text-foreground"
              >
                Your Name
              </Label>
              <Input
                id="name-input"
                type="text"
                placeholder="Enter your name..."
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError("");
                }}
                onKeyDown={handleKeyDown}
                className="h-11 rounded-xl border-border/60 bg-background/60 focus:border-primary/60 transition-colors"
                autoFocus
              />
              {nameError && (
                <p className="text-xs text-destructive animate-in fade-in duration-200">
                  {nameError}
                </p>
              )}
            </div>

            {/* Phone field */}
            <div className="space-y-2">
              <Label
                htmlFor="phone-input"
                className="text-sm font-medium text-foreground"
              >
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="phone-input"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (phoneError) setPhoneError("");
                  }}
                  onKeyDown={handleKeyDown}
                  className="h-11 rounded-xl border-border/60 bg-background/60 focus:border-primary/60 transition-colors pl-10"
                />
              </div>
              {phoneError && (
                <p className="text-xs text-destructive animate-in fade-in duration-200">
                  {phoneError}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                🇮🇳 Indian numbers only (+91 or 10-digit)
              </p>
            </div>

            {/* Error banner */}
            {registerError && (
              <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive animate-in fade-in duration-200">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{registerError}</span>
              </div>
            )}

            {/* Waiting / connecting indicator */}
            {waitingForActor && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center bg-muted/30 rounded-lg p-3">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Connecting to server, please wait…</span>
              </div>
            )}

            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full h-11 rounded-xl font-semibold gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {waitingForActor ? "Connecting…" : "Logging in…"}
                </>
              ) : (
                <>
                  <Wifi className="h-4 w-4" />
                  Login
                </>
              )}
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Built with <span className="text-red-400">♥</span> using{" "}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-muted-foreground/80"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
