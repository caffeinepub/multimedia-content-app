import { useEffect, useState, useRef } from 'react';
import { Link, useRouterState, useNavigate } from '@tanstack/react-router';
import { Music, BookHeart, Sparkles, LayoutGrid } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import HamburgerMenu from './HamburgerMenu';
import BanScreen from './BanScreen';
import MaintenanceScreen from './MaintenanceScreen';
import { useActor } from '../hooks/useActor';
import type { UserRecord } from '../backend';

function getStoredCredentials(): { deviceId: string; name: string; server: string } | null {
  const deviceId = localStorage.getItem('dmUser_deviceId') ?? '';
  const name = localStorage.getItem('dmUser_name') ?? '';
  const server = localStorage.getItem('dmUser_server') ?? '';
  if (!deviceId.trim() || !name.trim() || !server.trim()) return null;
  return { deviceId, name, server };
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T | null> {
  const timeout = new Promise<null>((resolve) => {
    setTimeout(() => {
      console.warn(`[Layout] ${label} timed out after ${ms}ms — allowing user through`);
      resolve(null);
    }, ms);
  });
  return Promise.race([promise.catch(() => null), timeout]);
}

type CheckState =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'done'; isBlocked: boolean; isMaintenance: boolean };

export default function Layout({ children }: { children: React.ReactNode }) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { actor, isFetching: actorFetching } = useActor();

  const isActive = (path: string) => currentPath === path;
  const isLoginPage = currentPath === '/login';
  // Admin page has its own PIN-based auth guard — skip credential redirect for it
  const isAdminPage = currentPath === '/admin';
  // Pages that bypass the normal credential/auth check
  const isUnguardedPage = isLoginPage || isAdminPage;

  const [checkState, setCheckState] = useState<CheckState>({ status: 'idle' });
  const hasChecked = useRef(false);

  useEffect(() => {
    // On login or admin page, no guard needed
    if (isUnguardedPage) return;

    // Early exit: no credentials → redirect immediately, no backend calls
    const creds = getStoredCredentials();
    if (!creds) {
      navigate({ to: '/login' });
      return;
    }

    // Wait for actor to be ready before running checks
    if (actorFetching || !actor) {
      setCheckState({ status: 'checking' });
      return;
    }

    // Only run checks once per mount (or when actor becomes available)
    if (hasChecked.current) return;
    hasChecked.current = true;

    setCheckState({ status: 'checking' });

    const runChecks = async () => {
      const [userResult, maintenanceResult] = await Promise.allSettled([
        withTimeout(actor.getUserByDeviceId(creds.deviceId), 4000, 'getUserByDeviceId'),
        withTimeout(actor.getMaintenanceMode(), 4000, 'getMaintenanceMode'),
      ]);

      const userRecord: UserRecord | null =
        userResult.status === 'fulfilled' ? userResult.value : null;
      const maintenanceMode: boolean =
        maintenanceResult.status === 'fulfilled' && maintenanceResult.value === true;

      setCheckState({
        status: 'done',
        isBlocked: !!(userRecord && userRecord.isBlocked),
        isMaintenance: maintenanceMode,
      });
    };

    runChecks();
  }, [isUnguardedPage, actor, actorFetching, navigate, currentPath]);

  // Reset check on route change so re-checks happen on navigation
  useEffect(() => {
    if (!isUnguardedPage) {
      hasChecked.current = false;
    }
  }, [currentPath, isUnguardedPage]);

  // On login page, render children without layout chrome
  if (isLoginPage) {
    return <>{children}</>;
  }

  // On admin page, render children directly — PINAuthGuard handles its own auth
  if (isAdminPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 transition-transform hover:scale-105">
              <img
                src="/assets/generated/dard-e-munasif-logo.dim_200x200.png"
                alt="Dard-e-munasif logo"
                className="h-10 w-10 rounded-full object-cover border border-border/40"
              />
              <span className="text-xl font-semibold bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
                Dard-e-munasif
              </span>
            </Link>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="rounded-full"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="container py-8 animate-in fade-in duration-500">
          {children}
        </main>

        <footer className="border-t border-border/40 bg-muted/30 py-8 mt-16">
          <div className="container text-center text-sm text-muted-foreground">
            <p className="flex items-center justify-center gap-2">
              Built with <span className="text-red-500">♥</span> using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:underline"
              >
                caffeine.ai
              </a>
            </p>
            <p className="mt-2">© {new Date().getFullYear()} Dard-e-munasif. All rights reserved.</p>
          </div>
        </footer>
      </div>
    );
  }

  // No credentials → render nothing while redirect fires
  const creds = getStoredCredentials();
  if (!creds) {
    return null;
  }

  // Show branded loading screen while checks are in progress
  if (checkState.status === 'idle' || checkState.status === 'checking') {
    return (
      <div className="min-h-screen bg-[oklch(0.13_0.02_280)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <img
              src="/assets/generated/dard-e-munasif-logo.dim_200x200.png"
              alt="Dard-e-munasif"
              className="h-20 w-20 rounded-full object-cover border-2 border-[oklch(0.55_0.18_280)] animate-pulse"
            />
            <div className="absolute inset-0 rounded-full border-2 border-[oklch(0.55_0.18_280)] opacity-40 animate-ping" />
          </div>
          <p
            className="text-[oklch(0.75_0.08_280)] text-base tracking-wide"
            style={{ fontFamily: "'Noto Nastaliq Urdu', 'Inter', sans-serif" }}
          >
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // If user is blocked, show ban screen (takes priority over maintenance)
  if (checkState.status === 'done' && checkState.isBlocked) {
    return <BanScreen />;
  }

  // If maintenance mode is on, show maintenance screen
  if (checkState.status === 'done' && checkState.isMaintenance) {
    return <MaintenanceScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 transition-transform hover:scale-105">
            <img
              src="/assets/generated/dard-e-munasif-logo.dim_200x200.png"
              alt="Dard-e-munasif logo"
              className="h-10 w-10 rounded-full object-cover border border-border/40"
            />
            <span className="text-xl font-semibold bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
              Dard-e-munasif
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            <Link to="/">
              <Button
                variant={isActive('/') ? 'default' : 'ghost'}
                className="gap-2 transition-all"
              >
                <LayoutGrid className="h-4 w-4" />
                Mix
              </Button>
            </Link>
            <Link to="/poetry">
              <Button
                variant={isActive('/poetry') ? 'default' : 'ghost'}
                className="gap-2 transition-all"
              >
                <BookHeart className="h-4 w-4" />
                Poetry
              </Button>
            </Link>
            <Link to="/dua">
              <Button
                variant={isActive('/dua') ? 'default' : 'ghost'}
                className="gap-2 transition-all"
              >
                <Sparkles className="h-4 w-4" />
                Dua
              </Button>
            </Link>
            <Link to="/songs">
              <Button
                variant={isActive('/songs') ? 'default' : 'ghost'}
                className="gap-2 transition-all"
              >
                <Music className="h-4 w-4" />
                Songs
              </Button>
            </Link>
          </nav>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-full"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <HamburgerMenu />
          </div>
        </div>

        <nav className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur">
          <div className="container flex items-center justify-around py-2">
            <Link to="/">
              <Button
                variant={isActive('/') ? 'default' : 'ghost'}
                size="sm"
                className="flex-col h-auto py-2 gap-1"
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="text-xs">Mix</span>
              </Button>
            </Link>
            <Link to="/poetry">
              <Button
                variant={isActive('/poetry') ? 'default' : 'ghost'}
                size="sm"
                className="flex-col h-auto py-2 gap-1"
              >
                <BookHeart className="h-4 w-4" />
                <span className="text-xs">Poetry</span>
              </Button>
            </Link>
            <Link to="/dua">
              <Button
                variant={isActive('/dua') ? 'default' : 'ghost'}
                size="sm"
                className="flex-col h-auto py-2 gap-1"
              >
                <Sparkles className="h-4 w-4" />
                <span className="text-xs">Dua</span>
              </Button>
            </Link>
            <Link to="/songs">
              <Button
                variant={isActive('/songs') ? 'default' : 'ghost'}
                size="sm"
                className="flex-col h-auto py-2 gap-1"
              >
                <Music className="h-4 w-4" />
                <span className="text-xs">Songs</span>
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="container py-8 animate-in fade-in duration-500">
        {children}
      </main>

      <footer className="border-t border-border/40 bg-muted/30 py-8 mt-16">
        <div className="container text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            Built with <span className="text-red-500">♥</span> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:underline"
            >
              caffeine.ai
            </a>
          </p>
          <p className="mt-2">© {new Date().getFullYear()} Dard-e-munasif. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
