import React, { useEffect, useState } from "react";
import { ResponsiveLine } from "@nivo/line"; // Import Nivo Line Chart
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

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchPDUData();
      console.log("Fetched PDU Data:", data); // Debug fetched data
      setPduData(data);
      setStatuses(data.statuses || []);

      if (data.totalDrawWatts != null) {
        setLoadHistory((prev) => {
          const newHistory = [
            ...prev,
            {
              x: new Date().toISOString(),
              y: data.totalDrawWatts,
            },
          ];
          console.log("Updated Load History:", newHistory); // Log updated history
          return newHistory.slice(-50); // Limit to the last 50 entries
        });
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="site-endpoint-layout">
      <RuxContainer class="sidebar">
        <div slot="header">
          Site Endpoints
          <RuxButton onClick={() => setShowAddForm(true)}>
            Add Endpoint
          </RuxButton>
        </div>
        {showAddForm && (
          <AddSiteEndpointForm
            onSave={(endpoint) => {
              setSiteEndpoints([...siteEndpoints, endpoint]);
              setShowAddForm(false);
            }}
            onCancel={() => setShowAddForm(false)}
          />
        )}
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
      </RuxContainer>
      <div className="main-content">
        {pduData && (
          <>
            <PDU pduData={{ ...pduData, statuses }} toggleStatus={() => {}} />
            <RuxContainer class="chart-container">
              <div slot="header">Load History</div>
              <LoadHistoryChart loadHistory={loadHistory} />
            </RuxContainer>
          </>
        )}
      </div>
    </div>
  );
};

export default SiteEndpointLayout;
