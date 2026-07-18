import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import LogSessionPage from "./pages/LogSessionPage";
import ProfilePage from "./pages/ProfilePage";
import ActivityFeedPage from "./pages/ActivityFeedPage";
import SessionHistoryPage from "./pages/SessionHistoryPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import "./styles.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 20_000,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/log" element={<LogSessionPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/activity" element={<ActivityFeedPage />} />
            <Route path="/sessions" element={<SessionHistoryPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
