const formatValue = (
  value: number | null | undefined,
  units: string[],
  divisor: number
): string => {
  if (value === null || value === undefined || value === 0) return "N/A";

  let unitIndex = 0;
  while (value >= divisor && unitIndex < units.length - 1) {
    value /= divisor;
    unitIndex++;
  }

  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unitIndex]}`;
};

export function formatBandwidth(bps: number | null | undefined): string {
  return formatValue(bps, ["bps", "Kbps", "Mbps", "Gbps", "Tbps"], 1000);
}
export function formatSpeed(speed: number | null | undefined): string {
  return formatValue(speed, ["Hz", "Khz", "Mhz", "Ghz", "Thz"], 1000);
}
export function formatTemperature(celsius: number | null | undefined): string {
  if (celsius === null || celsius === undefined) return "N/A";
  return `${celsius.toFixed(1)} °C`;
}
export function formatUtilization(percent: number | null | undefined): string {
  if (percent === null || percent === undefined) return "N/A";
  return `${(percent * 100).toFixed(2)}%`;
}
export function formatBytes(bytes: number | null | undefined): string {
  return formatValue(bytes, ["B", "KB", "MB", "GB", "TB"], 1024);
}
export const formatDateTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};
