import type {
  FeedReading,
  IotHistoryItem,
  IotHistoryResponse,
  IotLatestResponse,
} from '../services/iotService';

/**
 * Mirrors GET /api/v1/iot/latest feed rows (backend field names).
 */
export type IoTStatusLabel = 'normal' | 'warning' | 'critical';

export const IOT_FEED_KEYS = [
  'soil_moisture',
  'forward_speed',
  'pto_shaft_speed',
  'depth_of_operation',
  'gearbox_temperature',
  'vibration',
  'wheel_slip',
  'field_capacity',
  'machine_status',
  'position_tracking',
] as const;

export type IoTFeedKey = (typeof IOT_FEED_KEYS)[number];

export type IoTFeedReading = FeedReading;
export type LatestIoTResponse = IotLatestResponse;
export type IoTHistoryItem = IotHistoryItem;
export type IoTHistoryResponse = IotHistoryResponse;

/** Keyed latest readings for `useIoTDashboard().feedsMap` */
export type IoTFeedsMap = Partial<Record<IoTFeedKey, IoTFeedReading>>;
