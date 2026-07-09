import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getExplorerLink,
  hasContractConfig,
  parseError,
  readDashboard,
  saveProfile,
  updateWeeklyGoal,
} from "../lib/mindBloom";

export default function ProfilePage() {
  const { wallet, wrongNetwork } = useOutletContext();
  const queryClient = useQueryClient();
  const readyForWrites = Boolean(wallet.account) && hasContractConfig() && !wrongNetwork;

  const [profileForm, setProfileForm] = useState({ displayName: "", weeklyGoalMinutes: "240" });
  const [goalForm, setGoalForm] = useState("300");
  const [txState, setTxState] = useState({ status: "idle", message: "", hash: "" });

  const dashboardQuery = useQuery({
    queryKey: ["dashboard", wallet.account, wallet.networkPassphrase],
    queryFn: () => readDashboard(wallet.account),
    enabled: readyForWrites,
  });

  const dashboard = dashboardQuery.data;

  useEffect(() => {
    if (!dashboard) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGoalForm(String(dashboard.weeklyGoalMinutes));
    setProfileForm((p) => ({
      displayName: p.displayName || dashboard.displayName,
      weeklyGoalMinutes: p.weeklyGoalMinutes || String(dashboard.weeklyGoalMinutes),
    }));
  }, [dashboard]);

  async function runAction(action, pending, success) {
    setTxState({ status: "pending", message: pending, hash: "" });
    try {
      const result = await action();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dashboard", wallet.account] }),
        queryClient.invalidateQueries({ queryKey: ["activity"] }),
      ]);
      setTxState({ status: "success", message: success, hash: result.hash });
    } catch (err) {
      setTxState({ status: "error", message: parseError(err), hash: "" });
    }
  }

  const saveMutation = useMutation({
    mutationFn: ({ displayName, weeklyGoalMinutes }) =>
      runAction(
        () => saveProfile(wallet.account, displayName, weeklyGoalMinutes),
        "Saving profile...",
        "Profile saved."
      ),
  });

  const goalMutation = useMutation({
    mutationFn: ({ weeklyGoalMinutes }) =>
      runAction(
        () => updateWeeklyGoal(wallet.account, weeklyGoalMinutes),
        "Updating goal...",
        "Weekly goal updated."
      ),
  });

  function handleProfileSubmit(e) {
    e.preventDefault();
    const displayName = profileForm.displayName.trim();
    const weeklyGoalMinutes = Number(profileForm.weeklyGoalMinutes);
    if (!displayName) {
      setTxState({ status: "error", message: "Enter a display name.", hash: "" });
      return;
    }
    if (isNaN(weeklyGoalMinutes) || weeklyGoalMinutes < 30 || weeklyGoalMinutes > 5000) {
      setTxState({ status: "error", message: "Goal must be 30-5000 minutes.", hash: "" });
      return;
    }
    saveMutation.mutate({ displayName, weeklyGoalMinutes });
  }

  function handleGoalSubmit(e) {
    e.preventDefault();
    const weeklyGoalMinutes = Number(goalForm);
    if (isNaN(weeklyGoalMinutes) || weeklyGoalMinutes < 30 || weeklyGoalMinutes > 5000) {
      setTxState({ status: "error", message: "Goal must be 30-5000 minutes.", hash: "" });
      return;
    }
    goalMutation.mutate({ weeklyGoalMinutes });
  }

  const anyPending = saveMutation.isPending || goalMutation.isPending;
  const txLink = getExplorerLink(wallet.networkPassphrase, txState.hash);

  if (!wallet.account) {
    return (
      <div className="empty-page">
        <h2>Connect your wallet</h2>
        <p>Connect Freighter to manage your wellness profile.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title">Profile</h1>

      {txState.message && (
        <div className={`status-bar status-${txState.status}`}>
          <span>{txState.message}</span>
          {txLink && (
            <a href={txLink} target="_blank" rel="noreferrer">View transaction</a>
          )}
        </div>
      )}

      <div className="form-grid-two">
        <div className="form-card">
          <h2 className="card-title">Wellness Profile</h2>
          <p className="card-desc">Save a public display name and weekly mindfulness goal.</p>
          <form className="form" onSubmit={handleProfileSubmit}>
            <label className="form-field">
              <span className="form-label">Display name</span>
              <input
                type="text"
                placeholder="Still Harbor"
                value={profileForm.displayName}
                onChange={(e) => setProfileForm((p) => ({ ...p, displayName: e.target.value }))}
              />
            </label>
            <label className="form-field">
              <span className="form-label">Weekly goal (minutes)</span>
              <input
                type="number"
                min="30"
                max="5000"
                step="5"
                value={profileForm.weeklyGoalMinutes}
                onChange={(e) =>
                  setProfileForm((p) => ({ ...p, weeklyGoalMinutes: e.target.value }))
                }
              />
            </label>
            <button className="btn btn-primary" type="submit" disabled={anyPending || !readyForWrites}>
              {saveMutation.isPending ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>

        <div className="form-card">
          <h2 className="card-title">Adjust Weekly Goal</h2>
          <p className="card-desc">Update your target. Weekly progress resets at the next boundary.</p>
          <form className="form" onSubmit={handleGoalSubmit}>
            <label className="form-field">
              <span className="form-label">New weekly goal (minutes)</span>
              <input
                type="number"
                min="30"
                max="5000"
                step="5"
                value={goalForm}
                onChange={(e) => setGoalForm(e.target.value)}
              />
            </label>
            <button
              className="btn btn-secondary"
              type="submit"
              disabled={anyPending || !readyForWrites || !dashboard}
            >
              {goalMutation.isPending ? "Updating..." : "Update Goal"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
