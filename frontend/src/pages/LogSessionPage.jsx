import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getExplorerLink,
  hasContractConfig,
  logSession,
  parseError,
  readDashboard,
} from "../lib/mindBloom";

export default function LogSessionPage() {
  const { wallet, wrongNetwork } = useOutletContext();
  const queryClient = useQueryClient();
  const readyForWrites = Boolean(wallet.account) && hasContractConfig() && !wrongNetwork;

  const [form, setForm] = useState({ practiceType: "", minutesSpent: "20" });
  const [txState, setTxState] = useState({ status: "idle", message: "", hash: "" });

  const dashboardQuery = useQuery({
    queryKey: ["dashboard", wallet.account, wallet.networkPassphrase],
    queryFn: () => readDashboard(wallet.account),
    enabled: readyForWrites,
  });

  const mutation = useMutation({
    mutationFn: async ({ practiceType, minutesSpent }) => {
      setTxState({ status: "pending", message: "Writing session to Stellar...", hash: "" });
      const result = await logSession(wallet.account, practiceType, minutesSpent);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dashboard", wallet.account] }),
        queryClient.invalidateQueries({ queryKey: ["sessions", wallet.account] }),
        queryClient.invalidateQueries({ queryKey: ["activity"] }),
      ]);
      setTxState({ status: "success", message: "Session logged.", hash: result.hash });
      return result;
    },
    onError: (err) => {
      setTxState({ status: "error", message: parseError(err), hash: "" });
    },
  });

  function handleSubmit(e) {
    e.preventDefault();
    const practiceType = form.practiceType.trim();
    const minutesSpent = Number(form.minutesSpent);

    if (!practiceType) {
      setTxState({ status: "error", message: "Enter a practice type.", hash: "" });
      return;
    }
    if (isNaN(minutesSpent) || minutesSpent < 5 || minutesSpent > 480) {
      setTxState({ status: "error", message: "Minutes must be between 5 and 480.", hash: "" });
      return;
    }

    mutation.mutate({ practiceType, minutesSpent });
  }

  const txLink = getExplorerLink(wallet.networkPassphrase, txState.hash);

  if (!wallet.account) {
    return (
      <div className="empty-page">
        <h2>Connect your wallet</h2>
        <p>Connect Freighter to log a mindfulness session.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title">Log Session</h1>

      {txState.message && (
        <div className={`status-bar status-${txState.status}`}>
          <span>{txState.message}</span>
          {txLink && (
            <a href={txLink} target="_blank" rel="noreferrer">View transaction</a>
          )}
        </div>
      )}

      <div className="form-card">
        <form className="form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span className="form-label">Practice type</span>
            <input
              type="text"
              placeholder="Meditation, Breathing, Reflection..."
              value={form.practiceType}
              onChange={(e) => setForm((p) => ({ ...p, practiceType: e.target.value }))}
            />
          </label>

          <label className="form-field">
            <span className="form-label">Minutes</span>
            <input
              type="number"
              min="5"
              max="480"
              step="5"
              value={form.minutesSpent}
              onChange={(e) => setForm((p) => ({ ...p, minutesSpent: e.target.value }))}
            />
          </label>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={mutation.isPending || !readyForWrites || !dashboardQuery.data}
          >
            {mutation.isPending ? "Logging..." : "Log Session"}
          </button>
        </form>
      </div>
    </div>
  );
}
