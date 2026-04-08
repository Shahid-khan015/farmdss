import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

import { colors } from '../constants/colors';
import { spacing, typography, borderRadius } from '../theme';
import { Input } from '../components/common/Input';
import { Picker } from '../components/common/Picker';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { CollapsibleSection } from '../components/common/CollapsibleSection';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { useTractors } from '../hooks/useTractors';
import { useImplements } from '../hooks/useImplements';
import { useRunSimulation } from '../hooks/useSimulations';
import { operatingConditionService } from '../services/operatingConditionService';
import type { SoilTexture, SoilHardness } from '../constants/enums';
import { useAutoFillPreset } from '../hooks/useAutoFillPreset';
import { getRecommendedConeIndexOptions } from '../utils/soilParameters';

type Mode = 'preset' | 'custom';

function validateRequiredNumber(
  value: string,
  label: string,
  opts?: { integer?: boolean; min?: number },
) {
  const trimmed = value.trim();
  if (!trimmed) return `${label} is required`;
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return `${label} must be a valid number`;
  if (opts?.integer && !Number.isInteger(n)) return `${label} must be a whole number`;
  if (opts?.min != null && n < opts.min) return `${label} must be >= ${opts.min}`;
  return null;
}

export function SimulationSetupScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const initialTractorId = route.params?.tractorId as string | undefined;
  const initialImplementId = route.params?.implementId as string | undefined;

  const tractorsQ = useTractors({ limit: 100, offset: 0 });
  const implementsQ = useImplements({ limit: 100, offset: 0 });
  const run = useRunSimulation();

  const [mode, setMode] = useState<Mode>('preset');
  const [tractorId, setTractorId] = useState(initialTractorId ?? '');
  const [implementId, setImplementId] = useState(initialImplementId ?? '');

  const [presetId, setPresetId] = useState('');
  const [presets, setPresets] = useState<any[] | null>(null);
  const [presetErr, setPresetErr] = useState<string | null>(null);

  // Custom inputs
  const [soilTexture, setSoilTexture] = useState<SoilTexture>('Medium');
  const [soilHardness, setSoilHardness] = useState<SoilHardness>('Firm');

  const autoFill = useAutoFillPreset({
    soilTexture,
    soilHardness,
  });

  const coneIndexOptions = useMemo(
    () => getRecommendedConeIndexOptions(soilTexture),
    [soilTexture]
  );

  const [turns, setTurns] = useState('10');
  const [isEditingConeIndex, setIsEditingConeIndex] = useState(false);

  const customErrors = useMemo(() => {
    if (mode !== 'custom') return {};
    return {
      coneIndex: validateRequiredNumber(autoFill.values.coneIndex, 'Cone Index', { min: 0 }),
      depth: validateRequiredNumber(autoFill.values.depth, 'Depth', { min: 0 }),
      speed: validateRequiredNumber(autoFill.values.speed, 'Speed', { min: 0 }),
      fieldLength: validateRequiredNumber(autoFill.values.fieldLength, 'Field Length', { min: 0 }),
      fieldWidth: validateRequiredNumber(autoFill.values.fieldWidth, 'Field Width', { min: 0 }),
      fieldArea: validateRequiredNumber(autoFill.values.fieldArea, 'Field Area', { min: 0 }),
      turns: validateRequiredNumber(turns, 'Number of Turns', { integer: true, min: 0 }),
    };
  }, [mode, autoFill.values, turns]);

  const canRun = useMemo(() => {
    if (!tractorId || !implementId) return false;
    if (mode === 'preset') return !!presetId;
    return Object.values(customErrors).every((value) => !value);
  }, [
    tractorId,
    implementId,
    mode,
    presetId,
    customErrors,
  ]);

  const loadPresets = async () => {
    try {
      setPresetErr(null);
      const res = await operatingConditionService.list({ limit: 100, offset: 0 });
      setPresets(res.items);
      if (!presetId && res.items?.[0]?.id) setPresetId(res.items[0].id);
    } catch (e: any) {
      setPresetErr(e.message ?? 'Failed to load presets');
    }
  };

  React.useEffect(() => {
    loadPresets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (tractorsQ.isLoading || implementsQ.isLoading) return <LoadingSpinner />;
  if (tractorsQ.error) return <ErrorMessage message={(tractorsQ.error as Error).message} />;
  if (implementsQ.error) return <ErrorMessage message={(implementsQ.error as Error).message} />;

  const tractors = tractorsQ.data?.items ?? [];
  const implementOptions = implementsQ.data?.items ?? [];
  const selectedTractor = tractors.find((t) => t.id === tractorId);
  const selectedImplement = implementOptions.find((i) => i.id === implementId);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerIconWrap}>
          <Feather name="sliders" size={20} color={colors.primary} />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Simulation Setup</Text>
          <Text style={styles.headerSubtitle}>
            Select equipment and operating conditions before running the model.
          </Text>
        </View>
      </View>

      <Card variant="filled" style={styles.heroCard}>
        <View style={styles.heroRow}>
          <View style={styles.heroItem}>
            <Text style={styles.heroLabel}>Tractor</Text>
            <Text style={styles.heroValue}>{selectedTractor?.name ?? 'Not selected'}</Text>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroItem}>
            <Text style={styles.heroLabel}>Implement</Text>
            <Text style={styles.heroValue}>{selectedImplement?.name ?? 'Not selected'}</Text>
          </View>
        </View>
        <View style={styles.heroModeBadge}>
          <Text style={styles.heroModeBadgeText}>
            {mode === 'preset' ? 'Preset Conditions' : 'Custom Conditions'}
          </Text>
        </View>
      </Card>

      {/* Selection Summary */}
      {selectedTractor && selectedImplement && (
        <Card variant="elevated" style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Feather name="truck" size={16} color={colors.primary} />
              <View style={styles.summaryText}>
                <Text style={styles.summaryLabel}>Tractor</Text>
                <Text style={styles.summaryValue}>{selectedTractor.name}</Text>
              </View>
            </View>
            <View style={styles.summaryItem}>
              <Feather name="tool" size={16} color={colors.primary} />
              <View style={styles.summaryText}>
                <Text style={styles.summaryLabel}>Implement</Text>
                <Text style={styles.summaryValue}>{selectedImplement.name}</Text>
              </View>
            </View>
          </View>
        </Card>
      )}

      {/* Selection Sections */}
      <CollapsibleSection title="Select Tractor" icon="truck" defaultExpanded>
        <View style={styles.selectionContainer}>
          {tractors.length === 0 ? (
            <Text style={styles.emptyText}>No tractors available</Text>
          ) : (
            tractors.map((t) => (
              <Pressable
                key={t.id}
                onPress={() => setTractorId(t.id)}
                style={[
                  styles.selectionItem,
                  tractorId === t.id && styles.selectionItemActive,
                ]}
              >
                <View style={styles.selectionCheckbox}>
                  {tractorId === t.id && (
                    <Feather name="check" size={16} color={colors.primary} />
                  )}
                </View>
                <View style={styles.selectionItemContent}>
                  <Text style={styles.selectionItemTitle}>{t.name}</Text>
                  <Text style={styles.selectionItemSubtitle}>
                    {t.manufacturer} - {t.model}
                  </Text>
                </View>
              </Pressable>
            ))
          )}
          {!tractorId && (
            <Text style={styles.errorText}>Tractor is required</Text>
          )}
        </View>
      </CollapsibleSection>

      <CollapsibleSection title="Select Implement" icon="tool" defaultExpanded={!!tractorId}>
        <View style={styles.selectionContainer}>
          {implementOptions.length === 0 ? (
            <Text style={styles.emptyText}>No implements available</Text>
          ) : (
            implementOptions.map((i) => (
              <Pressable
                key={i.id}
                onPress={() => setImplementId(i.id)}
                style={[
                  styles.selectionItem,
                  implementId === i.id && styles.selectionItemActive,
                ]}
              >
                <View style={styles.selectionCheckbox}>
                  {implementId === i.id && (
                    <Feather name="check" size={16} color={colors.primary} />
                  )}
                </View>
                <View style={styles.selectionItemContent}>
                  <Text style={styles.selectionItemTitle}>{i.name}</Text>
                  <Text style={styles.selectionItemSubtitle}>
                    {i.implement_type}
                    {i.manufacturer ? ` - ${i.manufacturer}` : ''}
                  </Text>
                </View>
              </Pressable>
            ))
          )}
          {!implementId && (
            <Text style={styles.errorText}>Implement is required</Text>
          )}
        </View>
      </CollapsibleSection>

      {/* Operating Conditions */}
      <CollapsibleSection
        title="Operating Conditions"
        icon="settings"
        defaultExpanded={!!tractorId && !!implementId}
      >
        <View style={styles.conditionIntro}>
          <Text style={styles.conditionIntroTitle}>Choose how you want to define field conditions</Text>
          <Text style={styles.conditionIntroText}>
            Use a saved preset for speed, or switch to custom mode to tune the inputs yourself.
          </Text>
        </View>
        <Text style={styles.modeLabel}>Condition Mode</Text>
        <View style={styles.modeContainer}>
          {([
            { key: 'preset', title: 'Preset', description: 'Use a saved condition template' },
            { key: 'custom', title: 'Custom', description: 'Tune soil and field inputs directly' },
          ] as const).map((m) => (
            <Pressable
              key={m.key}
              onPress={() => setMode(m.key)}
              style={[
                styles.modeButton,
                mode === m.key && styles.modeButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  mode === m.key && styles.modeButtonTextActive,
                ]}
              >
                {m.title}
              </Text>
              <Text
                style={[
                  styles.modeButtonHint,
                  mode === m.key && styles.modeButtonHintActive,
                ]}
              >
                {m.description}
              </Text>
            </Pressable>
          ))}
        </View>

        {mode === 'preset' ? (
          <View style={styles.presetContainer}>
            <View style={styles.infoStrip}>
              <Feather name="bookmark" size={14} color={colors.primary} />
              <Text style={styles.infoStripText}>
                Presets load saved operating-condition templates from your backend.
              </Text>
            </View>
            {presetErr && <ErrorMessage message={presetErr} />}
            {!presets ? (
              <Text style={styles.loadingText}>Loading presets...</Text>
            ) : presets.length === 0 ? (
              <Text style={styles.emptyText}>No presets available</Text>
            ) : (
              presets.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => setPresetId(p.id)}
                  style={[
                    styles.selectionItem,
                    presetId === p.id && styles.selectionItemActive,
                  ]}
                >
                  <View style={styles.selectionCheckbox}>
                    {presetId === p.id && (
                      <Feather name="check" size={16} color={colors.primary} />
                    )}
                  </View>
                  <View style={styles.selectionItemContent}>
                    <Text style={styles.selectionItemTitle}>{p.name}</Text>
                    <Text style={styles.selectionItemSubtitle}>
                      {p.soil_texture} / {p.soil_hardness}
                    </Text>
                  </View>
                </Pressable>
              ))
            )}
            {presetId ? (
              <View style={styles.selectedPresetBanner}>
                <Feather name="check-circle" size={14} color={colors.primary} />
                <Text style={styles.selectedPresetText}>Preset selected and ready to run.</Text>
              </View>
            ) : null}
            <Button
              variant="outline"
              size="md"
              fullWidth
              onPress={loadPresets}
              style={styles.refreshButton}
            >
              Refresh Presets
            </Button>
          </View>

        ) : (

          <View style={styles.customInputsContainer}>
            <View style={styles.customOverviewCard}>
              <View style={styles.customOverviewHeader}>
                <Text style={styles.customOverviewTitle}>Adaptive suggestions</Text>
                <View style={styles.customOverviewBadge}>
                  <Text style={styles.customOverviewBadgeText}>
                    {autoFill.meta.hasAppliedFromSoil ? 'Auto-fill active' : 'Manual setup'}
                  </Text>
                </View>
              </View>
              <Text style={styles.customOverviewText}>
                Soil texture and hardness influence the recommended cone index, depth, and speed.
              </Text>
            </View>

            <View style={styles.selectorGrid}>
              <View style={styles.selectorPanel}>
                <Text style={styles.sectionTitle}>Soil Texture</Text>
                <View style={styles.radioGroup}>
                  {(['Fine', 'Medium', 'Coarse'] as SoilTexture[]).map((texture) => (
                    <Pressable
                      key={texture}
                      onPress={() => {
                        setSoilTexture(texture);
                        autoFill.handlers.onConeIndexChange('');
                      }}
                      style={[
                        styles.radioOption,
                        soilTexture === texture && styles.radioOptionActive,
                      ]}
                    >
                      <View style={styles.radioCircle}>
                        {soilTexture === texture && <View style={styles.radioCircleFilled} />}
                      </View>
                      <Text
                        style={[
                          styles.radioLabel,
                          soilTexture === texture && styles.radioLabelActive,
                        ]}
                      >
                        {texture}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.selectorPanel}>
                <Text style={styles.sectionTitle}>Soil Hardness</Text>
                <View style={styles.radioGroup}>
                  {(['Hard', 'Firm', 'Tilled', 'Soft'] as SoilHardness[]).map((hardness) => (
                    <Pressable
                      key={hardness}
                      onPress={() => setSoilHardness(hardness)}
                      style={[
                        styles.radioOption,
                        soilHardness === hardness && styles.radioOptionActive,
                      ]}
                    >
                      <View style={styles.radioCircle}>
                        {soilHardness === hardness && <View style={styles.radioCircleFilled} />}
                      </View>
                      <Text
                        style={[
                          styles.radioLabel,
                          soilHardness === hardness && styles.radioLabelActive,
                        ]}
                      >
                        {hardness}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            {autoFill.meta.hasAppliedFromSoil && (
              <View style={styles.autoBanner}>
                <Text style={styles.autoBannerText}>
                  Parameters auto-filled based on soil conditions
                </Text>
                <Pressable onPress={autoFill.handlers.resetToDefaults}>
                  <Text style={styles.autoBannerResetText}>Reset to defaults</Text>
                </Pressable>
              </View>
            )}

            <View style={styles.customSectionCard}>
              <Text style={styles.customSectionTitle}>Draft Inputs</Text>
              <Text style={styles.customSectionSubtitle}>
                Set the soil resistance and work-rate parameters that feed the simulation.
              </Text>

              <View style={styles.coneCard}>
                <View style={styles.coneCardHeader}>
                  <View style={styles.coneCardTitleRow}>
                    <Feather name="activity" size={14} color={colors.primary} />
                    <Text style={styles.coneCardTitle}>Cone Index</Text>
                  </View>
                  <Pressable
                    onPress={() => setIsEditingConeIndex(!isEditingConeIndex)}
                    style={[
                      styles.coneEditToggle,
                      isEditingConeIndex && styles.coneEditToggleActive,
                    ]}
                  >
                    <Feather
                      name={isEditingConeIndex ? 'list' : 'edit-2'}
                      size={11}
                      color={isEditingConeIndex ? '#ffffff' : colors.primary}
                    />
                    <Text
                      style={[
                        styles.coneEditToggleText,
                        isEditingConeIndex && styles.coneEditToggleTextActive,
                      ]}
                    >
                      {isEditingConeIndex ? 'Pick from list' : 'Edit'}
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.coneValueRow}>
                  <Text
                    style={[
                      styles.coneValueDisplay,
                      !autoFill.values.coneIndex && styles.coneValuePlaceholder,
                    ]}
                    numberOfLines={1}
                  >
                    {autoFill.values.coneIndex || '-'}
                  </Text>
                  <View style={styles.coneUnitBadge}>
                    <Text style={styles.coneUnitText}>kPa</Text>
                  </View>
                  {autoFill.meta.autoFlags.coneIndex && (
                    <View style={styles.coneAutoBadge}>
                      <Text style={styles.coneAutoBadgeText}>AUTO</Text>
                    </View>
                  )}
                </View>

                <View style={styles.coneDivider} />

                {isEditingConeIndex ? (
                  <View style={styles.coneEditInputRow}>
                    <Input
                      placeholder="Enter custom kPa value"
                      value={autoFill.values.coneIndex}
                      onChangeText={autoFill.handlers.onConeIndexChange}
                      keyboardType="decimal-pad"
                      error={!!customErrors.coneIndex}
                      helperText={customErrors.coneIndex ?? undefined}
                      containerStyle={styles.coneEditInputContainer}
                      style={styles.coneEditInput}
                    />
                  </View>
                ) : (
                  <View style={styles.coneDropdownRow}>
                    <Picker
                      placeholder="Select a recommended value"
                      value={autoFill.values.coneIndex}
                      onValueChange={(val) => {
                        autoFill.handlers.onConeIndexChange(String(val));
                      }}
                      items={coneIndexOptions}
                      containerStyle={styles.conePickerContainer}
                      style={styles.conePickerStyle}
                    />
                  </View>
                )}
              </View>

              <Input
                label="Depth"
                placeholder="cm"
                value={autoFill.values.depth}
                onChangeText={autoFill.handlers.onDepthChange}
                keyboardType="decimal-pad"
                rightIcon={
                  <View style={styles.rightIconStack}>
                    <Text style={styles.unit}>cm</Text>
                    {autoFill.meta.autoFlags.depth && (
                      <View style={styles.autoBadge}>
                        <Text style={styles.autoBadgeText}>AUTO</Text>
                      </View>
                    )}
                  </View>
                }
                error={!!customErrors.depth}
                helperText={customErrors.depth ?? undefined}
                containerStyle={styles.inputField}
                style={
                  autoFill.meta.autoFlags.depth
                    ? styles.autoInput
                    : undefined
                }
              />
              <Input
                label="Speed"
                placeholder="km/h"
                value={autoFill.values.speed}
                onChangeText={autoFill.handlers.onSpeedChange}
                keyboardType="decimal-pad"
                rightIcon={
                  <View style={styles.rightIconStack}>
                    <Text style={styles.unit}>km/h</Text>
                    {autoFill.meta.autoFlags.speed && (
                      <View style={styles.autoBadge}>
                        <Text style={styles.autoBadgeText}>AUTO</Text>
                      </View>
                    )}
                  </View>
                }
                error={!!customErrors.speed}
                helperText={customErrors.speed ?? undefined}
                containerStyle={styles.inputField}
                style={
                  autoFill.meta.autoFlags.speed
                    ? styles.autoInput
                    : undefined
                }
              />
            </View>

            <View style={styles.customSectionCard}>
              <Text style={styles.customSectionTitle}>Field Geometry</Text>
              <Text style={styles.customSectionSubtitle}>
                Field area is calculated automatically from length and width.
              </Text>

              <Input
                label="Field Length"
                placeholder="m"
                value={autoFill.values.fieldLength}
                onChangeText={autoFill.handlers.onFieldLengthChange}
                keyboardType="decimal-pad"
                rightIcon={<Text style={styles.unit}>m</Text>}
                error={!!customErrors.fieldLength}
                helperText={customErrors.fieldLength ?? undefined}
                containerStyle={styles.inputField}
              />
              <Input
                label="Field Width"
                placeholder="m"
                value={autoFill.values.fieldWidth}
                onChangeText={autoFill.handlers.onFieldWidthChange}
                keyboardType="decimal-pad"
                rightIcon={<Text style={styles.unit}>m</Text>}
                error={!!customErrors.fieldWidth}
                helperText={customErrors.fieldWidth ?? undefined}
                containerStyle={styles.inputField}
              />
              <Input
                label="Field Area"
                placeholder="ha"
                value={autoFill.values.fieldArea}
                editable={false}
                keyboardType="decimal-pad"
                rightIcon={
                  <View style={styles.rightIconStack}>
                    <Text style={styles.unit}>ha</Text>
                    <View style={styles.calculatedBadge}>
                      <Text style={styles.calculatedBadgeText}>CALC</Text>
                    </View>
                  </View>
                }
                containerStyle={styles.inputField}
                error={!!customErrors.fieldArea}
                style={styles.readonlyInput}
                helperText={
                  customErrors.fieldArea ??
                  autoFill.meta.fieldAreaFormula ??
                  'Area (ha) = (Length x Width) / 10,000'
                }
              />
              <Input
                label="Number of Turns"
                placeholder="count"
                value={turns}
                onChangeText={setTurns}
                keyboardType="number-pad"
                error={!!customErrors.turns}
                helperText={customErrors.turns ?? undefined}
                containerStyle={styles.inputField}
              />
            </View>


          </View>
        )}
      </CollapsibleSection>

      {/* Error Message */}
      {run.error && (
        <Card variant="outlined" style={styles.errorCard}>
          <ErrorMessage message={(run.error as Error).message} />
        </Card>
      )}

      {/* Action Buttons */}
      <View style={styles.footer}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canRun || run.isPending}
          loading={run.isPending}
          onPress={async () => {
            const payload: any = {
              tractor_id: tractorId,
              implement_id: implementId,
            };
            if (mode === 'preset') {
              payload.operating_conditions_preset_id = presetId;
            } else {
              payload.cone_index = Number(autoFill.values.coneIndex);
              payload.depth = Number(autoFill.values.depth);
              payload.speed = Number(autoFill.values.speed);
              payload.field_area = Number(autoFill.values.fieldArea);
              payload.field_length = Number(autoFill.values.fieldLength);
              payload.field_width = Number(autoFill.values.fieldWidth);
              payload.number_of_turns = Number(turns);
              payload.soil_texture = soilTexture;
              payload.soil_hardness = soilHardness;
            }

            const sim = await run.mutateAsync(payload);
            nav.navigate('SimulationResult', { id: sim.id });
          }}
        >
          Run Simulation
        </Button>
        <Button
          variant="outline"
          size="lg"
          fullWidth
          disabled={run.isPending}
          onPress={() => nav.goBack()}
        >
          Cancel
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxl,
    gap: spacing.md,
  },
  headerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${colors.primary}12`,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  heroCard: {
    marginBottom: spacing.lg,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  heroItem: {
    flex: 1,
  },
  heroDivider: {
    width: 1,
    backgroundColor: '#DED7CE',
    marginHorizontal: spacing.md,
  },
  heroLabel: {
    ...typography.labelSmall,
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  heroValue: {
    ...typography.label,
    color: colors.text,
  },
  heroModeBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.primary}15`,
  },
  heroModeBadgeText: {
    ...typography.labelSmall,
    color: colors.primary,
    fontWeight: '600',
  },
  summaryCard: {
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: `${colors.primary}10`,
    borderRadius: borderRadius.md,
  },
  soilSelectionContainer: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.md,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: colors.background,
  },
  radioOptionActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  radioCircleFilled: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  radioLabel: {
    ...typography.body,
    color: colors.text,
  },
  radioLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  summaryText: {
    flex: 1,
  },
  summaryLabel: {
    ...typography.labelSmall,
    color: colors.muted,
  },
  summaryValue: {
    ...typography.label,
    color: colors.text,
    marginTop: spacing.xs / 2,
  },
  selectionContainer: {
    gap: spacing.md,
  },
  selectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectionItemActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  selectionCheckbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionItemContent: {
    flex: 1,
  },
  selectionItemTitle: {
    ...typography.label,
    color: colors.text,
  },
  selectionItemSubtitle: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: spacing.xs / 2,
  },
  modeLabel: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.md,
  },
  conditionIntro: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  conditionIntroTitle: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  conditionIntroText: {
    ...typography.bodySmall,
    color: colors.muted,
  },
  modeContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  modeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'flex-start',
    minHeight: 84,
  },
  modeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  modeButtonText: {
    ...typography.label,
    color: colors.muted,
  },
  modeButtonTextActive: {
    color: colors.primary,
  },
  modeButtonHint: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  modeButtonHintActive: {
    color: colors.text,
  },
  presetContainer: {
    gap: spacing.md,
  },
  presetList: {
    gap: spacing.md,
  },
  selectedPresetBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: '#ECFDF3',
  },
  selectedPresetText: {
    ...typography.bodySmall,
    color: '#166534',
    flex: 1,
  },
  customInputsContainer: {
    gap: spacing.md,
  },
  customOverviewCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  customOverviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  customOverviewTitle: {
    ...typography.label,
    color: colors.text,
  },
  customOverviewText: {
    ...typography.bodySmall,
    color: colors.muted,
  },
  customOverviewBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.primary}12`,
  },
  customOverviewBadgeText: {
    ...typography.labelSmall,
    color: colors.primary,
    fontWeight: '600',
  },
  selectorGrid: {
    gap: spacing.md,
  },
  selectorPanel: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  customSectionCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: spacing.md,
  },
  customSectionTitle: {
    ...typography.label,
    color: colors.text,
  },
  customSectionSubtitle: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: -4,
  },
  coneCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  coneCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  coneCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  coneCardTitle: {
    ...typography.label,
    color: colors.text,
    fontWeight: '600',
  },
  coneEditToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.primary}15`,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  coneEditToggleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  coneEditToggleText: {
    ...typography.labelSmall,
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  coneEditToggleTextActive: {
    color: '#fff',
  },
  coneValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  coneValueDisplay: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
    letterSpacing: -0.5,
    flex: 1,
  },
  coneValuePlaceholder: {
    color: '#C9D0D8',
    fontWeight: '400',
  },
  coneUnitBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.primary}12`,
  },
  coneUnitText: {
    ...typography.labelSmall,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  coneAutoBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    backgroundColor: '#DCFCE7',
  },
  coneAutoBadgeText: {
    ...typography.bodySmall,
    fontSize: 10,
    color: '#166534',
    fontWeight: '700',
  },
  coneDivider: {
    height: 1,
    backgroundColor: '#F0F1F3',
    marginHorizontal: spacing.md,
  },
  coneDropdownRow: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  conePickerContainer: {
    marginVertical: 0,
  },
  conePickerStyle: {
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  coneEditInputRow: {
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  coneEditInputContainer: {
    marginVertical: 0,
  },
  coneEditInput: {
    borderRadius: borderRadius.md,
  },
  inputField: {
    marginVertical: 0,
  },
  unit: {
    ...typography.bodySmall,
    color: colors.muted,
  },
  rightIconStack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  autoInput: {
    backgroundColor: '#ECFDF3',
  },
  readonlyInput: {
    backgroundColor: '#F3F4F6',
  },
  autoBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    backgroundColor: '#DCFCE7',
  },
  autoBadgeText: {
    ...typography.bodySmall,
    fontSize: 10,
    color: '#166534',
  },
  calculatedBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    backgroundColor: '#E5E7EB',
  },
  calculatedBadgeText: {
    ...typography.bodySmall,
    fontSize: 10,
    color: colors.muted,
  },
  refreshButton: {
    marginTop: spacing.md,
  },
  autoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: '#ECFDF3',
    marginBottom: spacing.md,
  },
  autoBannerText: {
    ...typography.bodySmall,
    color: '#166534',
    flex: 1,
    marginRight: spacing.sm,
  },
  autoBannerResetText: {
    ...typography.labelSmall,
    color: colors.primary,
  },
  errorCard: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  footer: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: colors.muted,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.danger,
    marginTop: spacing.md,
  },
  infoStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.primary}10`,
  },
  infoStripText: {
    ...typography.bodySmall,
    color: colors.text,
    flex: 1,
  },
  loadingText: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});