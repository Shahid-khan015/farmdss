import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Layers3, LocateFixed, ArrowLeft } from 'lucide-react-native';
import { WebView } from 'react-native-webview';

import { AlertsPanel } from '../components/iot/AlertsPanel';
import { Card } from '../components/common/Card';
import { colors } from '../constants/colors';
import { useGPSPath, useSessionDetail } from '../hooks/useSession';
import { useIoTDashboard } from '../hooks/useIoTDashboard';
import type { IoTFeedReading, IoTFeedsMap } from '../types/iot';
import { spacing, typography } from '../theme';

type RouteParams = { sessionId?: string };
type GPSPoint = { lat: number; lon: number; timestamp: string };

function formatClock(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function durationLabel(minutes?: number | null, startedAt?: string): string {
  if (minutes != null && Number.isFinite(minutes)) {
    const total = Math.max(0, Math.floor(minutes));
    const h = Math.floor(total / 60);
    const m = total % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }
  if (!startedAt) return '0m';
  const elapsed = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 60000));
  const h = Math.floor(elapsed / 60);
  const m = elapsed % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function readPosition(reading?: IoTFeedReading) {
  if (!reading) {
    return { lat: null as number | null, lon: null as number | null, timestamp: null as string | null };
  }
  if (reading.lat != null && reading.lon != null) {
    return { lat: reading.lat, lon: reading.lon, timestamp: reading.device_timestamp ?? null };
  }
  if (reading.raw_value) {
    try {
      const parsed = JSON.parse(reading.raw_value);
      const lat = Number(parsed?.lat ?? parsed?.latitude);
      const lon = Number(parsed?.lon ?? parsed?.lng ?? parsed?.longitude);
      return {
        lat: Number.isFinite(lat) ? lat : null,
        lon: Number.isFinite(lon) ? lon : null,
        timestamp: reading.device_timestamp ?? null,
      };
    } catch {
      return { lat: null, lon: null, timestamp: reading.device_timestamp ?? null };
    }
  }
  return { lat: null, lon: null, timestamp: reading.device_timestamp ?? null };
}

function sessionAlertsToFeedsMap(alerts: Array<{ feed_key: string; alert_status: string; message: string }>): IoTFeedsMap {
  const keyMap: Record<string, keyof IoTFeedsMap> = {
    'soil-moisture': 'soil_moisture',
    'forward-speed': 'forward_speed',
    'pto-speed': 'pto_shaft_speed',
    'operation-depth': 'depth_of_operation',
    'gearbox-temp': 'gearbox_temperature',
    'vibration-level': 'vibration',
    'wheel-slip': 'wheel_slip',
    'field-capacity': 'field_capacity',
  };

  const out: IoTFeedsMap = {};
  for (const alert of alerts) {
    const mappedKey = keyMap[alert.feed_key];
    if (!mappedKey) continue;
    out[mappedKey] = {
      feed_key: mappedKey,
      raw_value: alert.message,
      numeric_value: null,
      unit: '',
      device_timestamp: null,
      lat: null,
      lon: null,
      status_label: alert.alert_status === 'critical' ? 'critical' : 'warning',
    };
  }
  return out;
}

export function FieldMapScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { sessionId } = (route.params ?? {}) as RouteParams;

  const { points, areaHa, totalPoints } = useGPSPath(sessionId ?? null);
  const { session } = useSessionDetail(sessionId ?? null);
  const dashboard = useIoTDashboard();

  const [tileMode, setTileMode] = useState<'satellite' | 'standard'>('satellite');
  const [recenterTick, setRecenterTick] = useState(0);

  const livePosition = readPosition(dashboard.feedsMap.position_tracking);
  const speed = dashboard.feedsMap.forward_speed?.numeric_value ?? null;

  const mapPoints: GPSPoint[] = useMemo(() => {
    if (!points.length) return [];
    return points
      .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon))
      .map((p) => ({
        lat: Number(p.lat),
        lon: Number(p.lon),
        timestamp: p.timestamp,
      }));
  }, [points]);

  const lastPointTime = mapPoints.length
    ? new Date(mapPoints[mapPoints.length - 1].timestamp).getTime()
    : (livePosition.timestamp ? new Date(livePosition.timestamp).getTime() : NaN);
  const isTracking = Number.isFinite(lastPointTime) && Date.now() - lastPointTime < 2 * 60 * 1000;

  const center = useMemo(() => {
    if (livePosition.lat != null && livePosition.lon != null) {
      return { lat: livePosition.lat, lon: livePosition.lon, zoom: 16 };
    }
    if (mapPoints.length) {
      const last = mapPoints[mapPoints.length - 1];
      return { lat: last.lat, lon: last.lon, zoom: 16 };
    }
    return { lat: 20.59, lon: 78.96, zoom: 5 };
  }, [livePosition.lat, livePosition.lon, mapPoints]);

  const html = useMemo(() => {
    const pathJson = JSON.stringify(mapPoints);
    const centerJson = JSON.stringify(center);
    const currentJson = JSON.stringify({
      lat: livePosition.lat,
      lon: livePosition.lon,
    });
    const label = session?.operation_type ?? 'FIELD-01';
    const safeLabel = JSON.stringify(label);
    const areaLabel = areaHa != null ? `${areaHa.toFixed(2)} ha` : '';
    const safeAreaLabel = JSON.stringify(areaLabel);
    const tileUrl =
      tileMode === 'satellite'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const tileAttribution =
      tileMode === 'satellite'
        ? 'Tiles &copy; Esri'
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
    body { background: #111827; }
    .empty-state {
      position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
      z-index: 9999; pointer-events: none;
    }
    .empty-pill {
      background: rgba(17, 24, 39, 0.86); color: #fff; border-radius: 12px; padding: 14px 16px;
      text-align: center; font-family: sans-serif; font-size: 14px; line-height: 1.4;
      white-space: pre-line;
    }
    .field-label, .area-label {
      background: rgba(17,24,39,0.9); color: #fff; border-radius: 8px;
      border: none; padding: 6px 8px; font-family: sans-serif; font-weight: 700; font-size: 12px;
    }
    .area-label { background: rgba(0,0,0,0.72); font-weight: 600; }
  </style>
</head>
<body>
  <div id="map"></div>
  <div id="empty" class="empty-state" style="display:none;">
    <div class="empty-pill">📍 No GPS Data Yet\nStart a session to begin tracking</div>
  </div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const points = ${pathJson};
    const center = ${centerJson};
    const current = ${currentJson};
    const operationLabel = ${safeLabel};
    const areaLabel = ${safeAreaLabel};

    const map = L.map('map', { zoomControl: true }).setView([center.lat, center.lon], center.zoom);
    L.tileLayer('${tileUrl}', { attribution: '${tileAttribution}', maxZoom: 20 }).addTo(map);

    if (!points.length) {
      document.getElementById('empty').style.display = 'flex';
    }

    if (points.length) {
      const latlngs = points.map((p) => [p.lat, p.lon]);
      const polyline = L.polyline(latlngs, { color: '#00C896', weight: 3, opacity: 0.9 }).addTo(map);

      const start = points[0];
      L.circleMarker([start.lat, start.lon], {
        radius: 6,
        fillColor: '#2196F3',
        color: '#2196F3',
        weight: 1,
        opacity: 1,
        fillOpacity: 1,
      }).addTo(map).bindPopup('Start');

      const centroid = points.reduce((acc, p) => ({ lat: acc.lat + p.lat, lon: acc.lon + p.lon }), { lat: 0, lon: 0 });
      centroid.lat /= points.length;
      centroid.lon /= points.length;

      L.marker([centroid.lat, centroid.lon], {
        icon: L.divIcon({
          className: '',
          html: '<div class="field-label">' + operationLabel + '</div>',
        }),
      }).addTo(map);

      if (areaLabel) {
        L.marker([centroid.lat + 0.00015, centroid.lon], {
          icon: L.divIcon({
            className: '',
            html: '<div class="area-label">' + areaLabel + '</div>',
          }),
        }).addTo(map);
      }

      map.fitBounds(polyline.getBounds(), { padding: [20, 20] });
    }

    if (current.lat != null && current.lon != null) {
      L.circleMarker([current.lat, current.lon], {
        radius: 8,
        fillColor: '#00C896',
        color: 'white',
        weight: 3,
        opacity: 1,
        fillOpacity: 1,
      }).addTo(map).bindPopup('Current Position');
    }
  </script>
</body>
</html>`;
  }, [areaHa, center, livePosition.lat, livePosition.lon, mapPoints, session?.operation_type, tileMode]);

  const sessionFeedsForAlerts = useMemo(() => {
    if (!sessionId) return null;
    return sessionAlertsToFeedsMap(
      (session?.alerts ?? []).map((a) => ({
        feed_key: a.feed_key,
        alert_status: a.alert_status,
        message: a.message,
      })),
    );
  }, [session?.alerts, sessionId]);

  const fallbackActiveAlerts = ((dashboard as any).activeAlerts ?? []) as Array<{
    feed_key: string;
    alert_status: string;
    message: string;
  }>;
  const fallbackFeedsForAlerts = useMemo(
    () => sessionAlertsToFeedsMap(fallbackActiveAlerts),
    [fallbackActiveAlerts],
  );

  const alertsFeeds = sessionId ? (sessionFeedsForAlerts ?? {}) : fallbackFeedsForAlerts;

  return (
    <View style={styles.container}>
      <View style={styles.headerOverlay}>
        <Pressable onPress={() => nav.goBack()} style={styles.iconButton}>
          <ArrowLeft size={20} color="#FFFFFF" />
        </Pressable>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Field Map</Text>
          <Text style={styles.headerSubtitle}>Farm Monitor Pro</Text>
        </View>
        <View style={[styles.trackBadge, { backgroundColor: isTracking ? '#103B2B' : '#5A3E00' }]}>
          <Text style={[styles.trackBadgeDot, { color: isTracking ? '#00E39F' : '#FFC107' }]}>●</Text>
          <Text style={styles.trackBadgeText}>{isTracking ? 'Tracking' : 'Last Known'}</Text>
        </View>
      </View>

      <View style={styles.mapWrap}>
        <WebView
          key={`${tileMode}-${recenterTick}-${center.lat}-${center.lon}`}
          source={{ html }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={['*']}
          mixedContentMode="always"
        />

        <View style={styles.mapControls}>
          <Pressable
            style={styles.controlBtn}
            onPress={() => setTileMode((prev) => (prev === 'satellite' ? 'standard' : 'satellite'))}
          >
            <Layers3 size={18} color="#111827" />
          </Pressable>
          <Pressable style={styles.controlBtn} onPress={() => setRecenterTick((v) => v + 1)}>
            <LocateFixed size={18} color="#111827" />
          </Pressable>
        </View>
      </View>

      <View style={styles.bottomPane}>
        <Card variant="elevated" spacing="comfortable" style={styles.infoCard}>
          <Text style={styles.gpsTitle}>GPS INFO</Text>
          <Text style={styles.gpsRow}>Lat: {livePosition.lat != null ? livePosition.lat.toFixed(6) : '—'}</Text>
          <Text style={styles.gpsRow}>Lon: {livePosition.lon != null ? livePosition.lon.toFixed(6) : '—'}</Text>
          <Text style={styles.gpsRow}>Time: {formatClock(livePosition.timestamp)}</Text>
        </Card>

        <AlertsPanel feeds={alertsFeeds} />
      </View>

      <View style={styles.statsBar}>
        <StatItem label="POINTS" value={String(totalPoints || mapPoints.length)} />
        <StatItem label="AREA" value={`${(areaHa ?? 0).toFixed(2)} ha`} />
        <StatItem label="SPEED" value={`${(speed ?? 0).toFixed(1)} km/h`} />
        <StatItem
          label="TIME"
          value={durationLabel(
            session?.total_duration_minutes,
            session?.started_at,
          )}
        />
      </View>
    </View>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    zIndex: 100,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(17,24,39,0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    ...typography.h5,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: '#E5E7EB',
  },
  trackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 5,
  },
  trackBadgeDot: {
    fontSize: 12,
    lineHeight: 14,
  },
  trackBadgeText: {
    ...typography.labelSmall,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  mapWrap: {
    flex: 1,
    minHeight: 320,
  },
  map: {
    flex: 1,
  },
  mapControls: {
    position: 'absolute',
    top: 86,
    right: 14,
    gap: 10,
  },
  controlBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  bottomPane: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: 88,
  },
  infoCard: {
    width: '100%',
  },
  gpsTitle: {
    ...typography.label,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  gpsRow: {
    ...typography.bodySmall,
    color: colors.text,
    marginTop: 2,
  },
  statsBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.14)',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  statLabel: {
    ...typography.labelSmall,
    color: '#94A3B8',
    fontSize: 10,
  },
  statValue: {
    ...typography.bodySmall,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
});
