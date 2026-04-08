import type { IoTFeedKey } from '../types/iot';

/** UI copy only — data still keyed by backend `feed_key`. */
export const IOT_FEED_UI: Record<
  IoTFeedKey,
  { label: string; subtitle?: string; icon: string }
> = {
  soil_moisture: { label: 'Soil Moisture', icon: 'droplet' },
  forward_speed: { label: 'Speed', icon: 'activity' },
  pto_shaft_speed: { label: 'PTO Speed', icon: 'rotate-cw' },
  depth_of_operation: {
    label: 'Depth',
    subtitle: 'Depth of Operation',
    icon: 'arrow-down-circle',
  },
  gearbox_temperature: { label: 'Gearbox Temp', icon: 'thermometer' },
  vibration: { label: 'Vibration', icon: 'zap' },
  wheel_slip: { label: 'Wheel Slip', icon: 'percent' },
  field_capacity: {
    label: 'Field Capacity',
    subtitle: 'Effective Field Capacity',
    icon: 'grid',
  },
  machine_status: { label: 'Machine Status', icon: 'power' },
  position_tracking: { label: 'Location', icon: 'map-pin' },
};

/** Grid order (excludes GPS — use GPSInfoPanel / Map). */
export const IOT_METRIC_DISPLAY_ORDER: IoTFeedKey[] = [
  'forward_speed',
  'pto_shaft_speed',
  'depth_of_operation',
  'soil_moisture',
  'field_capacity',
  'wheel_slip',
];
