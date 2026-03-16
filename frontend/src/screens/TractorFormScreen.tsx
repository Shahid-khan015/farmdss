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

function toInteger(value: string) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.round(n);
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
  if (!Number.isFinite(n) || !Number.isInteger(n)) return `${label} must be a whole number`;
  if (n < 0) return `${label} must be >= 0`;
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
  const [frontOD, setFrontOD] = useState('');
  const [frontSW, setFrontSW] = useState('');
  const [frontSLR, setFrontSLR] = useState('');
  const [frontRR, setFrontRR] = useState('');
  const [rearOD, setRearOD] = useState('');
  const [rearSW, setRearSW] = useState('');
  const [rearSLR, setRearSLR] = useState('');
  const [rearRR, setRearRR] = useState('');
  const [touched, setTouched] = useState({
    name: false,
    model: false,
  });

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
    e.ptoPower = validateOptionalNonNegativeNumber(ptoPower, 'PTO Power');
    e.ratedSpeed = validateOptionalNonNegativeInteger(ratedSpeed, 'Rated Engine Speed');
    e.maxTorque = validateOptionalNonNegativeNumber(maxTorque, 'Maximum Engine Torque');
    e.wheelbase = validateOptionalNonNegativeNumber(wheelbase, 'Wheelbase');
    e.frontAxleWeight = validateOptionalNonNegativeNumber(frontAxleWeight, 'Front Axle Weight');
    e.rearAxleWeight = validateOptionalNonNegativeNumber(rearAxleWeight, 'Rear Axle Weight');
    e.hitchDistance = validateOptionalNonNegativeNumber(hitchDistance, 'Hitch Distance from Rear');
    e.cgFromRear = validateOptionalNonNegativeNumber(cgFromRear, 'CG Distance from Rear Axle');
    e.rearRollingRadius = validateOptionalNonNegativeNumber(rearRollingRadius, 'Rear Wheel Rolling Radius');
    e.transEff = validateOptionalNonNegativeNumber(transEff, 'Transmission Efficiency');
    e.powerReserve = validateOptionalNonNegativeNumber(powerReserve, 'Power Reserve');

    e.frontOD = validateOptionalNonNegativeInteger(frontOD, 'Front Overall Diameter');
    e.frontSW = validateOptionalNonNegativeInteger(frontSW, 'Front Section Width');
    e.frontSLR = validateOptionalNonNegativeInteger(frontSLR, 'Front Static Loaded Radius');
    e.frontRR = validateOptionalNonNegativeInteger(frontRR, 'Front Rolling Radius');
    e.rearOD = validateOptionalNonNegativeInteger(rearOD, 'Rear Overall Diameter');
    e.rearSW = validateOptionalNonNegativeInteger(rearSW, 'Rear Section Width');
    e.rearSLR = validateOptionalNonNegativeInteger(rearSLR, 'Rear Static Loaded Radius');
    e.rearRR = validateOptionalNonNegativeInteger(rearRR, 'Rear Rolling Radius');
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
    if (!canSubmit) return;

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
      front_overall_diameter: toInteger(frontOD),
      front_section_width: toInteger(frontSW),
      front_static_loaded_radius: toInteger(frontSLR),
      front_rolling_radius: toInteger(frontRR),
      rear_overall_diameter: toInteger(rearOD),
      rear_section_width: toInteger(rearSW),
      rear_static_loaded_radius: toInteger(rearSLR),
      rear_rolling_radius: toInteger(rearRR),
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
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          error={touched.name && !!errors.name}
          helperText={touched.name ? errors.name ?? undefined : undefined}
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
          onBlur={() => setTouched((t) => ({ ...t, model: true }))}
          error={touched.model && !!errors.model}
          helperText={touched.model ? errors.model ?? undefined : undefined}
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
          placeholder="kW"
          value={ptoPower}
          onChangeText={setPtoPower}
          keyboardType="decimal-pad"
          rightIcon={<Text style={styles.unit}>kW</Text>}
          error={!!errors.ptoPower}
          helperText={errors.ptoPower ?? undefined}
          containerStyle={styles.field}
        />
        <Input
          label="Rated Engine Speed"
          placeholder="rpm"
          value={ratedSpeed}
          onChangeText={setRatedSpeed}
          keyboardType="number-pad"
          rightIcon={<Text style={styles.unit}>rpm</Text>}
          error={!!errors.ratedSpeed}
          helperText={errors.ratedSpeed ?? undefined}
          containerStyle={styles.field}
        />
        <Input
          label="Maximum Engine Torque"
          placeholder="N-m"
          value={maxTorque}
          onChangeText={setMaxTorque}
          keyboardType="decimal-pad"
          error={!!errors.maxTorque}
          helperText={errors.maxTorque ?? undefined}
          rightIcon={<Text style={styles.unit}>N·m</Text>}
          containerStyle={styles.field}
        />
      </CollapsibleSection>

      {/* Geometry & Weight Section */}
      <CollapsibleSection title="Geometry & Weight" icon="square" defaultExpanded={false}>
        <Input
          label="Wheelbase"
          placeholder="m"
          value={wheelbase}
          onChangeText={setWheelbase}
          keyboardType="decimal-pad"
          rightIcon={<Text style={styles.unit}>m</Text>}
          error={!!errors.wheelbase}
          helperText={errors.wheelbase ?? undefined}
          containerStyle={styles.field}
        />
        <Input
          label="Front Axle Weight"
          placeholder="kg"
          value={frontAxleWeight}
          onChangeText={setFrontAxleWeight}
          keyboardType="decimal-pad"
          rightIcon={<Text style={styles.unit}>kg</Text>}
          error={!!errors.frontAxleWeight}
          helperText={errors.frontAxleWeight ?? undefined}
          containerStyle={styles.field}
        />
        <Input
          label="Rear Axle Weight"
          placeholder="kg"
          value={rearAxleWeight}
          onChangeText={setRearAxleWeight}
          keyboardType="decimal-pad"
          rightIcon={<Text style={styles.unit}>kg</Text>}
          error={!!errors.rearAxleWeight}
          helperText={errors.rearAxleWeight ?? undefined}
          containerStyle={styles.field}
        />
        <Input
          label="Hitch Distance from Rear"
          placeholder="m"
          value={hitchDistance}
          onChangeText={setHitchDistance}
          keyboardType="decimal-pad"
          rightIcon={<Text style={styles.unit}>m</Text>}
          error={!!errors.hitchDistance}
          helperText={errors.hitchDistance ?? undefined}
          containerStyle={styles.field}
        />
        <Input
          label="CG Distance from Rear Axle"
          placeholder="m"
          value={cgFromRear}
          onChangeText={setCgFromRear}
          keyboardType="decimal-pad"
          rightIcon={<Text style={styles.unit}>m</Text>}
          error={!!errors.cgFromRear}
          helperText={errors.cgFromRear ?? undefined}
          containerStyle={styles.field}
        />
        <Input
          label="Rear Wheel Rolling Radius"
          placeholder="m"
          value={rearRollingRadius}
          onChangeText={setRearRollingRadius}
          keyboardType="decimal-pad"
          rightIcon={<Text style={styles.unit}>m</Text>}
          error={!!errors.rearRollingRadius}
          helperText={errors.rearRollingRadius ?? undefined}
          containerStyle={styles.field}
        />
      </CollapsibleSection>

      {/* Powertrain Settings Section */}
      <CollapsibleSection title="Powertrain Settings" icon="settings" defaultExpanded={false}>
        <Input
          label="Transmission Efficiency"
          placeholder="%"
          value={transEff}
          onChangeText={setTransEff}
          keyboardType="decimal-pad"
          rightIcon={<Text style={styles.unit}>%</Text>}
          error={!!errors.transEff}
          helperText={errors.transEff ?? undefined}
          containerStyle={styles.field}
        />
        <Input
          label="Power Reserve"
          placeholder="%"
          value={powerReserve}
          onChangeText={setPowerReserve}
          keyboardType="decimal-pad"
          rightIcon={<Text style={styles.unit}>%</Text>}
          error={!!errors.powerReserve}
          helperText={errors.powerReserve ?? undefined}
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
          label="Overall Diameter"
          placeholder="mm"
          value={frontOD}
          onChangeText={setFrontOD}
          keyboardType="number-pad"
          rightIcon={<Text style={styles.unit}>mm</Text>}
          error={!!errors.frontOD}
          helperText={errors.frontOD ?? undefined}
          containerStyle={styles.field}
        />
        <Input
          label="Section Width"
          placeholder="mm"
          value={frontSW}
          onChangeText={setFrontSW}
          keyboardType="number-pad"
          rightIcon={<Text style={styles.unit}>mm</Text>}
          error={!!errors.frontSW}
          helperText={errors.frontSW ?? undefined}
          containerStyle={styles.field}
        />
        <Input
          label="Static Loaded Radius"
          placeholder="mm"
          value={frontSLR}
          onChangeText={setFrontSLR}
          keyboardType="number-pad"
          rightIcon={<Text style={styles.unit}>mm</Text>}
          error={!!errors.frontSLR}
          helperText={errors.frontSLR ?? undefined}
          containerStyle={styles.field}
        />
        <Input
          label="Rolling Radius"
          placeholder="mm"
          value={frontRR}
          onChangeText={setFrontRR}
          keyboardType="number-pad"
          rightIcon={<Text style={styles.unit}>mm</Text>}
          error={!!errors.frontRR}
          helperText={errors.frontRR ?? undefined}
          containerStyle={styles.field}
        />

        <Text style={styles.subSectionTitle}>Rear Tire</Text>
        <Input
          label="Overall Diameter"
          placeholder="mm"
          value={rearOD}
          onChangeText={setRearOD}
          keyboardType="number-pad"
          rightIcon={<Text style={styles.unit}>mm</Text>}
          error={!!errors.rearOD}
          helperText={errors.rearOD ?? undefined}
          containerStyle={styles.field}
        />
        <Input
          label="Section Width"
          placeholder="mm"
          value={rearSW}
          onChangeText={setRearSW}
          keyboardType="number-pad"
          rightIcon={<Text style={styles.unit}>mm</Text>}
          error={!!errors.rearSW}
          helperText={errors.rearSW ?? undefined}
          containerStyle={styles.field}
        />
        <Input
          label="Static Loaded Radius"
          placeholder="mm"
          value={rearSLR}
          onChangeText={setRearSLR}
          keyboardType="number-pad"
          rightIcon={<Text style={styles.unit}>mm</Text>}
          error={!!errors.rearSLR}
          helperText={errors.rearSLR ?? undefined}
          containerStyle={styles.field}
        />
        <Input
          label="Rolling Radius"
          placeholder="mm"
          value={rearRR}
          onChangeText={setRearRR}
          keyboardType="number-pad"
          rightIcon={<Text style={styles.unit}>mm</Text>}
          error={!!errors.rearRR}
          helperText={errors.rearRR ?? undefined}
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
          disabled={!canSubmit}
          loading={saving}
          onPress={handleSave}
        >
          {id ? 'Update Tractor' : isCopyMode ? 'Save to My Tractors' : 'Create Tractor'}
        </Button><Button
  variant="outline"
  size="lg"
  fullWidth
  disabled={saving}
  style={styles.cancelButtonOutline}
  onPress={() => nav.canGoBack() ? nav.goBack() : nav.navigate('TractorList')}
>
  <Text style={styles.cancelTextOutline}>Cancel</Text>
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
  cancelButtonFix: {
  backgroundColor: 'transparent',
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
  },cancelButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,                 // Thinner border is more elegant
    borderColor: colors.primary,    // Your Theme Green
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  cancelTextOutline: {
    color: colors.primary,          // Your Theme Green
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
    letterSpacing: 0.5,             // Slight spacing makes caps look better
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
});
