import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <nav className="landing-nav">
        <span className="landing-logo">MindBloom</span>
      </nav>

      <section className="hero-section">
        <div className="hero-left">
          <p className="hero-label">On-chain mindfulness tracker</p>
          <h1 className="hero-title">Track your calm.<br />Build your streak.</h1>
          <p className="hero-desc">
            Log meditation, breathing, and reflection sessions on Stellar.
            Build a calm streak across mindful days with a wallet-backed
            wellness profile stored on Soroban smart contracts.
          </p>
          <div className="hero-cta">
            <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>
              Enter Dashboard
            </button>
          </div>
          <div className="hero-tags">
            <span className="tag">Soroban powered</span>
            <span className="tag">Calm streaks</span>
            <span className="tag">Live wellness pulse</span>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-card">
            <p className="hero-card-label">How it works</p>
            <ul className="hero-steps">
              <li>
                <span className="step-num">1</span>
                <span>Connect your Freighter wallet on Stellar Testnet</span>
              </li>
              <li>
                <span className="step-num">2</span>
                <span>Create a wellness profile and set a weekly mindfulness goal</span>
              </li>
              <li>
                <span className="step-num">3</span>
                <span>Log meditation, breathing, or reflection sessions on-chain</span>
              </li>
              <li>
                <span className="step-num">4</span>
                <span>Track minutes, calm streaks, and goal milestones in real-time</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">Platform Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Wellness Profiles</h3>
            <p>Create a wallet-backed identity with your display name and weekly mindfulness goals stored on Soroban.</p>
          </div>
          <div className="feature-card">
            <h3>Session Logging</h3>
            <p>Record meditation, breathing, body scan, gratitude, or custom sessions with duration tracking.</p>
          </div>
          <div className="feature-card">
            <h3>Calm Streaks</h3>
            <p>Build consecutive-day streaks that grow automatically when you log mindful sessions across days.</p>
          </div>
          <div className="feature-card">
            <h3>Weekly Goals</h3>
            <p>Set and adjust weekly mindfulness targets. Progress resets at the on-chain week boundary.</p>
          </div>
          <div className="feature-card">
            <h3>Live Activity Feed</h3>
            <p>Public contract event stream that updates every 15 seconds without requiring a wallet connection.</p>
          </div>
          <div className="feature-card">
            <h3>On-Chain Events</h3>
            <p>Every profile save, session log, and goal milestone emits an auditable Soroban contract event.</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <span>MindBloom — Built on Stellar Soroban</span>
      </footer>
    </div>
  );
}
