import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import Layout from './components/Layout';
import MixPage from './pages/MixPage';
import PoetryPage from './pages/PoetryPage';
import DuaPage from './pages/DuaPage';
import SongsPage from './pages/SongsPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import { Toaster } from '@/components/ui/sonner';

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: MixPage,
});

const poetryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/poetry',
  component: PoetryPage,
});

const duaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dua',
  component: DuaPage,
});

const songsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/songs',
  component: SongsPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  indexRoute,
  poetryRoute,
  duaRoute,
  songsRoute,
  adminRoute,
]);

const router = createRouter({ 
  routeTree,
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
