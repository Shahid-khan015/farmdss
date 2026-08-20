import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';

import { Input } from '../components/common/Input';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { SkeletonCard } from '../components/common/Skeleton';
import { ConditionsForm } from '../components/simulation/ConditionsForm';
import { EquipmentPicker, implementSpecLine, tractorSpecLine } from '../components/simulation/EquipmentPicker';
import type { EquipmentOption } from '../components/simulation/EquipmentPicker';
import { EngineDiagnosticExplainer } from '../components/simulation/EngineDiagnosticExplainer';
import { ModeSelectorCard } from '../components/simulation/ModeSelectorCard';
import { TillageClassSelector } from '../components/simulation/TillageClassSelector';
import { RangeStepper } from '../components/simulation/RangeStepper';
import { ReviewSummary } from '../components/simulation/ReviewSummary';
import { RotorConfigForm } from '../components/simulation/RotorConfigForm';
import { SegmentedControl } from '../components/simulation/SegmentedControl';
import { WizardProgressHeader } from '../components/simulation/WizardProgressHeader';
import { RunProgressOverlay } from '../components/simulation/RunProgressOverlay';
import { ThemedButton } from '../components/common/ThemedButton';
import { useImplements } from '../hooks/useImplements';
import { useTractors } from '../hooks/useTractors';
import { useRunSimulation } from '../hooks/useSimulations';
import { useOperatingConditions } from '../hooks/useOperatingConditions';
import {
  BACKEND_FIELD_LABELS,
  draftSeedFromSimulation,
  stepForBackendField,
  useSimulationDraft,
  type SimulationDraft,
} from '../hooks/useSimulationDraft';
import { useSimulation } from '../hooks/useSimulations';
import {
  TILLAGE_STAGE_LABEL,
  isActiveImplement,
  isPassiveImplement,
  tillageStageOf,
} from '../constants/enums';
import { useTheme } from '../theme/ThemeProvider';
import { KI_RANGE } from '../utils/dssBands';
import { checkImplementReadiness, checkTractorReadiness } from '../utils/simulationReadiness';
import { fieldErrorsOf, toApiError, type ApiError } from '../services/apiError';
import type { SimulationScreenNavigation, SimulationStackParamList } from '../navigation/types';

const STEPS = [
  { key: 'equipment', title: 'Mode & equipment' },
  { key: 'conditions', title: 'Field conditions' },
  { key: 'review', title: 'Review & run' },
];

type SetupRoute = RouteProp<SimulationStackParamList, 'SimulationSetup'>;

export function SimulationSetupScreen() {
  const nav = useNavigation<SimulationScreenNavigation>();
  const route = useRoute<SetupRoute>();
  const { colors, spacing, typography } = useTheme();

  const tractorsQ = useTractors({ limit: 100, offset: 0 });
  const implementsQ = useImplements({ limit: 100, offset: 0 });
  const presetsQ = useOperatingConditions({ limit: 100, offset: 0 });
  const run = useRunSimulation();

  // "Re-run" from history/result seeds the wizard with a stored configuration.
  const prefillId = route.params?.prefillFromSimulationId;
  const prefillQ = useSimulation(prefillId ?? '');

  const {
    draft,
    set,
    setMode,
    setTillageClass,
    tillageClass,
    setConditionMode,
    applySuggestions,
    reset,
    equipmentErrors,
    conditionErrors,
    stepValid,
    buildRequest,
  } = useSimulationDraft({
    tractorId: route.params?.tractorId ?? '',
    implementId: route.params?.implementId ?? '',
  });

  /**
   * Rotor whose catalogue specs are already reflected in the draft, so choosing
   * a rotor fills the form once rather than on every render — otherwise a
   * per-run override would be overwritten as fast as it was typed.
   */
  const autofilledRotorIdRef = useRef<string | null>(null);

  const [prefillApplied, setPrefillApplied] = useState(false);
  useEffect(() => {
    if (!prefillId || prefillApplied || !prefillQ.data) return;
    const seed = draftSeedFromSimulation(prefillQ.data as any);
    reset(seed);
    // A re-run carries the overrides that were actually used, so mark its rotor
    // as already applied — refilling from the catalogue would silently discard
    // them and make the re-run differ from the run it copies.
    autofilledRotorIdRef.current = seed.rotorImplementId ?? null;
    setPrefillApplied(true);
  }, [prefillId, prefillApplied, prefillQ.data, reset]);

  const [step, setStep] = useState(0);
  const [furthest, setFurthest] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const [serverError, setServerError] = useState<ApiError | null>(null);

  const tractors = tractorsQ.data?.items ?? [];
  const implementList = implementsQ.data?.items ?? [];
  const presets = presetsQ.data?.items ?? [];

  const tractorOptions = useMemo<EquipmentOption[]>(
    () =>
      tractors.map((tractor) => ({
        id: tractor.id,
        title: tractor.name,
        subtitle: [tractor.manufacturer, tractor.model].filter(Boolean).join(' '),
        spec: tractorSpecLine(tractor.pto_power, tractor.wheelbase),
        readiness: checkTractorReadiness(tractor),
      })),
    [tractors],
  );

  const toOption = useCallback(
    (implement: (typeof implementList)[number]): EquipmentOption => {
      const stage = tillageStageOf(implement.implement_type);
      const subtitle = [
        implement.implement_type,
        implement.configuration ?? null,
        stage ? TILLAGE_STAGE_LABEL[stage] : null,
      ]
        .filter(Boolean)
        .join(' · ');
      return {
        id: implement.id,
        title: implement.name,
        subtitle,
        spec: implementSpecLine(implement.width, implement.weight),
        readiness: checkImplementReadiness(implement),
      };
    },
    [],
  );

  /**
   * Passive slots offer only passive tools and the rotor slot only powered
   * tools — the backend rejects the alternative outright, so an unusable option
   * should never be presented.
   */
  const passiveOptions = useMemo<EquipmentOption[]>(
    () => implementList.filter((i) => isPassiveImplement(i.implement_type)).map(toOption),
    [implementList, toOption],
  );

  const rotorOptions = useMemo<EquipmentOption[]>(
    () => implementList.filter((i) => isActiveImplement(i.implement_type)).map(toOption),
    [implementList, toOption],
  );

  const selectedTractor = tractors.find((t) => t.id === draft.tractorId);
  const selectedImplement = implementList.find((i) => i.id === draft.implementId);
  const selectedImplement2 = implementList.find((i) => i.id === draft.implement2Id);
  const selectedRotorImplement = implementList.find((i) => i.id === draft.rotorImplementId);
  const selectedPreset = presets.find((p) => p.id === draft.presetId);

  // A passive slot holding a powered tool (or vice versa) can only come from a
  // stale prefill or deep link; drop it rather than letting the run 422.
  useEffect(() => {
    if (selectedImplement && isActiveImplement(selectedImplement.implement_type)) {
      set('implementId', '');
    }
  }, [selectedImplement, set]);

  useEffect(() => {
    if (selectedImplement2 && isActiveImplement(selectedImplement2.implement_type)) {
      set('implement2Id', '');
    }
  }, [selectedImplement2, set]);

  useEffect(() => {
    if (selectedRotorImplement && isPassiveImplement(selectedRotorImplement.implement_type)) {
      set('rotorImplementId', '');
    }
  }, [selectedRotorImplement, set]);

  /**
   * Picking a saved rotor copies its stored specs into the form.
   *
   * The backend already resolves them from `implement_2_id`, so this changes no
   * result — it makes the numbers the run will use visible and editable instead
   * of leaving the fields blank, which read as "nothing was entered".
   */
  useEffect(() => {
    // Let a pending re-run prefill land first; it owns these values.
    if (prefillId && !prefillApplied) return;

    const rotorId = draft.rotorImplementId;
    if (!rotorId) {
      // Cleared: allow a re-selection of the same rotor to fill again. Values
      // already in the form stay put and become this run's inline specs.
      autofilledRotorIdRef.current = null;
      return;
    }
    if (autofilledRotorIdRef.current === rotorId) return;
    // The implement list may still be loading; fill on the render it arrives.
    if (!selectedRotorImplement) return;

    autofilledRotorIdRef.current = rotorId;
    const str = (value: number | null | undefined) =>
      value === null || value === undefined ? '' : String(value);

    set('rotorWeight', str(selectedRotorImplement.weight));
    set('rotorCgDistanceFromHitch', str(selectedRotorImplement.cg_distance_from_hitch));
    set('rotorMechanicalResistance', str(selectedRotorImplement.rotor_mechanical_resistance));
    set('rotorEfficiency', str(selectedRotorImplement.rotor_efficiency));
    set('rotorPtoPower', str(selectedRotorImplement.rotor_pto_power));
    set('rotorSpeed', str(selectedRotorImplement.rotor_speed));
    set('rotorDynamicVerticalForce', str(selectedRotorImplement.rotor_dynamic_vertical_force));
  }, [
    draft.rotorImplementId,
    selectedRotorImplement,
    prefillId,
    prefillApplied,
    set,
  ]);

  const goToStep = useCallback((index: number) => {
    setStep(index);
    setShowErrors(false);
    setFurthest((prev) => Math.max(prev, index));
  }, []);

  const handleNext = useCallback(() => {
    const valid = step === 0 ? stepValid.equipment : stepValid.conditions;
    if (!valid) {
      setShowErrors(true);
      return;
    }
    goToStep(step + 1);
  }, [step, stepValid, goToStep]);

  const handleRun = useCallback(() => {
    const payload = buildRequest();
    if (!payload) {
      setShowErrors(true);
      setStep(stepValid.equipment ? 1 : 0);
      return;
    }
    setServerError(null);
    run.mutate(payload, {
      onSuccess: (simulation) => {
        nav.navigate('SimulationResult', { id: simulation.id });
      },
      onError: (error) => {
        const apiError = toApiError(error);
        setServerError(apiError);
        // Route field-level failures back to the step that owns them.
        const fields = fieldErrorsOf(apiError);
        if (fields.length > 0) {
          const target = Math.min(...fields.map((f) => stepForBackendField(f.field)));
          setShowErrors(true);
          setStep(target);
        }
      },
    });
  }, [buildRequest, run, nav, stepValid.equipment]);

  const loading = tractorsQ.isLoading || implementsQ.isLoading;
  const loadError = tractorsQ.error ?? implementsQ.error;

  // An engine refusal is a conclusion, not a field problem — it takes the whole
  // screen so the explanation can actually be read.
  if (serverError?.kind === 'engine_diagnostic') {
    return (
      <EngineDiagnosticExplainer
        detail={serverError.detail}
        mode={draft.combinationType}
        onChangeSetup={() => {
          setServerError(null);
          goToStep(0);
        }}
        onSwitchToSingle={
          draft.combinationType === 'single'
            ? undefined
            : () => {
                setServerError(null);
                setMode('single');
                goToStep(0);
              }
        }
      />
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, padding: spacing.lg, gap: spacing.md }}>
        <SkeletonCard lines={2} />
        <SkeletonCard lines={3} />
        <SkeletonCard lines={2} />
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <ErrorState
          error={toApiError(loadError)}
          onRetry={() => {
            tractorsQ.refetch();
            implementsQ.refetch();
          }}
        />
      </View>
    );
  }

  if (tractors.length === 0 || implementList.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}>
        <EmptyState
          icon="truck"
          title={tractors.length === 0 ? 'No tractors yet' : 'No implements yet'}
          description="A simulation needs one tractor and at least one implement with its full specification."
          actionLabel={tractors.length === 0 ? 'Add a tractor' : 'Add an implement'}
          onAction={() =>
            nav.navigate(tractors.length === 0 ? 'TractorsTab' : 'ImplementsTab')
          }
        />
      </View>
    );
  }

  const errorsForStep = step === 0 ? equipmentErrors : conditionErrors;
  const showError = (field: keyof SimulationDraft) =>
    showErrors ? errorsForStep[field] : undefined;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <WizardProgressHeader
        steps={STEPS}
        current={step}
        furthestReached={furthest}
        onStepPress={goToStep}
      />

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.xl }}
        keyboardShouldPersistTaps="handled"
      >
        {serverError && step === 2 ? (
          <ErrorState
            error={serverError}
            fieldLabels={BACKEND_FIELD_LABELS}
            onRetry={handleRun}
            onSecondary={() => goToStep(0)}
            secondaryLabel="Change setup"
          />
        ) : null}

        {step === 0 ? (
          <>
            <View style={{ gap: spacing.md }}>
              <Text style={[typography.h5, { color: colors.textPrimary }]}>Implement type</Text>
              <TillageClassSelector value={tillageClass} onChange={setTillageClass} />
            </View>

            {tillageClass === 'combi' ? (
              <View style={{ gap: spacing.md }}>
                <Text style={[typography.h5, { color: colors.textPrimary }]}>Combination</Text>
                <ModeSelectorCard
                  value={draft.combinationType}
                  onChange={setMode}
                  modes={['passive_passive', 'active_passive']}
                />
              </View>
            ) : null}

            <View style={{ gap: spacing.md }}>
              <Text style={[typography.h5, { color: colors.textPrimary }]}>Equipment</Text>

              <EquipmentPicker
                label="Tractor"
                placeholder="Choose a tractor"
                options={tractorOptions}
                value={draft.tractorId}
                onChange={(id) => set('tractorId', id)}
                error={showError('tractorId')}
                emptyMessage="No tractors available"
                emptyActionLabel="Add a tractor"
                onEmptyAction={() => nav.navigate('TractorsTab')}
              />

              <EquipmentPicker
                label={
                  draft.combinationType === 'passive_passive'
                    ? 'Tool 1 (front)'
                    : draft.combinationType === 'active_passive'
                      ? 'Passive tool'
                      : 'Implement'
                }
                placeholder="Choose an implement"
                options={passiveOptions}
                value={draft.implementId}
                onChange={(id) => set('implementId', id)}
                error={showError('implementId')}
                excludeIds={draft.implement2Id ? [draft.implement2Id] : []}
                emptyMessage="No passive implements available"
                emptyActionLabel="Add an implement"
                onEmptyAction={() => nav.navigate('ImplementsTab')}
              />

              {draft.combinationType === 'passive_passive' ? (
                <>
                  <EquipmentPicker
                    label="Tool 2 (trailing)"
                    placeholder="Choose the second tool"
                    options={passiveOptions}
                    value={draft.implement2Id}
                    onChange={(id) => set('implement2Id', id)}
                    error={showError('implement2Id')}
                    excludeIds={draft.implementId ? [draft.implementId] : []}
                  />
                  <RangeStepper
                    label="Interaction coefficient"
                    
                    value={draft.interactionCoefficient}
                    onChange={(v) => set('interactionCoefficient', v)}
                    min={KI_RANGE.min}
                    max={KI_RANGE.max}
                    step={0.01}
                    decimals={2}
                    error={showError('interactionCoefficient')}
                    minHint="No overlap"
                    maxHint="Full overlap"
                    help="How much the trailing tool benefits from soil already loosened by the leading tool. 0 when they work separate bands; 0.25 when they fully overlap."
                  />
                </>
              ) : null}

              {draft.combinationType === 'active_passive' ? (
                <View style={{ gap: spacing.md }}>
                  <Text style={[typography.h5, { color: colors.textPrimary }]}>Active rotor</Text>

                  <EquipmentPicker
                    label="Powered implement"
                    placeholder="Choose a saved rotor, or enter specs below"
                    options={rotorOptions}
                    value={draft.rotorImplementId}
                    onChange={(id) => set('rotorImplementId', id)}
                    emptyMessage="No powered implements saved yet"
                    emptyActionLabel="Add a powered implement"
                    onEmptyAction={() => nav.navigate('ImplementsTab')}
                  />

                  <Text style={[typography.caption, { color: colors.textTertiary }]}>
                    {draft.rotorImplementId
                      ? 'Filled in from the selected implement. Editing a value changes it for this run only — the saved implement is untouched.'
                      : 'No saved rotor selected — enter the rotor specifications for this run.'}
                  </Text>

                  <RotorConfigForm
                    draft={draft}
                    errors={showErrors ? equipmentErrors : {}}
                    onChange={set}
                  />
                </View>
              ) : null}
            </View>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <SegmentedControl
              label="Where do conditions come from?"
              options={[
                { value: 'custom', label: 'Enter values' },
                { value: 'preset', label: 'Use a preset' },
              ]}
              value={draft.conditionMode}
              onChange={setConditionMode}
            />

            {draft.conditionMode === 'preset' ? (
              presetsQ.isLoading ? (
                <SkeletonCard lines={2} />
              ) : presets.length === 0 ? (
                <EmptyState
                  icon="sliders"
                  compact
                  title="No presets saved"
                  description="Switch to “Enter values” to type the conditions for this run."
                  actionLabel="Enter values instead"
                  onAction={() => setConditionMode('custom')}
                />
              ) : (
                <EquipmentPicker
                  label="Operating conditions preset"
                  placeholder="Choose a preset"
                  options={presets.map((preset) => ({
                    id: preset.id,
                    title: preset.name,
                    subtitle: `${preset.soil_texture} · ${preset.soil_hardness}`,
                    spec: [
                      preset.cone_index != null ? `${preset.cone_index} kPa` : null,
                      preset.depth != null ? `${preset.depth} cm` : null,
                      preset.speed != null ? `${preset.speed} km/h` : null,
                    ]
                      .filter(Boolean)
                      .join(' · '),
                    readiness: { ready: true, issues: [] },
                  }))}
                  value={draft.presetId}
                  onChange={(id) => set('presetId', id)}
                  error={showError('presetId')}
                />
              )
            ) : (
              <ConditionsForm
                draft={draft}
                errors={showErrors ? conditionErrors : {}}
                onChange={set}
                onApplySuggestions={applySuggestions}
              />
            )}
          </>
        ) : null}

        {step === 2 ? (
          <>
            <Input
              label="Simulation name"
              labelHint="Optional"
              placeholder="e.g. North field, deep pass"
              value={draft.name}
              onChangeText={(v) => set('name', v)}
            />
            <ReviewSummary
              draft={draft}
              tractorName={selectedTractor?.name}
              implementName={selectedImplement?.name}
              implement2Name={selectedImplement2?.name}
              rotorImplementName={selectedRotorImplement?.name}
              presetName={selectedPreset?.name}
              onEditStep={goToStep}
            />
          </>
        ) : null}

        <View style={{ gap: spacing.sm }}>
          {step < 2 ? (
            <ThemedButton onPress={handleNext} fullWidth>
              Continue
            </ThemedButton>
          ) : (
            <ThemedButton onPress={handleRun} loading={run.isPending} fullWidth>
              Run simulation
            </ThemedButton>
          )}
          {step > 0 ? (
            <ThemedButton variant="ghost" onPress={() => goToStep(step - 1)} fullWidth>
              Back
            </ThemedButton>
          ) : null}
        </View>
      </ScrollView>

      <RunProgressOverlay visible={run.isPending} mode={draft.combinationType} />
    </KeyboardAvoidingView>
  );
}
