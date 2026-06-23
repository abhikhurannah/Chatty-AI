import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useThemeStore } from "@/stores/useThemeStore";
import { AuthPage } from "@/components/AuthPage";
import Index from "./pages/Index";
import ProfilePage from "./pages/ProfilePage";
import ThemePicker from "./pages/ThemePicker";
import NotFound from "./pages/NotFound";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { authUser, isCheckingAuth, checkAuth } = useAuthStore();
  const { appTheme, setAppTheme } = useThemeStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Re-apply saved theme class on every mount/refresh
  useEffect(() => {
    setAppTheme(appTheme);
  }, []);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-300/30 border-t-purple-400 mx-auto"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-purple-400/50"></div>
          </div>
          <p className="text-white/80 mt-4 text-lg font-medium">
            Loading Chatty{" "}
            <span className="bg-gradient-to-r from-purple-300 via-blue-300 to-purple-300 bg-clip-text text-transparent font-extrabold animate-pulse">
              AI
            </span>
            ...
          </p>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <>
        <AuthPage />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "rgba(15, 23, 42, 0.9)",
              color: "#fff",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
            },
          }}
        />
      </>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/themes" element={<ThemePicker />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "rgba(15, 23, 42, 0.9)",
            color: "#fff",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
          },
        }}
      />
    </>
  );
};

export default App;
