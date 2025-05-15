import React, { useEffect, useState } from "react";
import SiteEndpointsTree from "./SiteEndpointsTree";
import PDU from "../PDU/PDU";
import AddSiteEndpointForm from "./SiteEndpointForm";
import {
  fetchSitesWithDevices,
  SiteWithDevices,
} from "../../services/siteService";
import { PDUData, toggleOutletPower } from "../../services/PDUservice";
import "./SiteEndpointLayout.css";
import { RuxContainer, RuxButton } from "@astrouxds/react";
import LoadHistoryChart from "./LoadHistoryChart";

const SiteEndpointLayout: React.FC = () => {
  // each `site.devices[*].data` already holds the PDUData
  const [sites, setSites] = useState<SiteWithDevices[]>([]);

  // track selection
  const [selectedSiteIdx, setSelectedSiteIdx] = useState(0);
  const [selectedDevIdx, setSelectedDevIdx] = useState(0);

  // what we pass down to <PDU>
  const [pduData, setPduData] = useState<PDUData | null>(null);
  // compute statuses from data.parameters.outlets
  const [statuses, setStatuses] = useState<string[]>([]);
  let toggleEndpointForm = false; //don't show the form by default
  useEffect(() => {
    const fetchAll = async () => {
      // load sites → devices → data in one call
      const siteList = await fetchSitesWithDevices();
      setSites(siteList); // initialize first PDU
      console.log(siteList);
      if (siteList[0].devices && siteList[0].devices.length > 0) {
        const raw = siteList[0].devices[0].data as any;
        setPduData(raw);
        // derive statuses from parameters.outlets
        const sts = Object.keys(raw.parameters.outlets)
          .sort()
          .map((k) =>
            raw.parameters.outlets[k].state === "POWER_ON" ? "normal" : "off"
          );
        setStatuses(sts);
      }
    };

    fetchAll();
    //const interval = setInterval(fetchAll, 5000);
    //return () => clearInterval(interval);
  }, []);

  const onSelect = (siteIdx: number, devIdx: number) => {
    setSelectedSiteIdx(siteIdx);
    setSelectedDevIdx(devIdx);
    const raw = sites[siteIdx].devices[devIdx].data as any;
    setPduData(raw);
    // update statuses when user picks a new device
    const sts = Object.keys(raw.parameters.outlets)
      .sort()
      .map((k) =>
        raw.parameters.outlets[k].state === "POWER_ON" ? "normal" : "off"
      );
    setStatuses(sts);
  };
  const [showAddForm, setShowAddForm] = useState(false);
  return (
    <div className="site-endpoint-layout">
      <RuxContainer class="sidebar">
        <div slot="header">Site Endpoints</div>
        {sites.length > 0 && (
          <SiteEndpointsTree
            sites={sites}
            selectedSite={selectedSiteIdx}
            selectedDevice={selectedDevIdx}
            onSelect={onSelect}
          />
        )}
        <div slot="footer">
          <RuxButton
            onClick={() =>
              setShowAddForm((toggleEndpointForm = !toggleEndpointForm))
            }
          >
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
              // pass computed statuses into the PDU component
              pduData={{ ...pduData!, statuses }}
              toggleStatus={(index) => {
                const current = statuses[index];
                const next = current === "normal" ? "POWER_OFF" : "POWER_ON";
                // toggle and then re-fetch the combined site/device/data list
                toggleOutletPower(index + 1, next)
                  .then(() => fetchSitesWithDevices())
                  .then((newSites) => {
                    setSites(newSites);
                    const dev =
                      newSites[selectedSiteIdx].devices[selectedDevIdx];
                    setPduData(dev.data as PDUData);
                  })
                  .catch(console.error);
              }}
            />
            {/* <RuxContainer class="chart-container">
              <div slot="header">Load History</div>
              <LoadHistoryChart
                wattsData={loadHistory}
                ampsData={loadHistoryAmps}
              />
            </RuxContainer> */}
          </>
        )}
      </div>
    </div>
  );
};

export default SiteEndpointLayout;
