import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import Layout from "./components/Layout";
import SplashScreen from "./components/SplashScreen";
import AdminPage from "./pages/AdminPage";
import DuaPage from "./pages/DuaPage";
import LoginPage from "./pages/LoginPage";
import MixPage from "./pages/MixPage";
import PoetryPage from "./pages/PoetryPage";
import SongsPage from "./pages/SongsPage";

const SPLASH_KEY = "dm_splashShown";

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: MixPage,
});

const poetryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/poetry",
  component: PoetryPage,
});

const duaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dua",
  component: DuaPage,
});

const songsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/songs",
  component: SongsPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
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
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function shouldShowSplash(): boolean {
  try {
    return !sessionStorage.getItem(SPLASH_KEY);
  } catch {
    return false;
  }
}

export default function App() {
  const [showSplash, setShowSplash] = useState(shouldShowSplash);

  const handleSplashComplete = () => {
    try {
      sessionStorage.setItem(SPLASH_KEY, "1");
    } catch {
      // ignore
    }
    setShowSplash(false);
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {showSplash ? (
        <SplashScreen onComplete={handleSplashComplete} />
      ) : (
        <>
          <RouterProvider router={router} />
          <Toaster />
        </>
      )}
    </ThemeProvider>
  );
}
