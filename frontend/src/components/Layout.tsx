import { useEffect } from 'react';
import { Link, useRouterState, useNavigate } from '@tanstack/react-router';
import { Music, BookHeart, Sparkles, LayoutGrid } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import HamburgerMenu from './HamburgerMenu';
import BanScreen from './BanScreen';
import MaintenanceScreen from './MaintenanceScreen';
import { useGetUserByDeviceId, useGetMaintenanceMode } from '../hooks/useQueries';

function isLoggedIn(): boolean {
  const name = localStorage.getItem('dmUser_name');
  const server = localStorage.getItem('dmUser_server');
  return !!(name && name.trim() && server && server.trim());
}

function getDeviceId(): string {
  return localStorage.getItem('dmUser_deviceId') ?? '';
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const isActive = (path: string) => currentPath === path;
  const isLoginPage = currentPath === '/login';

  const deviceId = getDeviceId();

  // Check user block status and maintenance mode on every render
  // Only poll when not on login page and deviceId is available
  const { data: userRecord, isLoading: userLoading } = useGetUserByDeviceId(
    !isLoginPage ? deviceId : ''
  );
  const { data: maintenanceMode, isLoading: maintenanceLoading } = useGetMaintenanceMode();

  useEffect(() => {
    if (!isLoginPage && !isLoggedIn()) {
      navigate({ to: '/login' });
    }
  }, [currentPath, isLoginPage, navigate]);

  // If not logged in and not on login page, render nothing while redirect happens
  if (!isLoginPage && !isLoggedIn()) {
    return null;
  }

  // On the login page, render children without the full layout chrome
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Show loading indicator while checking status
  const isChecking = userLoading || maintenanceLoading;
  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is blocked, show ban screen (takes priority over maintenance)
  if (userRecord && userRecord.isBlocked) {
    return <BanScreen />;
  }

  // If maintenance mode is on, show maintenance screen
  if (maintenanceMode === true) {
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
