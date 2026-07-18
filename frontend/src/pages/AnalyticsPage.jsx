import { useOutletContext } from "react-router-dom";

export default function AnalyticsPage() {
  const { wallet } = useOutletContext();

  return (
    <div className="page">
      <h1 className="page-title">Advanced Analytics (Coming Soon)</h1>
      <p className="page-desc">
        Based on feedback from our Level 5 user testing, we are building an advanced analytics dashboard.
        You will soon be able to see detailed mindfulness insights, heatmaps of your practice consistency, and more.
      </p>

      {!wallet.account ? (
        <div className="empty-page">
          <h2>Connect your wallet</h2>
          <p>Connect Freighter to view your analytics.</p>
        </div>
      ) : (
        <div className="form-card">
          <h2 className="card-title">Feature in Development</h2>
          <p className="card-desc">We are analyzing on-chain data for {wallet.account.substring(0, 8)}... to generate your custom wellness report.</p>
          <div style={{ marginTop: '20px', padding: '20px', border: '1px dashed var(--border)', borderRadius: 'var(--radius)' }}>
            <p style={{ color: 'var(--ink-muted)', textAlign: 'center' }}>Chart Visualization Placeholder</p>
          </div>
        </div>
      )}
    </div>
  );
}
