import { Button } from "@/components/ui/button";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BookHeart,
  LayoutGrid,
  Moon,
  Music,
  Sparkles,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useActor } from "../hooks/useActor";
import {
  useGetMaintenanceMode,
  useGetUserByDeviceId,
} from "../hooks/useQueries";
import BanScreen from "./BanScreen";
import HamburgerMenu from "./HamburgerMenu";
import MaintenanceScreen from "./MaintenanceScreen";

function getStoredCredentials(): {
  deviceId: string;
  name: string;
  server: string;
} | null {
  const deviceId = localStorage.getItem("dmUser_deviceId") ?? "";
  const name = localStorage.getItem("dmUser_name") ?? "";
  const server = localStorage.getItem("dmUser_server") ?? "";
  if (!deviceId.trim() || !name.trim() || !server.trim()) return null;
  return { deviceId, name, server };
}

function LoggedOutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Maximum time (ms) to wait for actor/maintenance/user queries before
// proceeding anyway. Prevents the loading screen from hanging forever.
const LOADING_TIMEOUT_MS = 8000;

export default function Layout({ children }: { children: React.ReactNode }) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { isFetching: actorFetching } = useActor();

  // After LOADING_TIMEOUT_MS, stop waiting and show content anyway
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoadingTimedOut(true), LOADING_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, []);

  const isActive = (path: string) => currentPath === path;
  const isLoginPage = currentPath === "/login";
  const isAdminPage = currentPath === "/admin";
  const isUnguardedPage = isLoginPage || isAdminPage;

  const creds = getStoredCredentials();

  // Redirect to login if no credentials and not on unguarded page
  useEffect(() => {
    if (!isUnguardedPage && !creds) {
      navigate({ to: "/login" });
    }
  }, [isUnguardedPage, creds, navigate]);

  // Use React Query to poll maintenance mode and user status (every 10s)
  const { data: isMaintenance = false, isLoading: maintenanceLoading } =
    useGetMaintenanceMode();

  const { data: userRecord, isLoading: userLoading } = useGetUserByDeviceId(
    isUnguardedPage ? "" : (creds?.deviceId ?? ""),
  );

  const isBlocked = !!userRecord?.isBlocked;

  // Auto-logout blocked users
  useEffect(() => {
    if (isUnguardedPage) return;
    if (!userLoading && isBlocked) {
      // Clear login data so they can't refresh back in
      localStorage.removeItem("dmUser_deviceId");
      localStorage.removeItem("dmUser_name");
      localStorage.removeItem("dmUser_server");
    }
  }, [isBlocked, userLoading, isUnguardedPage]);

  if (isLoginPage) {
    return <LoggedOutLayout>{children}</LoggedOutLayout>;
  }

  const headerContent = (
    <header
      className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
      style={{ borderColor: "oklch(var(--border) / 0.4)" }}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link
          to="/"
          className="flex items-center space-x-2.5 transition-transform hover:scale-105"
          data-ocid="nav.link"
        >
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full blur-md opacity-50"
              style={{ background: "oklch(0.6 0.2 280)" }}
            />
            <img
              src="/assets/generated/dard-e-munasif-logo.dim_200x200.png"
              alt="Aks-e-bilkees logo"
              className="relative h-9 w-9 rounded-full object-cover"
              style={{ border: "1.5px solid oklch(0.55 0.18 280 / 0.6)" }}
            />
          </div>
          <span
            className="text-lg font-bold tracking-tight"
            style={{
              fontFamily: "'Playfair Display', serif",
              background:
                "linear-gradient(135deg, oklch(var(--chart-1)), oklch(var(--chart-2)))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Aks-e-bilkees
          </span>
        </Link>

        {!isAdminPage && (
          <nav className="hidden md:flex items-center space-x-1">
            {[
              {
                to: "/",
                label: "Mix",
                icon: <LayoutGrid className="h-4 w-4" />,
              },
              {
                to: "/poetry",
                label: "Poetry",
                icon: <BookHeart className="h-4 w-4" />,
              },
              {
                to: "/dua",
                label: "Dua",
                icon: <Sparkles className="h-4 w-4" />,
              },
              {
                to: "/songs",
                label: "Songs",
                icon: <Music className="h-4 w-4" />,
              },
            ].map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                data-ocid={`nav.${label.toLowerCase()}.link`}
              >
                <Button
                  variant={isActive(to) ? "default" : "ghost"}
                  className={`gap-2 transition-all rounded-xl ${
                    isActive(to)
                      ? "shadow-sm"
                      : "hover:bg-primary/8 hover:text-primary"
                  }`}
                >
                  {icon}
                  {label}
                </Button>
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          {!isAdminPage && <HamburgerMenu />}
        </div>
      </div>

      {/* Mobile nav */}
      {!isAdminPage && (
        <nav
          className="md:hidden border-t bg-background/80 backdrop-blur-xl"
          style={{ borderColor: "oklch(var(--border) / 0.4)" }}
        >
          <div className="container flex items-center justify-around py-1.5">
            {[
              {
                to: "/",
                label: "Mix",
                icon: <LayoutGrid className="h-4 w-4" />,
              },
              {
                to: "/poetry",
                label: "Poetry",
                icon: <BookHeart className="h-4 w-4" />,
              },
              {
                to: "/dua",
                label: "Dua",
                icon: <Sparkles className="h-4 w-4" />,
              },
              {
                to: "/songs",
                label: "Songs",
                icon: <Music className="h-4 w-4" />,
              },
            ].map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                data-ocid={`nav.${label.toLowerCase()}.mobile.link`}
              >
                <Button
                  variant={isActive(to) ? "default" : "ghost"}
                  size="sm"
                  className="flex-col h-auto py-2 gap-0.5 rounded-xl min-w-[56px]"
                >
                  {icon}
                  <span className="text-[10px] font-medium">{label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );

  const footerContent = (
    <footer
      className="border-t py-8 mt-16"
      style={{
        borderColor: "oklch(var(--border) / 0.4)",
        background: "oklch(var(--muted) / 0.3)",
      }}
    >
      <div className="container text-center text-sm text-muted-foreground">
        <p className="flex items-center justify-center gap-2">
          Built with <span className="text-red-500">♥</span> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-foreground hover:underline"
          >
            caffeine.ai
          </a>
        </p>
        <p className="mt-1.5 text-xs">
          &copy; {new Date().getFullYear()} Aks-e-bilkees. All rights reserved.
        </p>
      </div>
    </footer>
  );

  if (isAdminPage) {
    return (
      <div className="min-h-screen bg-background">
        {headerContent}
        <main className="container py-8 animate-in">{children}</main>
        {footerContent}
      </div>
    );
  }

  // If no credentials, show nothing while redirect happens
  if (!creds) return null;

  // Show loading spinner only while genuinely initialising AND not timed out.
  // The timeout prevents the loading screen from hanging forever if the
  // backend connection is slow.
  const initialising =
    !loadingTimedOut &&
    (actorFetching ||
      (maintenanceLoading && !isMaintenance) ||
      (userLoading && !userRecord));

  if (initialising && !isMaintenance && !isBlocked) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, oklch(0.2 0.06 280) 0%, oklch(0.1 0.02 270) 100%)",
        }}
      >
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <img
              src="/assets/generated/dard-e-munasif-logo.dim_200x200.png"
              alt="Aks-e-bilkees"
              className="h-20 w-20 rounded-full object-cover animate-pulse"
              style={{ border: "2px solid oklch(0.55 0.18 280)" }}
            />
            <div
              className="absolute inset-0 rounded-full border-2 opacity-40 animate-ping"
              style={{ borderColor: "oklch(0.55 0.18 280)" }}
            />
          </div>
          <p
            className="text-base tracking-wide"
            style={{
              color: "oklch(0.65 0.1 280)",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Loading…
          </p>
        </div>
      </div>
    );
  }

  // Blocked check (takes priority over maintenance)
  if (isBlocked) {
    return <BanScreen />;
  }

  // Maintenance check
  if (isMaintenance) {
    return <MaintenanceScreen />;
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(ellipse at 70% 0%, oklch(0.2 0.04 280 / 0.15) 0%, transparent 60%), oklch(var(--background))",
      }}
    >
      {headerContent}
      <main className="container py-8 animate-in">{children}</main>
      {footerContent}
    </div>
  );
}
