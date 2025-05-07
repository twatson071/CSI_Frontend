import React, { useEffect, useState } from "react";
import SiteEndpointsTree from "./SiteEndpointsTree";
import PDU from "../PDU/PDU";
import AddSiteEndpointForm from "./SiteEndpointForm";
import {
  fetchPDUData,
  PDUData,
  toggleOutletPower,
} from "../../services/tripplitePDU";
import "./SiteEndpointLayout.css";
import { RuxContainer, RuxButton } from "@astrouxds/react";
import LoadHistoryChart from "./LoadHistoryChart";

const SiteEndpointLayout: React.FC = () => {
  const [pduData, setPduData] = useState<PDUData | null>(null);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [siteEndpoints, setSiteEndpoints] = useState<any[]>([]);
  const [loadHistory, setLoadHistory] = useState<{ x: string; y: number }[]>(
    []
  );
  const [loadHistoryAmps, setLoadHistoryAmps] = useState<
    { x: string; y: number }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchPDUData();
      setPduData(data);
      setStatuses(data.statuses || []);

      setLoadHistory((prev) => {
        const now = new Date();
        const lastEntry = prev[prev.length - 1];
        const isNewInterval =
          !lastEntry ||
          Math.floor(new Date(lastEntry.x).getTime() / (1 * 60 * 1000)) !==
            Math.floor(now.getTime() / (1 * 60 * 1000));

        if (isNewInterval) {
          const newWattsHistory = [
            ...prev,
            {
              x: now.toISOString(),
              y: (data.totalDrawWatts ?? 0) + Math.random() * 100, //Simulated data with Math.random()
            },
          ].slice(-50); // Limit to the last 50 entries
          return newWattsHistory;
        }
        return prev; // No update if not a new interval
      });

      setLoadHistoryAmps((prev) => {
        const now = new Date();
        const lastEntry = prev[prev.length - 1];
        const isNewInterval =
          !lastEntry ||
          Math.floor(new Date(lastEntry.x).getTime() / (1 * 60 * 1000)) !==
            Math.floor(now.getTime() / (1 * 60 * 1000));

        if (isNewInterval) {
          const newAmpsHistory = [
            ...prev,
            {
              x: now.toISOString(),
              y: (data.totalDrawAmps ?? 0) + Math.random() * 100, // Simulated data with Math.random()
            },
          ].slice(-50); // Limit to the last 50 entries
          return newAmpsHistory;
        }
        return prev; // No update if not a new interval
      });
    };

    fetchData();

    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="site-endpoint-layout">
      <RuxContainer class="sidebar">
        <div slot="header">Site Endpoints</div>
        {pduData && (
          <SiteEndpointsTree
            pduData={{ ...pduData, statuses }}
            toggleStatus={(index) => {
              if (!pduData) return;
              const currentStatus = statuses[index];
              const newState =
                currentStatus === "normal" ? "POWER_OFF" : "POWER_ON";
              toggleOutletPower(index + 1, newState)
                .then(() => fetchPDUData())
                .then((data) => {
                  setPduData(data);
                  setStatuses(data.statuses || []);
                })
                .catch((error) =>
                  console.error("Failed to toggle outlet power:", error)
                );
            }}
          />
        )}
        <div slot="footer">
          <RuxButton onClick={() => setShowAddForm(true)}>
            Add Endpoint
          </RuxButton>
          {showAddForm && (
            <AddSiteEndpointForm
              onSave={(endpoint) => {
                setSiteEndpoints([...siteEndpoints, endpoint]);
                setShowAddForm(false);
              }}
              onCancel={() => setShowAddForm(false)}
            />
          )}
        </div>
      </RuxContainer>
      <div className="main-content">
        {pduData && (
          <>
            <PDU
              pduData={{
                ...pduData,
                label: pduData.label || "Unknown Label",
                statuses,
              }}
              toggleStatus={() => {}}
            />
            <RuxContainer class="chart-container">
              <div slot="header">Load History</div>
              <LoadHistoryChart
                wattsData={loadHistory}
                ampsData={loadHistoryAmps}
              />
            </RuxContainer>
          </>
        )}
      </div>
    </div>
  );
};

export default SiteEndpointLayout;
