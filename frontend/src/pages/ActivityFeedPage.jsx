import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  configuredContractId,
  formatDate,
  getContractExplorerLink,
  hasContractConfig,
  readContractActivity,
  shortAddress,
} from "../lib/mindBloom";

export default function ActivityFeedPage() {
  const { wallet } = useOutletContext();

  const activityQuery = useQuery({
    queryKey: ["activity", configuredContractId],
    queryFn: () => readContractActivity(12),
    enabled: hasContractConfig(),
    staleTime: 10_000,
    refetchInterval: 15_000,
  });

  const activities = activityQuery.data || [];
  const contractLink = getContractExplorerLink();

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Activity Feed</h1>
        {contractLink && (
          <a className="page-link" href={contractLink} target="_blank" rel="noreferrer">
            View contract
          </a>
        )}
      </div>
      <p className="page-desc">
        Recent events from the deployed contract on Stellar Testnet. Refreshes every 15 seconds.
      </p>

      {activityQuery.isLoading ? (
        <div className="skeleton-list">
          {Array.from({ length: 4 }, (_, i) => (
            <div className="skeleton-card" key={i}>
              <div className="skeleton-line skeleton-w60" />
              <div className="skeleton-line skeleton-w80" />
              <div className="skeleton-line skeleton-w40" />
            </div>
          ))}
        </div>
      ) : !activities.length ? (
        <p className="empty-text">No recent contract events found.</p>
      ) : (
        <div className="activity-list">
          {activities.map((activity) => {
            const isOwn = wallet.account && activity.mindfulUser === wallet.account;
            return (
              <div className={`activity-item${isOwn ? " activity-own" : ""}`} key={activity.id}>
                <div className="activity-top">
                  <span className="activity-badge">{activity.badge}</span>
                  <span className="activity-user">
                    {isOwn ? "You" : shortAddress(activity.mindfulUser)}
                  </span>
                </div>
                <h3 className="activity-title">{activity.title}</h3>
                <p className="activity-detail">{activity.detail}</p>
                <div className="activity-bottom">
                  <span className="activity-time">{formatDate(activity.timestamp)}</span>
                  {activity.explorerLink && (
                    <a href={activity.explorerLink} target="_blank" rel="noreferrer">
                      View tx
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
