export function formatBandwidth(bps: number | null | undefined): string {
  if (bps === null || bps === undefined || bps === 0) return "N/A";

  const units = ["bps", "Kbps", "Mbps", "Gbps", "Tbps"];
  let value = bps;
  let unitIndex = 0;

  while (value >= 1000 && unitIndex < units.length - 1) {
    value /= 1000;
    unitIndex++;
  }

  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unitIndex]}`;
}
export function formatSpeed(speed: number | null | undefined): string {
  if (speed === null || speed === undefined || speed === 0) return "N/A";

  const units = ["Hz", "Khz", "Mhz", "Ghz", "Thz"];
  let value = speed;
  let unitIndex = 0;

  while (value >= 1000 && unitIndex < units.length - 1) {
    value /= 1000;
    unitIndex++;
  }

  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unitIndex]}`;
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
  if (bytes === null || bytes === undefined) return "N/A";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unitIndex]}`;
}
