import { Context } from "hono";
import { parseRequestBody } from "../../utils/parseRequestBody";

const serviceName = "csi_tripplite_pdumh20";
const externalApiBaseUrl =
  "http://127.0.0.1:8090/service/csi_tripplite_pdumh20_0";

export const postToggleOutlet = async (c: Context) => {
  try {
    const body = await parseRequestBody(c);
    console.log("Parsed body:", body);
    const response = await fetch(`${externalApiBaseUrl}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key-CSI-Maestro-SystemOperator": "SystemOperator-1",
        "X-API-Key-CSI-Maestro-Hub": "Hub-1",
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return c.json(data, { status: response.status });
  } catch (err) {
    console.error("Failed to parse JSON body:", err);
    return c.json(
      { error: err.message || "Invalid JSON body" },
      { status: 400 }
    );
  }
};

export const getTrippLiteData = async (c) => {
  const response = await fetch(`${externalApiBaseUrl}`, {
    headers: {
      "X-API-Key-CSI-Maestro-SystemOperator": "SystemOperator-1",
      "X-API-Key-CSI-Maestro-Hub": "Hub-1",
    },
  });
  const data = await response.json();
  return c.json(data);
};
