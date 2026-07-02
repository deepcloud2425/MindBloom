import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  formatDate,
  formatMinutes,
  hasContractConfig,
  readDashboard,
  readRecentSessions,
} from "../lib/mindBloom";

export default function SessionHistoryPage() {
  const { wallet, wrongNetwork } = useOutletContext();
  const readyForReads = Boolean(wallet.account) && hasContractConfig() && !wrongNetwork;

  const dashboardQuery = useQuery({
    queryKey: ["dashboard", wallet.account, wallet.networkPassphrase],
    queryFn: () => readDashboard(wallet.account),
    enabled: readyForReads,
  });

  const sessionsQuery = useQuery({
    queryKey: [
      "sessions",
      wallet.account,
      wallet.networkPassphrase,
      dashboardQuery.data?.sessionCount || 0,
    ],
    queryFn: () => readRecentSessions(wallet.account, 10),
    enabled: readyForReads && Boolean(dashboardQuery.data),
  });

  if (!wallet.account) {
    return (
      <div className="empty-page">
        <h2>Connect your wallet</h2>
        <p>Connect Freighter to view your session history.</p>
      </div>
    );
  }

  const sessions = sessionsQuery.data || [];

  return (
    <div className="page">
      <h1 className="page-title">Session History</h1>
      <p className="page-desc">Your recent mindfulness sessions read from the deployed contract.</p>

      {sessionsQuery.isLoading ? (
        <div className="skeleton-list">
          {Array.from({ length: 3 }, (_, i) => (
            <div className="skeleton-card" key={i}>
              <div className="skeleton-line skeleton-w60" />
              <div className="skeleton-line skeleton-w40" />
            </div>
          ))}
        </div>
      ) : !sessions.length ? (
        <p className="empty-text">
          {dashboardQuery.data
            ? "No sessions logged yet. Head to Log Session to get started."
            : "Create a wellness profile first."}
        </p>
      ) : (
        <div className="session-list">
          {sessions.map((session) => (
            <div className="session-item" key={session.id}>
              <div className="session-left">
                <h3 className="session-type">{session.practiceType}</h3>
                <p className="session-date">{formatDate(session.timestamp)}</p>
              </div>
              <div className="session-right">
                <span className="session-duration">{formatMinutes(session.minutesSpent)}</span>
                <span className="session-streak">Streak: {session.streakAfterLog}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
