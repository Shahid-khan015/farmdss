import React, { useEffect, useMemo, useState } from 'react';
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
import {
  ACTIVE_IMPLEMENT_TYPES,
  DISC_HARROW_CONFIGURATIONS,
  PASSIVE_IMPLEMENT_TYPES,
  TILLAGE_STAGE_LABEL,
  isActiveImplement,
  tillageStageOf,
  type DiscHarrowConfiguration,
  type ImplementType,
} from '../constants/enums';
import { ROTOR_EFFICIENCY_RANGE } from '../utils/dssBands';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { CollapsibleSection } from '../components/common/CollapsibleSection';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { useImplement, useUpsertImplement } from '../hooks/useImplements';
import { required, toNumber } from '../utils/validators';
import { INPUT_RANGES } from '../utils/dssBands';

export function ImplementFormScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const id = route.params?.id as string | undefined;
  const initial = route.params?.initial as any | undefined;
  const isCopyMode = !id && !!initial;

  const impQ = useImplement(id ?? '');
  const { create, update } = useUpsertImplement();
  const saving = create.isPending || update.isPending;

  const [name, setName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [implementType, setImplementType] = useState<ImplementType>('MB Plough');
  const [width, setWidth] = useState('');
  const [weight, setWeight] = useState('');
  const [cg, setCg] = useState('');
  const [vh, setVh] = useState('');
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [c, setC] = useState('');
  const [configuration, setConfiguration] = useState<DiscHarrowConfiguration | null>(null);
  const [rotorDa, setRotorDa] = useState('');
  const [rotorEta, setRotorEta] = useState('');
  const [rotorPto, setRotorPto] = useState('');
  const [rotorSpeed, setRotorSpeed] = useState('');
const [touched, setTouched] = useState({
  name: false,
});

  const isPowered = isActiveImplement(implementType);
  const supportsConfiguration =
    implementType === 'Disc Harrow' || implementType === 'Disc Harrow (Powered)';

  useEffect(() => {
    const i = id ? impQ.data : initial;
    if (!i) return;

    setName(i.name ?? '');
    setManufacturer(i.manufacturer ?? '');
    setImplementType(i.implement_type);
    setWidth(i.width?.toString() ?? '');
    setWeight(i.weight?.toString() ?? '');
    setCg(i.cg_distance_from_hitch?.toString() ?? '');
    setVh(i.vertical_horizontal_ratio?.toString() ?? '');
    setA(i.asae_param_a?.toString() ?? '');
    setB(i.asae_param_b?.toString() ?? '');
    setC(i.asae_param_c?.toString() ?? '');
    setConfiguration(i.configuration ?? null);
    setRotorDa(i.rotor_mechanical_resistance?.toString() ?? '');
    setRotorEta(i.rotor_efficiency?.toString() ?? '');
    setRotorPto(i.rotor_pto_power?.toString() ?? '');
    setRotorSpeed(i.rotor_speed?.toString() ?? '');
  }, [id, initial, impQ.data]);

  // Configuration is only meaningful for disc harrows.
  useEffect(() => {
    if (!supportsConfiguration && configuration !== null) setConfiguration(null);
  }, [supportsConfiguration, configuration]);

  const errors = useMemo(() => {
    const e: Record<string, string | null> = {};
    e.name = required(name.trim(), 'Name');

    // `toNumber('')` is 0, not null, so an empty field must be detected from the
    // raw string — otherwise a blank input silently reads as 0 and trips the
    // range checks below with a misleading "out of range" message.
    const widthText = width.trim();
    if (widthText !== '') {
      // Width outside the backend's accepted band makes every simulation fail
      // with a 422, so it is caught here rather than at run time.
      const widthValue = toNumber(widthText);
      const { min, max, unit } = INPUT_RANGES.implement_width;
      if (widthValue !== null && (widthValue < min || widthValue > max)) {
        e.width = `Simulations require a width between ${min} and ${max} ${unit}.`;
      }
    } else if (!isPowered) {
      // Width feeds the passive draft equation and is required for those tools.
      // A rotor's working width is not a DSS input, so powered tools may omit it.
      e.width = 'Width is required';
    }

    if (isPowered) {
      // Without all four, the implement cannot fill the rotor slot of an
      // active-passive run: it would save "successfully" and then be
      // unselectable there. Catch it at creation instead.
      e.rotorDa = required(rotorDa.trim(), 'Mechanical resistance');
      e.rotorPto = required(rotorPto.trim(), 'PTO power draw');
      e.rotorSpeed = required(rotorSpeed.trim(), 'Rotor speed');

      const etaText = rotorEta.trim();
      if (etaText === '') {
        e.rotorEta = 'Rotor efficiency is required';
      } else {
        const eta = toNumber(etaText);
        const { min, max } = ROTOR_EFFICIENCY_RANGE;
        if (eta !== null && (eta < min || eta > max)) {
          e.rotorEta = `Rotor efficiency must be between ${min} and ${max}.`;
        }
      }
    }
    return e;
  }, [name, width, isPowered, rotorDa, rotorEta, rotorPto, rotorSpeed]);

  const canSubmit = Object.values(errors).every((v) => !v) && !saving;

  const handleSave = async () => {
    // `toNumber('')` is 0, so a blank optional field would otherwise be stored as
    // a real 0 — which reads as "present" to the readiness check and produces
    // silently wrong results instead of an honest "not set".
    const numOrNull = (text: string) => (text.trim() === '' ? null : toNumber(text));

    const payload: any = {
      name: name.trim(),
      manufacturer: manufacturer.trim() || null,
      implement_type: implementType,
      is_library: false,
      width: numOrNull(width),
      weight: numOrNull(weight),
      cg_distance_from_hitch: numOrNull(cg),
      vertical_horizontal_ratio: numOrNull(vh),
      configuration: supportsConfiguration ? configuration : null,
      // Powered tools never run through the DSS passive-draft equation, so ASAE
      // A/B/C are not collected for them; rotor specs are sent instead.
      asae_param_a: isPowered ? null : numOrNull(a),
      asae_param_b: isPowered ? null : numOrNull(b),
      asae_param_c: isPowered ? null : numOrNull(c),
      rotor_mechanical_resistance: isPowered ? numOrNull(rotorDa) : null,
      rotor_efficiency: isPowered ? numOrNull(rotorEta) : null,
      rotor_pto_power: isPowered ? numOrNull(rotorPto) : null,
      rotor_speed: isPowered ? numOrNull(rotorSpeed) : null,
    };

    if (!id) {
      const created = await create.mutateAsync(payload);
      nav.replace('ImplementDetail', { id: created.id });
    } else {
      await update.mutateAsync({ id, payload });
      nav.goBack();
    }
  };

  const canSave = Object.values(errors).every((v) => !v) && !saving;

  if (id && impQ.isLoading) return <LoadingSpinner />;
  if (id && impQ.error) return <ErrorMessage message={(impQ.error as Error).message} />;

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {id ? 'Edit Implement' : isCopyMode ? 'Customize Implement' : 'Add Implement'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {id
              ? 'Update implement specifications'
              : isCopyMode
                ? 'Modify this library implement and save it to My Implements'
                : 'Register a new implement'}
          </Text>
        </View>
        {(id || isCopyMode) && (
          <View style={styles.badgeWrapper}>
            <Text style={styles.badge}>{id ? 'Edit' : 'Copy'}</Text>
          </View>
        )}
      </View>

      {/* Basic Information Section */}
      <CollapsibleSection title="Basic Information" icon="info" defaultExpanded>
        <Input
          label="Implement Name"
          required
          placeholder="e.g., Plough #1"
          value={name}
          onChangeText={setName}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          error={touched.name && !!errors.name}
          helperText={touched.name ? errors.name ?? undefined : undefined}
          containerStyle={styles.field}
        />

        <Input
          label="Manufacturer"
          placeholder="e.g., Massey Ferguson"
          value={manufacturer}
          onChangeText={setManufacturer}
          containerStyle={styles.field}
        />

        {/* Implement Type Selector — grouped by power class, matching the DSS taxonomy */}
        <Text style={styles.fieldLabel}>Implement Type</Text>

        <Text style={styles.groupLabel}>Passive · conventional tillage</Text>
        <View style={styles.typeContainer}>
          {PASSIVE_IMPLEMENT_TYPES.map((type) => {
            const stage = tillageStageOf(type);
            const selected = implementType === type;
            return (
              <Pressable
                key={type}
                onPress={() => setImplementType(type)}
                style={[styles.typeButton, selected && styles.typeButtonActive]}
              >
                <Text style={[styles.typeButtonText, selected && styles.typeButtonTextActive]}>
                  {type}
                </Text>
                {stage && (
                  <Text style={[styles.typeButtonHint, selected && styles.typeButtonHintActive]}>
                    {TILLAGE_STAGE_LABEL[stage]}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.groupLabel}>Active · PTO-powered</Text>
        <View style={styles.typeContainer}>
          {ACTIVE_IMPLEMENT_TYPES.map((type) => {
            const selected = implementType === type;
            return (
              <Pressable
                key={type}
                onPress={() => setImplementType(type)}
                style={[styles.typeButton, selected && styles.typeButtonActive]}
              >
                <Text style={[styles.typeButtonText, selected && styles.typeButtonTextActive]}>
                  {type}
                </Text>
                <Text style={[styles.typeButtonHint, selected && styles.typeButtonHintActive]}>
                  Rotor slot
                </Text>
              </Pressable>
            );
          })}
        </View>

        {isPowered && (
          <View style={styles.explainer}>
            <Feather name="info" size={14} color={colors.accent} />
            <Text style={styles.explainerText}>
              Powered tools are used as the driven rotor of an Active + Passive combi simulation.
              They are not run through the passive draft equation, so ASAE parameters are not
              required — the rotor specs below are used instead.
            </Text>
          </View>
        )}

        {supportsConfiguration && (
          <>
            <Text style={styles.fieldLabel}>Disc arrangement</Text>
            <View style={styles.typeContainer}>
              {DISC_HARROW_CONFIGURATIONS.map((cfg) => {
                const selected = configuration === cfg;
                return (
                  <Pressable
                    key={cfg}
                    onPress={() => setConfiguration(selected ? null : cfg)}
                    style={[styles.typeButton, selected && styles.typeButtonActive]}
                  >
                    <Text style={[styles.typeButtonText, selected && styles.typeButtonTextActive]}>
                      {cfg}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.footnote}>
              Descriptive only — the DSS gives no distinct coefficients for Tandem vs Offset, so
              this does not change any result.
            </Text>
          </>
        )}
      </CollapsibleSection>

      {/* Geometry & weight — all required by the DSS draft and axle-load model */}
      <CollapsibleSection title="Geometry & Weight" icon="square" defaultExpanded>
        <Input
          label="Working width"
          required
          unit="m"
          labelHint={`${INPUT_RANGES.implement_width.min}–${INPUT_RANGES.implement_width.max} m`}
          value={width}
          onChangeText={setWidth}
          keyboardType="decimal-pad"
          error={!!errors.width}
          helperText={errors.width ?? 'Cutting width used for draft and field capacity.'}
          containerStyle={styles.field}
        />
        <Input
          label="Weight"
          required
          unit="kg"
          value={weight}
          onChangeText={setWeight}
          keyboardType="decimal-pad"
          helperText="Mass carried on the hitch, used in the axle-load balance."
          containerStyle={styles.field}
        />
        <Input
          label="CG distance from hitch"
          required
          unit="m"
          value={cg}
          onChangeText={setCg}
          keyboardType="decimal-pad"
          helperText="Horizontal distance from the hitch point to the implement's centre of gravity."
          containerStyle={styles.field}
        />
        <Input
          label="Vertical/horizontal ratio"
          value={vh}
          onChangeText={setVh}
          keyboardType="decimal-pad"
          labelHint="Not used"
          helperText="Superseded — the engine uses the DSS Py/D table for this implement type instead. Kept for older records."
          containerStyle={styles.field}
        />
      </CollapsibleSection>

      {/* ASAE draft parameters — passive tools only */}
      {!isPowered && (
        <CollapsibleSection title="ASAE Draft Parameters" icon="settings" defaultExpanded>
          <View style={styles.explainer}>
            <Feather name="info" size={14} color={colors.accent} />
            <Text style={styles.explainerText}>
              Machine constants from ASABE D497 that describe how this implement's draft grows with
              speed: draft ∝ A + B×speed + C×speed². Take them from the standard's table for your
              implement type — they are not something to estimate.
            </Text>
          </View>
          <Input
            label="Parameter A"
            required
            labelHint="Constant term"
            value={a}
            onChangeText={setA}
            keyboardType="decimal-pad"
            containerStyle={styles.field}
          />
          <Input
            label="Parameter B"
            required
            labelHint="× speed"
            value={b}
            onChangeText={setB}
            keyboardType="decimal-pad"
            containerStyle={styles.field}
          />
          <Input
            label="Parameter C"
            required
            labelHint="× speed²"
            value={c}
            onChangeText={setC}
            keyboardType="decimal-pad"
            containerStyle={styles.field}
          />
        </CollapsibleSection>
      )}

      {/* Rotor specifications — powered tools only (DSS Section 5) */}
      {isPowered && (
        <CollapsibleSection title="Rotor Specifications" icon="rotate-cw" defaultExpanded>
          <View style={styles.explainer}>
            <Feather name="info" size={14} color={colors.accent} />
            <Text style={styles.explainerText}>
              Saved here so this rotor can be picked directly in an Active + Passive simulation
              instead of retyping its specs each run. Individual values can still be overridden per
              simulation.
            </Text>
          </View>
          <Input
            label="Mechanical resistance"
            required
            unit="N"
            labelHint="Da"
            value={rotorDa}
            onChangeText={setRotorDa}
            keyboardType="decimal-pad"
            error={!!errors.rotorDa}
            helperText={
              errors.rotorDa ??
              "The rotor's own frame/bearing drag, independent of the thrust it develops."
            }
            containerStyle={styles.field}
          />
          <Input
            label="Rotor efficiency"
            required
            labelHint={`ηr · ${ROTOR_EFFICIENCY_RANGE.min}–${ROTOR_EFFICIENCY_RANGE.max}`}
            value={rotorEta}
            onChangeText={setRotorEta}
            keyboardType="decimal-pad"
            error={!!errors.rotorEta}
            helperText={
              errors.rotorEta ?? 'Share of PTO power converted into useful forward thrust.'
            }
            containerStyle={styles.field}
          />
          <Input
            label="PTO power draw"
            required
            unit="kW"
            labelHint="P_PTO"
            value={rotorPto}
            onChangeText={setRotorPto}
            keyboardType="decimal-pad"
            error={!!errors.rotorPto}
            helperText={
              errors.rotorPto ?? 'Power the rotor takes from the engine via the PTO.'
            }
            containerStyle={styles.field}
          />
          <Input
            label="Rotor speed"
            required
            unit="rpm"
            labelHint="N"
            value={rotorSpeed}
            onChangeText={setRotorSpeed}
            keyboardType="decimal-pad"
            error={!!errors.rotorSpeed}
            helperText={
              errors.rotorSpeed ?? 'Used for the PTO reaction moment, MPTO = 9550 × P_PTO / N.'
            }
            containerStyle={styles.field}
          />
        </CollapsibleSection>
      )}

      {/* Error Messages */}
      {create.error && (
        <Card variant="outlined" style={styles.errorCard}>
          <ErrorMessage message={(create.error as Error).message} />
        </Card>
      )}
      {update.error && (
        <Card variant="outlined" style={styles.errorCard}>
          <ErrorMessage message={(update.error as Error).message} />
        </Card>
      )}

      {/* Action Buttons */}
      <View style={styles.footer}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canSave}
          loading={saving}
          onPress={handleSave}
        >
          {id ? 'Update Implement' : isCopyMode ? 'Save to My Implements' : 'Create Implement'}
        </Button>
        <Button
          variant="outline"
          size="lg"
          fullWidth
          style={styles.matchingOutlineButton}
          disabled={saving}
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
  badgeWrapper: {
    backgroundColor: `${colors.primary}20`,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  badge: {
    ...typography.labelSmall,
    color: colors.primary,
  },
  field: {
    marginVertical: spacing.sm,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  typeContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',   // important
},

  typeButton: {
  width: '48%',              // fixed grid column
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.lg,
  borderRadius: borderRadius.md,
  borderWidth: 2,
  borderColor: '#E5E7EB',
  justifyContent: 'center',
  alignItems: 'center',
},

  typeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  typeButtonText: {
    ...typography.label,
    color: colors.muted,
    textAlign: 'center',
  },
  typeButtonTextActive: {
    color: colors.primary,
  },
  typeButtonHint: {
    ...typography.labelSmall,
    color: colors.muted,
    opacity: 0.75,
    marginTop: 2,
  },
  typeButtonHintActive: {
    color: colors.primary,
    opacity: 0.9,
  },
  groupLabel: {
    ...typography.labelSmall,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  footnote: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: spacing.sm,
  },
  explainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: '#E2EEF7',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  explainerText: {
    ...typography.bodySmall,
    color: '#154663',
    flex: 1,
  },
  unit: {
    ...typography.bodySmall,
    color: colors.muted,
  },
  errorCard: {
    marginTop: spacing.lg,
  },
  footer: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  matchingOutlineButton: {
    minHeight: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
});

