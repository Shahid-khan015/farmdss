import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../components/common/ErrorState';
import { SkeletonCard } from '../components/common/Skeleton';
import { StatusPill } from '../components/common/StatusPill';
import { ConvergenceBanner } from '../components/simulation/ConvergenceBanner';
import { GaugeArc } from '../components/simulation/charts/GaugeArc';
import { ResultsDisplay } from '../components/simulation/ResultsDisplay';
import { SectionCard } from '../components/simulation/SectionCard';
import { ThemedButton } from '../components/common/ThemedButton';
import { useSimulation } from '../hooks/useSimulations';
import { useImplements } from '../hooks/useImplements';
import {
  POWER_CLASS_LABEL,
  TILLAGE_STAGE_LABEL,
  powerClassOf,
  tillageStageOf,
} from '../constants/enums';
import { downloadSimulationExport } from '../services/simulationService';
import { toApiError } from '../services/apiError';
import { useTheme } from '../theme/ThemeProvider';
import { useResponsive } from '../hooks/useResponsive';
import { formatNumber, unitOf } from '../theme/units';
import type { Quantity } from '../theme/units';
import {
  PUT_PROPERLY_LOADED,
  confidenceTone,
  loadStatusTone,
  powerUtilizationTone,
  slipTone,
  statusTone,
  warningTone,
} from '../utils/dssBands';
import type { StatusTone } from '../theme/palette';
import {
  COMBINATION_TYPE_META,
  type SimulationCombinationType,
  type SimulationResults,
} from '../types/simulation';
import type { SimulationScreenNavigation, SimulationStackParamList } from '../navigation/types';

type ResultRoute = RouteProp<SimulationStackParamList, 'SimulationResult'>;

const MODE_ICON: Record<SimulationCombinationType, keyof typeof Feather.glyphMap> = {
  single: 'minus',
  passive_passive: 'menu',
  active_passive: 'rotate-cw',
};

/** A lean, un-boxed figure for the hero row — a MetricTile card would double-box
 * inside the hero card, so this reuses the same formatting without the border. */
function HeroStat({
  icon,
  label,
  value,
  quantity,
  tone = 'neutral',
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: unknown;
  quantity: Quantity;
  tone?: StatusTone;
}) {
  const { colors, radius, typography, numeric } = useTheme();
  const statusColors = colors.status[tone];
  const unit = unitOf(quantity);
  return (
    <View style={styles.heroStatRow}>
      <View
        style={[
          styles.heroStatIcon,
          { backgroundColor: statusColors.surface, borderRadius: radius.md },
        ]}
      >
        <Feather name={icon} size={14} color={statusColors.base} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[typography.caption, { color: colors.textTertiary }]}>{label}</Text>
        <Text style={[typography.h4, numeric, { color: colors.textPrimary }]}>
          {formatNumber(value, quantity)}
          {unit ? (
            <Text style={[typography.bodySmall, { color: colors.textTertiary }]}> {unit}</Text>
          ) : null}
        </Text>
      </View>
    </View>
  );
}

export function SimulationResultScreen() {
  const nav = useNavigation<SimulationScreenNavigation>();
  const route = useRoute<ResultRoute>();
  const { colors, spacing, radius, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const { columns } = useResponsive();

  const id = route.params?.id;
  const simQ = useSimulation(id);
  // Names/types for the equipment roles card. Failure here must not block the
  // result itself, so the card simply degrades to IDs-less placeholders.
  // 100 is the API's maximum page size; anything larger is rejected with a 422.
  const implementsQ = useImplements({ limit: 100, offset: 0 });
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = useCallback(
    async (format: 'csv' | 'pdf') => {
      setExporting(format);
      setExportError(null);
      try {
        await downloadSimulationExport(id, format);
      } catch (error) {
        setExportError(toApiError(error).message);
      } finally {
        setExporting(null);
      }
    },
    [id],
  );

  const simulation = simQ.data;

  /**
   * The engine writes its full output into `results`; the top-level columns are a
   * persisted subset. Merging with `results` last keeps the engine's own values
   * authoritative, and nothing is derived here.
   */
  const results = useMemo<SimulationResults | null>(() => {
    if (!simulation) return null;
    const promoted: SimulationResults = {
      draft_force: simulation.draft_force ?? undefined,
      drawbar_power: simulation.drawbar_power ?? undefined,
      slip: simulation.slip ?? undefined,
      traction_efficiency: simulation.traction_efficiency ?? undefined,
      power_utilization: simulation.power_utilization ?? undefined,
      field_capacity_theoretical: simulation.field_capacity_theoretical ?? undefined,
      field_capacity_actual: simulation.field_capacity_actual ?? undefined,
      field_efficiency: simulation.field_efficiency ?? undefined,
      fuel_consumption_per_hectare: simulation.fuel_consumption_per_hectare ?? undefined,
      overall_efficiency: simulation.overall_efficiency ?? undefined,
      ballast_front_required: simulation.ballast_front_required ?? undefined,
      ballast_rear_required: simulation.ballast_rear_required ?? undefined,
      status: simulation.status ?? undefined,
      status_message: simulation.status_message ?? undefined,
      confidence: simulation.confidence ?? undefined,
      warnings: simulation.warnings ?? undefined,
      recommendation_messages: simulation.recommendation_messages ?? undefined,
      combination_type: simulation.combination_type,
    };
    return { ...promoted, ...(simulation.results ?? {}) };
  }, [simulation]);

  if (simQ.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, padding: spacing.lg, gap: spacing.md }}>
        <SkeletonCard lines={3} />
        <SkeletonCard lines={4} />
      </View>
    );
  }

  if (simQ.error) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <ErrorState
          error={toApiError(simQ.error)}
          onRetry={() => simQ.refetch()}
          onSecondary={() => nav.goBack()}
        />
      </View>
    );
  }

  if (!simulation || !results) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <ErrorState
          error={{ kind: 'not_found', status: 404, message: 'This simulation no longer exists.' }}
          onSecondary={() => nav.goBack()}
        />
      </View>
    );
  }

  const mode = (simulation.combination_type ?? 'single') as SimulationCombinationType;
  const modeMeta = COMBINATION_TYPE_META[mode] ?? COMBINATION_TYPE_META.single;
  const tillageClassLabel = mode === 'single' ? 'Conventional tillage' : 'Combi tillage';
  const converged = results.converged ?? null;
  const dimmed = converged === false;

  const implementList = implementsQ.data?.items ?? [];
  const describeImplement = (implementId?: string | null) => {
    if (!implementId) return null;
    const found = implementList.find((i) => i.id === implementId);
    if (!found) return { name: 'Implement no longer available', detail: null as string | null };
    const stage = tillageStageOf(found.implement_type);
    const detail = [
      found.implement_type,
      found.configuration ?? null,
      stage ? TILLAGE_STAGE_LABEL[stage] : null,
      POWER_CLASS_LABEL[powerClassOf(found.implement_type)],
    ]
      .filter(Boolean)
      .join(' · ');
    return { name: found.name, detail };
  };

  // implement_2_id is tool 2 for passive-passive, but the rotor for active-passive.
  const equipmentRoles = (
    [
      {
        slot:
          mode === 'passive_passive'
            ? 'Tool 1 (front)'
            : mode === 'active_passive'
              ? 'Passive tool'
              : 'Implement',
        info: describeImplement(simulation.implement_id),
      },
      mode === 'passive_passive'
        ? { slot: 'Tool 2 (trailing)', info: describeImplement(simulation.implement_2_id) }
        : null,
      mode === 'active_passive' && simulation.implement_2_id
        ? { slot: 'Powered rotor', info: describeImplement(simulation.implement_2_id) }
        : null,
    ].filter(Boolean) as Array<{ slot: string; info: { name: string; detail: string | null } | null }>
  )
    .filter((entry) => entry.info !== null)
    .map((entry) => ({ slot: entry.slot, name: entry.info!.name, detail: entry.info!.detail }));
  const slip = results.slip ?? null;
  const powerUtilization = results.power_utilization ?? null;
  // Display-only cap: >100% is a real DSS result ("Overloaded" in the Put status
  // table), so the true value keeps driving `powerUtilizationTone` below and every
  // other overload/status computation is untouched. Only the number and gauge
  // needle shown to the user are capped at 100%.
  const displayedPowerUtilization = powerUtilization !== null ? Math.min(powerUtilization, 100) : null;
  const warnings = results.warnings ?? [];
  const recommendations = results.recommendation_messages ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        style={{ backgroundColor: colors.bg }}
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: spacing.xxxl + 72,
          gap: spacing.lg,
        }}
      >
        {/* Hero */}
        <View
          style={[
            styles.hero,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.lg,
              padding: spacing.lg,
              gap: spacing.lg,
            },
          ]}
        >
          <View style={styles.heroTopRow}>
            <View
              style={[
                styles.modeIcon,
                { backgroundColor: colors.primarySurface, borderRadius: radius.full },
              ]}
            >
              <Feather name={MODE_ICON[mode]} size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[typography.caption, { color: colors.textTertiary }]}>
                {tillageClassLabel} · {modeMeta.label}
              </Text>
              <Text
                accessibilityRole="header"
                numberOfLines={2}
                style={[typography.h2, { color: colors.textPrimary }]}
              >
                {simulation.name?.trim() || 'Simulation result'}
              </Text>
              <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>
                {new Date(simulation.created_at).toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={styles.pillRow}>
            {results.status ? (
              <StatusPill caption="Status" label={String(results.status)} tone={statusTone(results.status)} />
            ) : null}
            {results.confidence ? (
              <StatusPill
                caption="Confidence"
                label={String(results.confidence)}
                tone={confidenceTone(results.confidence)}
              />
            ) : null}
            {results.load_status ? (
              <StatusPill
                caption="Load"
                label={String(results.load_status)}
                tone={loadStatusTone(results.load_status)}
              />
            ) : null}
          </View>

          <ConvergenceBanner converged={converged} slipPercent={slip} />

          <View
            style={[
              styles.heroMetrics,
              { flexDirection: columns > 1 ? 'row' : 'column', opacity: dimmed ? 0.72 : 1 },
            ]}
          >
            <View style={styles.gaugeWrap}>
              <GaugeArc
                value={displayedPowerUtilization}
                min={0}
                max={130}
                size={168}
                tone={powerUtilizationTone(powerUtilization)}
                valueLabel={`${formatNumber(displayedPowerUtilization, 'percent')}%`}
                caption="Power utilisation"
                bands={[
                  { from: 0, to: PUT_PROPERLY_LOADED.min, tone: 'caution' },
                  { from: PUT_PROPERLY_LOADED.min, to: PUT_PROPERLY_LOADED.max, tone: 'ok' },
                  { from: PUT_PROPERLY_LOADED.max, to: 130, tone: 'critical' },
                ]}
                accessibilityLabel={`Power utilisation ${formatNumber(displayedPowerUtilization, 'percent')} percent`}
              />
            </View>
            <View style={styles.heroStatsCol}>
              <HeroStat icon="arrow-down" label="Draft force" value={results.draft_force} quantity="draft" />
              <HeroStat
                icon="rotate-cw"
                label="Wheel slip"
                value={results.slip}
                quantity="percent"
                tone={slipTone(slip)}
              />
              <HeroStat
                icon="droplet"
                label="Fuel per hectare"
                value={results.fuel_consumption_per_hectare}
                quantity="fuelPerArea"
              />
            </View>
          </View>
        </View>

        {/* Equipment roles — which implement filled which slot, with its taxonomy. */}
        {equipmentRoles.length > 0 ? (
          <SectionCard title="Equipment" icon="tool">
            {equipmentRoles.map((role, index) => (
              <View
                key={role.slot}
                style={[
                  styles.equipmentRow,
                  index > 0 ? { borderTopColor: colors.border, borderTopWidth: 1, paddingTop: spacing.sm } : null,
                ]}
              >
                <View
                  style={[
                    styles.equipmentIcon,
                    { backgroundColor: colors.surfaceSunken, borderRadius: radius.md },
                  ]}
                >
                  <Feather name="tool" size={16} color={colors.textSecondary} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[typography.caption, { color: colors.textTertiary }]}>{role.slot}</Text>
                  <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                    {role.name}
                  </Text>
                  {role.detail ? (
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      {role.detail}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))}
          </SectionCard>
        ) : null}

        {/* Engine warnings, verbatim */}
        {warnings.length > 0 ? (
          <SectionCard title="Engine notes" icon="alert-circle">
            {warnings.map((warning, index) => {
              const tone = colors.status[warningTone(warning)];
              return (
                <View
                  key={index}
                  accessible
                  accessibilityLabel={warning}
                  style={[
                    styles.warning,
                    {
                      backgroundColor: tone.surface,
                      borderColor: tone.border,
                      borderRadius: radius.md,
                      padding: spacing.md,
                      gap: spacing.sm,
                    },
                  ]}
                >
                  <Feather name="alert-circle" size={16} color={tone.base} />
                  <Text style={[typography.body, { color: tone.text, flex: 1 }]}>{warning}</Text>
                </View>
              );
            })}
          </SectionCard>
        ) : null}

        {/* Recommendations from the backend */}
        {recommendations.length > 0 ? (
          <SectionCard title="Suggested adjustments" icon="list">
            {recommendations.map((item, index) => (
              <View key={index} style={styles.bulletRow}>
                <Feather name="arrow-right" size={14} color={colors.primary} />
                <Text style={[typography.body, { color: colors.textSecondary, flex: 1 }]}>{item}</Text>
              </View>
            ))}
          </SectionCard>
        ) : null}

        {/* Detailed results deliberately sits outside a SectionCard: ResultsDisplay
            renders its own cards per section, and nesting those inside another
            bordered card double-boxed every figure and squeezed the metric tiles. */}
        <View style={{ gap: spacing.md }}>
          <View style={styles.sectionHeading}>
            <Feather name="grid" size={16} color={colors.textSecondary} />
            <Text accessibilityRole="header" style={[typography.h5, { color: colors.textPrimary }]}>
              Detailed results
            </Text>
          </View>
          <ResultsDisplay results={results} />
        </View>

        {/* Export lives here, after the results it exports, with real labels —
            the previous icon-only buttons sat in the title row where `file-text`
            vs `file` was indistinguishable and the tap targets were 36 px. */}
        <SectionCard title="Export" icon="download">
          <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
            Download this simulation's inputs and results.
          </Text>
          {exportError ? (
            <Text
              accessibilityLiveRegion="polite"
              style={[typography.bodySmall, { color: colors.status.critical.text }]}
            >
              {exportError}
            </Text>
          ) : null}
          <View style={{ flexDirection: columns > 1 ? 'row' : 'column', gap: spacing.sm }}>
            <ThemedButton
              variant="outline"
              onPress={() => handleExport('csv')}
              loading={exporting === 'csv'}
              disabled={exporting !== null}
              style={{ flex: columns > 1 ? 1 : undefined }}
              fullWidth
            >
              Export CSV
            </ThemedButton>
            <ThemedButton
              variant="outline"
              onPress={() => handleExport('pdf')}
              loading={exporting === 'pdf'}
              disabled={exporting !== null}
              style={{ flex: columns > 1 ? 1 : undefined }}
              fullWidth
            >
              Export PDF
            </ThemedButton>
          </View>
        </SectionCard>
      </ScrollView>

      {/* Sticky actions — always reachable regardless of scroll position. */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            paddingTop: spacing.md,
            paddingHorizontal: spacing.lg,
            paddingBottom: Math.max(insets.bottom, spacing.md),
          },
        ]}
      >
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <ThemedButton
            variant="outline"
            onPress={() => nav.navigate('SimulationSetup', { prefillFromSimulationId: simulation.id })}
            style={{ flex: 1 }}
            fullWidth
          >
            Re-run with changes
          </ThemedButton>
          <ThemedButton
            variant="primary"
            onPress={() => nav.navigate('SimulationSetup', {})}
            style={{ flex: 1 }}
            fullWidth
          >
            New simulation
          </ThemedButton>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderWidth: 1,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  modeIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  heroMetrics: {
    alignItems: 'center',
    gap: 20,
  },
  gaugeWrap: {
    alignItems: 'center',
  },
  heroStatsCol: {
    flex: 1,
    alignSelf: 'stretch',
    gap: 14,
    justifyContent: 'center',
  },
  heroStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroStatIcon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  equipmentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  equipmentIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
  },
});
