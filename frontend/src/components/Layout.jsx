import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  connectWallet,
  configuredNetworkPassphrase,
  discoverWalletState,
  getNetworkLabel,
  parseError,
  shortAddress,
} from "../lib/mindBloom";

export default function Layout() {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState({
    account: "",
    network: "",
    networkPassphrase: "",
    rpcUrl: "",
    isConnecting: false,
    error: "",
  });

  useEffect(() => {
    let mounted = true;
    let watcher = null;

    async function sync() {
      try {
        const state = await discoverWalletState();
        if (mounted) {
          setWallet((prev) => ({ ...prev, ...state, isConnecting: false, error: "" }));
        }
      } catch (err) {
        if (mounted) {
          setWallet((prev) => ({ ...prev, isConnecting: false, error: parseError(err) }));
        }
      }
    }

    async function watch() {
      try {
        const { WatchWalletChanges } = await import("@stellar/freighter-api");
        if (!mounted) return;
        watcher = new WatchWalletChanges(3000);
        watcher.watch(() => sync());
      } catch {
        watcher = null;
      }
    }

    sync();
    watch();
    return () => {
      mounted = false;
      watcher?.stop?.();
    };
  }, []);

  const wrongNetwork =
    Boolean(wallet.networkPassphrase) &&
    wallet.networkPassphrase !== configuredNetworkPassphrase;

  async function handleConnect() {
    setWallet((prev) => ({ ...prev, isConnecting: true, error: "" }));
    try {
      const state = await connectWallet();
      setWallet({ ...state, isConnecting: false, error: "" });
    } catch (err) {
      setWallet((prev) => ({ ...prev, isConnecting: false, error: parseError(err) }));
    }
  }

  const navItems = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/log", label: "Log Session" },
    { to: "/profile", label: "Profile" },
    { to: "/activity", label: "Activity" },
    { to: "/sessions", label: "Sessions" },
    { to: "/analytics", label: "Analytics" },
  ];

  return (
    <div className="app-shell">
      <nav className="top-nav">
        <button className="nav-logo" onClick={() => navigate("/")}>
          MindBloom
        </button>

        <ul className="nav-links">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  isActive ? "nav-link nav-link-active" : "nav-link"
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="nav-right">
          {wrongNetwork && (
            <span className="nav-warning">
              Switch to {getNetworkLabel(configuredNetworkPassphrase)}
            </span>
          )}
          {wallet.account ? (
            <span className="nav-address">{shortAddress(wallet.account)}</span>
          ) : (
            <button
              className="btn btn-sm"
              onClick={handleConnect}
              disabled={wallet.isConnecting}
            >
              {wallet.isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>
      </nav>

      {wallet.error && <div className="status-bar status-error">{wallet.error}</div>}

      <main className="page-content">
        <Outlet context={{ wallet, wrongNetwork }} />
      </main>

      <footer className="app-footer">
        <span>MindBloom — On-chain mindfulness tracker on Stellar</span>
      </footer>
    </div>
  );
}
