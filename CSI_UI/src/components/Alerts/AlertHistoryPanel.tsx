import React, { useEffect, useState } from "react";
import { getAlertHistory, clearAlertHistory } from "../../utils/alertHistoryDB";
import type { Alert } from "../../services/AlertService";

interface AlertHistoryPanelProps {
  onBulkAcknowledge?: (ids: number[]) => void;
}

const AlertHistoryPanel: React.FC<AlertHistoryPanelProps> = ({
  onBulkAcknowledge,
}) => {
  const [history, setHistory] = useState<Alert[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getAlertHistory().then((alerts) => {
      setHistory(
        alerts.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
      setLoading(false);
    });
  }, []);

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkAcknowledge = () => {
    if (onBulkAcknowledge) {
      onBulkAcknowledge(Array.from(selected));
    }
    setSelected(new Set());
  };

  const handleBulkDelete = async () => {
    await clearAlertHistory();
    setHistory([]);
    setSelected(new Set());
  };

  const handleExport = () => {
    const exportData = history.filter((a) => selected.has(a.id));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alert_history_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Alert History</h2>
      {loading ? (
        <div>Loading...</div>
      ) : history.length === 0 ? (
        <div>No alert history available.</div>
      ) : (
        <>
          <div style={{ marginBottom: "1rem" }}>
            <button
              onClick={handleBulkAcknowledge}
              disabled={selected.size === 0}
            >
              Acknowledge Selected
            </button>
            <button onClick={handleBulkDelete} style={{ marginLeft: 8 }}>
              Clear History
            </button>
            <button
              onClick={handleExport}
              style={{ marginLeft: 8 }}
              disabled={selected.size === 0}
            >
              Export Selected
            </button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th></th>
                <th>ID</th>
                <th>Severity</th>
                <th>Device</th>
                <th>Message</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((alert) => (
                <tr
                  key={alert.id}
                  style={{
                    background: selected.has(alert.id) ? "#eef" : undefined,
                  }}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.has(alert.id)}
                      onChange={() => toggleSelect(alert.id)}
                    />
                  </td>
                  <td>{alert.id}</td>
                  <td>{alert.severity}</td>
                  <td>{alert.deviceId ?? "N/A"}</td>
                  <td>{alert.message}</td>
                  <td>{new Date(alert.createdAt).toLocaleString()}</td>
                  <td>{alert.acknowledged ? "Acknowledged" : "Active"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default AlertHistoryPanel;
