import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Animated,
  Pressable,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

import { colors } from '../constants/colors';
import { spacing, typography, borderRadius } from '../theme';
import type { DriveMode, TireType } from '../constants/enums';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { CollapsibleSection } from '../components/common/CollapsibleSection';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { useTractor, useUpsertTractor } from '../hooks/useTractors';
import { required, toNumber } from '../utils/validators';

// Tyre dimensions are stored to 2 dp. Real specs carry fractional millimetres
// (a 12.4 x 28 is 1226.31 mm, 314.96 mm wide), and rounding them measurably
// shifts the wheel numeric and everything downstream of it.
function toMillimetres(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100) / 100;
}

function validateOptionalNonNegativeNumber(value: string, label: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return `${label} must be a valid number`;
  if (n < 0) return `${label} must be >= 0`;
  return null;
}

function validateOptionalNonNegativeInteger(value: string, label: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return `${label} must be a valid number`;
  if (n < 0) return `${label} must be >= 0`;
  return null;
}

// Fields the simulation engine hard-requires. Leaving them blank used to save
// happily and then fail every simulation with a 422 listing fields the user was
// never asked for, so the check belongs here, at the point of entry.
function validateRequiredPositiveNumber(value: string, label: string) {
  const trimmed = value.trim();
  if (!trimmed) return `${label} is required to run simulations`;
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return `${label} must be a valid number`;
  if (n <= 0) return `${label} must be greater than 0`;
  return null;
}

function validateRequiredPositiveInteger(value: string, label: string) {
  const trimmed = value.trim();
  if (!trimmed) return `${label} is required to run simulations`;
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return `${label} must be a valid number`;
  if (n <= 0) return `${label} must be greater than 0`;
  return null;
}

export function TractorFormScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const id = route.params?.id as string | undefined;
  const initial = route.params?.initial as any | undefined;
  const isCopyMode = !id && !!initial;

  const tractorQ = useTractor(id ?? '');
  const { create, update } = useUpsertTractor();
  const saving = create.isPending || update.isPending;

  const [name, setName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [driveMode, setDriveMode] = useState<DriveMode>('2WD');
  const [ptoPower, setPtoPower] = useState('');
  const [ratedSpeed, setRatedSpeed] = useState('');
  const [maxTorque, setMaxTorque] = useState('');
  const [wheelbase, setWheelbase] = useState('');
  const [frontAxleWeight, setFrontAxleWeight] = useState('');
  const [rearAxleWeight, setRearAxleWeight] = useState('');
  const [hitchDistance, setHitchDistance] = useState('');
  const [cgFromRear, setCgFromRear] = useState('');
  const [rearRollingRadius, setRearRollingRadius] = useState('');
  const [transEff, setTransEff] = useState('');
  const [powerReserve, setPowerReserve] = useState('');

  const [tireType, setTireType] = useState<TireType>('Bias Ply');
  const [frontSize, setFrontSize] = useState('');
  const [rearSize, setRearSize] = useState('');
  const [frontOD, setFrontOD] = useState('');
  const [frontSW, setFrontSW] = useState('');
  const [frontSLR, setFrontSLR] = useState('');
  const [frontRR, setFrontRR] = useState('');
  const [rearOD, setRearOD] = useState('');
  const [rearSW, setRearSW] = useState('');
  const [rearSLR, setRearSLR] = useState('');
  const [rearRR, setRearRR] = useState('');
  // Validation runs continuously, but a result is only shown once the user has
  // left the field or tried to save. Without this the "add" form opens with
  // every required field already red, before anything has been typed.
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showErrors, setShowErrors] = useState(false);
  const markTouched = (field: string) => () =>
    setTouched((t) => ({ ...t, [field]: true }));
  const showError = (field: string): string | undefined =>
    showErrors || touched[field] ? errors[field] ?? undefined : undefined;

  useEffect(() => {
    const t = id ? tractorQ.data : initial;
    if (!t) return;

    setName(t.name ?? '');
    setManufacturer(t.manufacturer ?? '');
    setModel(t.model ?? '');
    setDriveMode(t.drive_mode);
    setPtoPower(t.pto_power?.toString() ?? '');
    setRatedSpeed(t.rated_engine_speed?.toString() ?? '');
    setMaxTorque(t.max_engine_torque?.toString() ?? '');
    setWheelbase(t.wheelbase?.toString() ?? '');
    setFrontAxleWeight(t.front_axle_weight?.toString() ?? '');
    setRearAxleWeight(t.rear_axle_weight?.toString() ?? '');
    setHitchDistance(t.hitch_distance_from_rear?.toString() ?? '');
    setCgFromRear(t.cg_distance_from_rear?.toString() ?? '');
    setRearRollingRadius(t.rear_wheel_rolling_radius?.toString() ?? '');
    setTransEff(t.transmission_efficiency?.toString() ?? '');
    setPowerReserve(t.power_reserve?.toString() ?? '');

    if (t.tire_specification) {
      setTireType(t.tire_specification.tire_type);
      setFrontSize(t.tire_specification.front_tire_size ?? '');
      setRearSize(t.tire_specification.rear_tire_size ?? '');
      setFrontOD(t.tire_specification.front_overall_diameter?.toString() ?? '');
      setFrontSW(t.tire_specification.front_section_width?.toString() ?? '');
      setFrontSLR(t.tire_specification.front_static_loaded_radius?.toString() ?? '');
      setFrontRR(t.tire_specification.front_rolling_radius?.toString() ?? '');
      setRearOD(t.tire_specification.rear_overall_diameter?.toString() ?? '');
      setRearSW(t.tire_specification.rear_section_width?.toString() ?? '');
      setRearSLR(t.tire_specification.rear_static_loaded_radius?.toString() ?? '');
      setRearRR(t.tire_specification.rear_rolling_radius?.toString() ?? '');
    }
  }, [id, initial, tractorQ.data]);

  const errors = useMemo<Record<string, string | null>>(() => {
    const e: Record<string, string | null> = {};
    e.name = required(name.trim(), 'Name');
    e.model = required(model.trim(), 'Model');
    // --- required by the simulation engine ---
    e.ptoPower = validateRequiredPositiveNumber(ptoPower, 'PTO Power');
    e.wheelbase = validateRequiredPositiveNumber(wheelbase, 'Wheelbase');
    e.frontAxleWeight = validateRequiredPositiveNumber(frontAxleWeight, 'Front Axle Weight');
    e.rearAxleWeight = validateRequiredPositiveNumber(rearAxleWeight, 'Rear Axle Weight');
    e.hitchDistance = validateRequiredPositiveNumber(hitchDistance, 'Hitch Distance from Rear');
    e.cgFromRear = validateRequiredPositiveNumber(cgFromRear, 'CG Distance from Rear Axle');
    e.transEff = validateRequiredPositiveNumber(transEff, 'Transmission Efficiency');
    e.powerReserve = validateOptionalNonNegativeNumber(powerReserve, 'Power Reserve');
    if (!e.powerReserve && !powerReserve.trim()) e.powerReserve = 'Power Reserve is required to run simulations';

    e.frontOD = validateRequiredPositiveInteger(frontOD, 'Front Overall Diameter');
    e.frontSW = validateRequiredPositiveInteger(frontSW, 'Front Section Width');
    e.rearOD = validateRequiredPositiveInteger(rearOD, 'Rear Overall Diameter');
    e.rearSW = validateRequiredPositiveInteger(rearSW, 'Rear Section Width');

    // --- optional diagnostics / fallbacks ---
    e.ratedSpeed = validateOptionalNonNegativeInteger(ratedSpeed, 'Rated Engine Speed');
    e.maxTorque = validateOptionalNonNegativeNumber(maxTorque, 'Maximum Engine Torque');
    e.rearRollingRadius = validateOptionalNonNegativeNumber(rearRollingRadius, 'Rear Wheel Rolling Radius');
    e.frontSLR = validateOptionalNonNegativeInteger(frontSLR, 'Front Static Loaded Radius');
    e.frontRR = validateOptionalNonNegativeInteger(frontRR, 'Front Rolling Radius');
    e.rearSLR = validateOptionalNonNegativeInteger(rearSLR, 'Rear Static Loaded Radius');
    e.rearRR = validateOptionalNonNegativeInteger(rearRR, 'Rear Rolling Radius');

    // A rolling radius must be resolvable on each axle: the engine falls back
    // SLR -> tractor rear radius, but with none of them set the run 422s.
    if (!frontRR.trim() && !frontSLR.trim()) {
      e.frontRR = 'Enter a front rolling radius or static loaded radius';
    }
    if (!rearRR.trim() && !rearSLR.trim() && !rearRollingRadius.trim()) {
      e.rearRR = 'Enter a rear rolling radius or static loaded radius';
    }

    // Static balance: Xcgt must equal Wf*L/(Wf+Wr). Catching it here prevents the
    // class of error that made every seeded tractor internally inconsistent.
    const L = Number(wheelbase);
    const wf = Number(frontAxleWeight);
    const wr = Number(rearAxleWeight);
    const cg = Number(cgFromRear);
    if ([L, wf, wr, cg].every((v) => Number.isFinite(v) && v > 0)) {
      const expected = (wf * L) / (wf + wr);
      if (Math.abs(cg - expected) > 0.05 * expected) {
        e.cgFromRear =
          `CG should be about ${expected.toFixed(2)} m for these axle weights ` +
          `(Wf x wheelbase / total). Check the value or the axle weights.`;
      }
    }
    return e;
  }, [
    name,
    model,
    ptoPower,
    ratedSpeed,
    maxTorque,
    wheelbase,
    frontAxleWeight,
    rearAxleWeight,
    hitchDistance,
    cgFromRear,
    rearRollingRadius,
    transEff,
    powerReserve,
    frontOD,
    frontSW,
    frontSLR,
    frontRR,
    rearOD,
    rearSW,
    rearSLR,
    rearRR,
  ]);

  const canSubmit = Object.values(errors).every((v) => !v) && !saving;

  const handleSave = async () => {
    if (!canSubmit) {
      // The button stays pressable so it can explain itself; a disabled control
      // with no reason is how the user gets stuck.
      setShowErrors(true);
      return;
    }

    const payload: any = {
      name: name.trim(),
      manufacturer: manufacturer.trim() || null,
      model: model.trim(),
      drive_mode: driveMode,
      is_library: false,
      pto_power: toNumber(ptoPower),
      rated_engine_speed: toNumber(ratedSpeed),
      max_engine_torque: toNumber(maxTorque),
      wheelbase: toNumber(wheelbase),
      front_axle_weight: toNumber(frontAxleWeight),
      rear_axle_weight: toNumber(rearAxleWeight),
      hitch_distance_from_rear: toNumber(hitchDistance),
      cg_distance_from_rear: toNumber(cgFromRear),
      rear_wheel_rolling_radius: toNumber(rearRollingRadius),
      transmission_efficiency: toNumber(transEff),
      power_reserve: toNumber(powerReserve),
    };

    const tire = {
      tire_type: tireType,
      front_tire_size: frontSize.trim() || null,
      rear_tire_size: rearSize.trim() || null,
      front_overall_diameter: toMillimetres(frontOD),
      front_section_width: toMillimetres(frontSW),
      front_static_loaded_radius: toMillimetres(frontSLR),
      front_rolling_radius: toMillimetres(frontRR),
      rear_overall_diameter: toMillimetres(rearOD),
      rear_section_width: toMillimetres(rearSW),
      rear_static_loaded_radius: toMillimetres(rearSLR),
      rear_rolling_radius: toMillimetres(rearRR),
    };

    if (!id) {
      payload.tire_specification = tire;
      const created = await create.mutateAsync(payload);
      nav.replace('TractorDetail', { id: created.id });
    } else {
      await update.mutateAsync({ id, payload });
      nav.goBack();
    }
  };

  if (id && tractorQ.isLoading) return <LoadingSpinner />;
  if (id && tractorQ.error) return <ErrorMessage message={(tractorQ.error as Error).message} />;

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
       
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {id ? 'Edit Tractor' : isCopyMode ? 'Customize Tractor' : 'Add Tractor'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {id
              ? 'Update tractor specifications'
              : isCopyMode
                ? 'Modify this library tractor and save it to My Tractors'
                : 'Register a new tractor'}
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
          label="Tractor Name"
          placeholder="e.g., John Deere #1"
          value={name}
          onChangeText={setName}
          onBlur={markTouched('name')}
          error={!!showError('name')}
          helperText={showError('name')}
          containerStyle={styles.field}
        />

        <Input
          label="Manufacturer"
          placeholder="e.g., John Deere"
          value={manufacturer}
          onChangeText={setManufacturer}
          containerStyle={styles.field}
        />
        <Input
          label="Model"
          placeholder="e.g., 5100M"
          value={model}
          onChangeText={setModel}
          onBlur={markTouched('model')}
          error={!!showError('model')}
          helperText={showError('model')}
          containerStyle={styles.field}
        />


        {/* Drive Mode Selector */}
        <Text style={styles.fieldLabel}>Drive Mode</Text>
        <View style={styles.driveModeContainer}>
          {(['2WD', '4WD'] as const).map((mode) => (
            <Pressable
              key={mode}
              onPress={() => setDriveMode(mode)}
              style={[
                styles.modeButton,
                driveMode === mode && styles.modeButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  driveMode === mode && styles.modeButtonTextActive,
                ]}
              >
                {mode}
              </Text>
            </Pressable>
          ))}
        </View>
      </CollapsibleSection>

      {/* Power & Engine Section */}
      <CollapsibleSection title="Power & Engine" icon="zap" defaultExpanded>
        <Input
          label="PTO Power"
          required
          labelHint="> 10 kW to simulate"
          value={ptoPower}
          onChangeText={setPtoPower}
          keyboardType="decimal-pad"
          unit={"kW"}
          onBlur={markTouched('ptoPower')}
          error={!!showError('ptoPower')}
          helperText={showError('ptoPower') ?? 'Rated PTO power. Simulations reject tractors at or below 10 kW.'}
          containerStyle={styles.field}
        />
        <Input
          label="Rated Engine Speed"
          value={ratedSpeed}
          onChangeText={setRatedSpeed}
          keyboardType="decimal-pad"
          unit={"rpm"}
          onBlur={markTouched('ratedSpeed')}
          error={!!showError('ratedSpeed')}
          helperText={showError('ratedSpeed') ?? undefined}
          containerStyle={styles.field}
        />
        <Input
          label="Maximum Engine Torque"
          value={maxTorque}
          onChangeText={setMaxTorque}
          keyboardType="decimal-pad"
          onBlur={markTouched('maxTorque')}
          error={!!showError('maxTorque')}
          helperText={showError('maxTorque') ?? undefined}
          unit={"N·m"}
          containerStyle={styles.field}
        />
      </CollapsibleSection>

      {/* Geometry & Weight Section */}
      <CollapsibleSection title="Geometry & Weight" icon="square" defaultExpanded={false}>
        <Input
          label="Wheelbase"
          value={wheelbase}
          onChangeText={setWheelbase}
          keyboardType="decimal-pad"
          unit={"m"}
          onBlur={markTouched('wheelbase')}
          error={!!showError('wheelbase')}
          helperText={showError('wheelbase') ?? undefined}
          containerStyle={styles.field}
        />
        <Input
          label="Front Axle Weight"
          value={frontAxleWeight}
          onChangeText={setFrontAxleWeight}
          keyboardType="decimal-pad"
          unit={"kg"}
          onBlur={markTouched('frontAxleWeight')}
          error={!!showError('frontAxleWeight')}
          helperText={showError('frontAxleWeight') ?? undefined}
          containerStyle={styles.field}
        />
        <Input
          label="Rear Axle Weight"
          value={rearAxleWeight}
          onChangeText={setRearAxleWeight}
          keyboardType="decimal-pad"
          unit={"kg"}
          onBlur={markTouched('rearAxleWeight')}
          error={!!showError('rearAxleWeight')}
          helperText={showError('rearAxleWeight') ?? undefined}
          containerStyle={styles.field}
        />
        <Input
          label="Hitch Distance from Rear"
          value={hitchDistance}
          onChangeText={setHitchDistance}
          keyboardType="decimal-pad"
          unit={"m"}
          onBlur={markTouched('hitchDistance')}
          error={!!showError('hitchDistance')}
          helperText={showError('hitchDistance') ?? undefined}
          containerStyle={styles.field}
        />
        <Input
          label="CG Distance from Rear Axle"
          value={cgFromRear}
          onChangeText={setCgFromRear}
          keyboardType="decimal-pad"
          unit={"m"}
          onBlur={markTouched('cgFromRear')}
          error={!!showError('cgFromRear')}
          helperText={showError('cgFromRear') ?? undefined}
          containerStyle={styles.field}
        />
        <Input
          label="Rear Wheel Rolling Radius"
          value={rearRollingRadius}
          onChangeText={setRearRollingRadius}
          keyboardType="decimal-pad"
          unit={"m"}
          onBlur={markTouched('rearRollingRadius')}
          error={!!showError('rearRollingRadius')}
          helperText={showError('rearRollingRadius') ?? undefined}
          containerStyle={styles.field}
        />
      </CollapsibleSection>

      {/* Powertrain Settings Section */}
      <CollapsibleSection title="Powertrain Settings" icon="settings" defaultExpanded={false}>
        <Input
          label="Transmission Efficiency"
          value={transEff}
          onChangeText={setTransEff}
          keyboardType="decimal-pad"
          unit={"%"}
          onBlur={markTouched('transEff')}
          error={!!showError('transEff')}
          helperText={showError('transEff') ?? undefined}
          containerStyle={styles.field}
        />
        <Input
          label="Power Reserve"
          value={powerReserve}
          onChangeText={setPowerReserve}
          keyboardType="decimal-pad"
          unit={"%"}
          onBlur={markTouched('powerReserve')}
          error={!!showError('powerReserve')}
          helperText={showError('powerReserve') ?? undefined}
          containerStyle={styles.field}
        />
      </CollapsibleSection>

      {/* Tire Specifications Section */}
      <CollapsibleSection
        title="Tire Specifications"
        icon="circle"
        defaultExpanded={false}
        accessibilityLabel="Tire specifications, required for simulation"
      >
        <View style={styles.tyreExplainer}>
          <Feather name="info" size={14} color={colors.accent} />
          <Text style={styles.tyreExplainerText}>
            Tyre width and diameter drive the wheel-numeric that governs traction and rolling
            resistance. A tractor without them cannot be simulated.
          </Text>
        </View>
        <Text style={styles.fieldLabel}>Tire Type</Text>
        <View style={styles.driveModeContainer}>
          {(['Bias Ply', 'Radial Ply'] as const).map((type) => (
            <Pressable
              key={type}
              onPress={() => setTireType(type)}
              style={[
                styles.modeButton,
                tireType === type && styles.modeButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  tireType === type && styles.modeButtonTextActive,
                ]}
              >
                {type}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.subSectionTitle}>Front Tire</Text>
        <Input
          label="Tyre Size"
          value={frontSize}
          onChangeText={setFrontSize}
          autoCapitalize="none"
          helperText='Designation, e.g. "12.4 x 28" - first number is the section width in inches, second the rim diameter.'
          containerStyle={styles.field}
        />
        <Input
          label="Overall Diameter"
          required
          value={frontOD}
          onChangeText={setFrontOD}
          keyboardType="decimal-pad"
          unit={"mm"}
          onBlur={markTouched('frontOD')}
          error={!!showError('frontOD')}
          helperText={showError('frontOD') ?? "Full inflated tyre diameter, NOT the rim size. A 12.4 x 28 tyre is about 1226 mm, not 711. Entering the rim understates traction badly."}
          containerStyle={styles.field}
        />
        <Input
          label="Section Width"
          required
          value={frontSW}
          onChangeText={setFrontSW}
          keyboardType="decimal-pad"
          unit={"mm"}
          onBlur={markTouched('frontSW')}
          error={!!showError('frontSW')}
          helperText={showError('frontSW') ?? undefined}
          containerStyle={styles.field}
        />
        <Input
          label="Static Loaded Radius"
          value={frontSLR}
          onChangeText={setFrontSLR}
          keyboardType="decimal-pad"
          unit={"mm"}
          onBlur={markTouched('frontSLR')}
          error={!!showError('frontSLR')}
          helperText={showError('frontSLR') ?? undefined}
          containerStyle={styles.field}
        />
        <Input
          label="Rolling Radius"
          value={frontRR}
          onChangeText={setFrontRR}
          keyboardType="decimal-pad"
          unit={"mm"}
          onBlur={markTouched('frontRR')}
          error={!!showError('frontRR')}
          helperText={showError('frontRR') ?? undefined}
          containerStyle={styles.field}
        />

        <Text style={styles.subSectionTitle}>Rear Tire</Text>
        <Input
          label="Tyre Size"
          value={rearSize}
          onChangeText={setRearSize}
          autoCapitalize="none"
          helperText='Designation, e.g. "12.4 x 28" - first number is the section width in inches, second the rim diameter.'
          containerStyle={styles.field}
        />
        <Input
          label="Overall Diameter"
          required
          value={rearOD}
          onChangeText={setRearOD}
          keyboardType="decimal-pad"
          unit={"mm"}
          onBlur={markTouched('rearOD')}
          error={!!showError('rearOD')}
          helperText={showError('rearOD') ?? "Full inflated tyre diameter, NOT the rim size. A 12.4 x 28 tyre is about 1226 mm, not 711. Entering the rim understates traction badly."}
          containerStyle={styles.field}
        />
        <Input
          label="Section Width"
          required
          value={rearSW}
          onChangeText={setRearSW}
          keyboardType="decimal-pad"
          unit={"mm"}
          onBlur={markTouched('rearSW')}
          error={!!showError('rearSW')}
          helperText={showError('rearSW') ?? undefined}
          containerStyle={styles.field}
        />
        <Input
          label="Static Loaded Radius"
          value={rearSLR}
          onChangeText={setRearSLR}
          keyboardType="decimal-pad"
          unit={"mm"}
          onBlur={markTouched('rearSLR')}
          error={!!showError('rearSLR')}
          helperText={showError('rearSLR') ?? undefined}
          containerStyle={styles.field}
        />
        <Input
          label="Rolling Radius"
          value={rearRR}
          onChangeText={setRearRR}
          keyboardType="decimal-pad"
          unit={"mm"}
          onBlur={markTouched('rearRR')}
          error={!!showError('rearRR')}
          helperText={showError('rearRR') ?? undefined}
          containerStyle={styles.field}
        />
      </CollapsibleSection>

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
          disabled={saving}
          loading={saving}
          onPress={handleSave}
        >
          {id ? 'Update Tractor' : isCopyMode ? 'Save to My Tractors' : 'Create Tractor'}
        </Button>
        <Button
          variant="outline"
          size="lg"
          fullWidth
          style={styles.matchingOutlineButton}
          disabled={saving}
          onPress={() => (nav.canGoBack() ? nav.goBack() : nav.navigate('TractorList'))}
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
  subSectionTitle: {
    ...typography.h5,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  driveModeContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
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
  tyreExplainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: '#E2EEF7',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  tyreExplainerText: {
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
