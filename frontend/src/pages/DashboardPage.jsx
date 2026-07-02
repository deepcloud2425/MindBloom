import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  configuredContractId,
  formatMinutes,
  getContractExplorerLink,
  hasContractConfig,
  readContractActivity,
  readDashboard,
  shortAddress,
} from "../lib/mindBloom";

export default function DashboardPage() {
  const { wallet, wrongNetwork } = useOutletContext();
  const readyForReads = Boolean(wallet.account) && hasContractConfig() && !wrongNetwork;

  const dashboardQuery = useQuery({
    queryKey: ["dashboard", wallet.account, wallet.networkPassphrase],
    queryFn: () => readDashboard(wallet.account),
    enabled: readyForReads,
  });

  const activityQuery = useQuery({
    queryKey: ["activity", configuredContractId],
    queryFn: () => readContractActivity(8),
    enabled: hasContractConfig(),
    staleTime: 10_000,
    refetchInterval: 15_000,
  });

  const dashboard = dashboardQuery.data;
  const contractLink = getContractExplorerLink();

  const weeklyProgress = useMemo(() => {
    if (!dashboard?.weeklyGoalMinutes) return 0;
    return Math.min(100, Math.round((dashboard.minutesThisWeek / dashboard.weeklyGoalMinutes) * 100));
  }, [dashboard]);

  const activitySummary = useMemo(() => {
    const activities = activityQuery.data || [];
    const users = new Set(activities.map((a) => a.mindfulUser).filter(Boolean));
    return {
      eventCount: activities.length,
      userCount: users.size,
      goalReached: activities.filter((a) => a.kind === "weekly_goal_reached").length,
      sessions: activities.filter((a) => a.kind === "session_logged").length,
    };
  }, [activityQuery.data]);

  if (!wallet.account) {
    return (
      <div className="empty-page">
        <h2>Connect your wallet</h2>
        <p>Connect Freighter on Stellar Testnet to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title">Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Mindful Minutes</p>
          <p className="stat-value">
            {dashboardQuery.isLoading ? "—" : dashboard ? formatMinutes(dashboard.totalMinutes) : "0m"}
          </p>
          <p className="stat-note">
            {dashboard ? `${dashboard.sessionCount} sessions recorded` : "No sessions yet"}
          </p>
        </div>

        <div className="stat-card">
          <p className="stat-label">This Week</p>
          <p className="stat-value">
            {dashboardQuery.isLoading ? "—" : dashboard ? formatMinutes(dashboard.minutesThisWeek) : "0m"}
          </p>
          <p className="stat-note">
            {dashboard
              ? `${Math.max(dashboard.weeklyGoalMinutes - dashboard.minutesThisWeek, 0)} min left`
              : "Set a weekly goal"}
          </p>
        </div>

        <div className="stat-card">
          <p className="stat-label">Calm Streak</p>
          <p className="stat-value">
            {dashboardQuery.isLoading
              ? "—"
              : dashboard
                ? `${dashboard.currentStreak} day${dashboard.currentStreak === 1 ? "" : "s"}`
                : "0 days"}
          </p>
          <p className="stat-note">
            {dashboard?.goalReachedThisWeek ? "Weekly goal met" : "Keep logging daily"}
          </p>
        </div>

        <div className="stat-card">
          <p className="stat-label">Profile</p>
          <p className="stat-value stat-value-sm">
            {dashboardQuery.isLoading ? "—" : dashboard?.displayName || "No profile"}
          </p>
          <p className="stat-note">{shortAddress(wallet.account)}</p>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-header">
          <span>Weekly Goal Progress</span>
          <span>{dashboard ? `${weeklyProgress}%` : "0%"}</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${weeklyProgress}%` }} />
        </div>
      </div>

      <div className="dashboard-meta">
        <div className="meta-row">
          <span className="meta-label">Contract Pulse</span>
          <span>{activitySummary.eventCount} events, {activitySummary.userCount} wallets</span>
        </div>
        <div className="meta-row">
          <span className="meta-label">Sessions Logged</span>
          <span>{activitySummary.sessions}</span>
        </div>
        <div className="meta-row">
          <span className="meta-label">Goals Reached</span>
          <span>{activitySummary.goalReached}</span>
        </div>
        {contractLink && (
          <div className="meta-row">
            <span className="meta-label">Contract</span>
            <a href={contractLink} target="_blank" rel="noreferrer">{shortAddress(configuredContractId)}</a>
          </div>
        )}
      </div>
    </div>
  );
}
