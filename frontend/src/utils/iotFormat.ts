import type { IoTFeedReading, IoTStatusLabel } from '../types/iot';
import { colors } from '../constants/colors';

const EM_DASH = '—';

/** Prefer numeric_value; for text feeds (e.g. machine_status) use raw_value. */
export function formatFeedDisplayValue(reading: IoTFeedReading | undefined): string {
  if (!reading) return EM_DASH;
  if (reading.numeric_value != null && !Number.isNaN(reading.numeric_value)) {
    return String(reading.numeric_value);
  }
  if (reading.raw_value != null && reading.raw_value !== '') {
    return reading.raw_value;
  }
  return EM_DASH;
}

/** Present units consistently in the UI (backend still stores canonical unit). */
export function formatUnitForDisplay(unit: string, feedKey: string): string {
  const u = unit.trim();
  if (!u) return '';
  if (feedKey === 'pto_shaft_speed' && u.toLowerCase() === 'rpm') return 'RPM';
  return u;
}

export function statusToColor(status: IoTStatusLabel): string {
  switch (status) {
    case 'normal':
      return '#1E6B3C';
    case 'warning':
      return '#C55A11';
    case 'critical':
      return '#C00000';
    default:
      return colors.muted;
  }
}

export function formatFreshness(iso: string | null | undefined): string {
  if (!iso) return EM_DASH;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return EM_DASH;
  const diffSec = Math.round((Date.now() - t) / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const d = new Date(t);
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function formatGpsCoordinate(n: number | null | undefined, decimals = 6): string {
  if (n == null || Number.isNaN(n)) return EM_DASH;
  return n.toFixed(decimals);
}
