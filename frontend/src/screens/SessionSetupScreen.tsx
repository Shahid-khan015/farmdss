import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text, Switch } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { colors } from '../constants/colors';
import { useFarmers } from '../hooks/useFarmers';
import { useImplements } from '../hooks/useImplements';
import { useSessionActions } from '../hooks/useSession';
import { useTractors } from '../hooks/useTractors';
import type { SessionStartRequest } from '../services/SessionService';
import { borderRadius, spacing, typography } from '../theme';
import type { FarmerOptionResponse } from '../types/auth';
import type { Implement } from '../types/implement';
import type { Tractor } from '../types/tractor';

type OperationType =
  | 'Tillage'
  | 'Sowing'
  | 'Spraying'
  | 'Weeding'
  | 'Harvesting'
  | 'Threshing'
  | 'Grading';

const OPERATION_TYPES: OperationType[] = [
  'Tillage',
  'Sowing',
  'Spraying',
  'Weeding',
  'Harvesting',
  'Threshing',
  'Grading',
];

function sourcePillLabel(isLibrary: boolean): string {
  return isLibrary ? 'Library' : 'Custom';
}

export function SessionSetupScreen() {
  const nav = useNavigation<any>();

  const tractorsQ = useTractors({ limit: 100, offset: 0 });
  const implementsQ = useImplements({ limit: 100, offset: 0 });
  const farmersQ = useFarmers();
  const { startSession, isLoading: starting, error: actionError } = useSessionActions();

  const [tractorModalVisible, setTractorModalVisible] = useState(false);
  const [implementModalVisible, setImplementModalVisible] = useState(false);
  const [farmerModalVisible, setFarmerModalVisible] = useState(false);
  const [selectedTractorId, setSelectedTractorId] = useState<string>('');
  const [selectedImplementId, setSelectedImplementId] = useState<string>('');
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>('');
  const [operationType, setOperationType] = useState<OperationType | null>(null);
  const [gpsTrackingEnabled, setGpsTrackingEnabled] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  const tractors = tractorsQ.data?.items ?? [];
  const implementList = implementsQ.data?.items ?? [];
  const farmers = farmersQ.data ?? [];
  const selectedTractor = tractors.find((t) => t.id === selectedTractorId) ?? null;
  const selectedImplement = implementList.find((i) => i.id === selectedImplementId) ?? null;
  const selectedFarmer = farmers.find((farmer) => farmer.id === selectedFarmerId) ?? null;
  const validationErrors = useMemo(() => [] as string[], []);
  const selectedImplementWidthM = useMemo(() => {
    if (!selectedImplement) return null;
    const widthValue = (selectedImplement as any).working_width_m ?? (selectedImplement as any).width;
    const numericWidth = Number(widthValue);
    return Number.isFinite(numericWidth) ? numericWidth : null;
  }, [selectedImplement]);

  if (tractorsQ.isLoading || implementsQ.isLoading || farmersQ.isLoading) return <LoadingSpinner />;
  if (tractorsQ.error) return <ErrorMessage message={(tractorsQ.error as Error).message} />;
  if (implementsQ.error) return <ErrorMessage message={(implementsQ.error as Error).message} />;
  if (farmersQ.error) return <ErrorMessage message={(farmersQ.error as Error).message} />;

  const onSubmit = async () => {
    setShowValidation(true);
    setSubmitError(null);

    if (!selectedTractorId) return;
    if (!selectedFarmerId) return;
    if (!operationType) return;
    if (validationErrors.length > 0) return;

    const payload: SessionStartRequest = {
      tractor_id: selectedTractorId,
      operation_type: operationType,
      client_farmer_id: selectedFarmerId,
      gps_tracking_enabled: gpsTrackingEnabled,
      preset_values: [],
    };
    if (selectedImplementId) payload.implement_id = selectedImplementId;

    try {
      const response = await startSession(payload);
      nav.navigate('ActiveSession', { sessionId: response.id });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to start operation session');
    }
  };

  const widthText =
    selectedImplementWidthM != null
      ? `Session width: ${selectedImplementWidthM.toFixed(1)} m`
      : 'Width not set';

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable onPress={() => nav.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Start Operation</Text>
        </View>
      </View>

      <Card variant="default" spacing="default">
        <Text style={styles.fieldLabel}>Select Tractor</Text>
        <Pressable
          onPress={() => setTractorModalVisible(true)}
          style={[styles.selector, showValidation && !selectedTractorId && styles.selectorError]}
        >
          <Text style={[styles.selectorText, !selectedTractor && styles.selectorPlaceholder]}>
            {selectedTractor
              ? `${selectedTractor.name} • ${selectedTractor.model} • ${sourcePillLabel(selectedTractor.is_library)}`
              : 'Choose a tractor'}
          </Text>
          <Feather name="chevron-down" size={18} color={colors.muted} />
        </Pressable>
        {selectedTractor ? (
          <Text style={styles.helperText}>
            {selectedTractor.is_library ? 'Library tractor' : 'Custom tractor'}
          </Text>
        ) : null}
        {showValidation && !selectedTractorId ? (
          <Text style={styles.errorText}>Tractor is required</Text>
        ) : null}

        <Text style={[styles.fieldLabel, { marginTop: spacing.lg }]}>Select Farmer</Text>
        <Pressable
          onPress={() => setFarmerModalVisible(true)}
          style={[styles.selector, showValidation && !selectedFarmerId && styles.selectorError]}
        >
          <Text style={[styles.selectorText, !selectedFarmer && styles.selectorPlaceholder]}>
            {selectedFarmer
              ? `${selectedFarmer.name}${selectedFarmer.farm_name ? ` • ${selectedFarmer.farm_name}` : ''}`
              : 'Choose a farmer'}
          </Text>
          <Feather name="chevron-down" size={18} color={colors.muted} />
        </Pressable>
        {selectedFarmer ? (
          <>
            <Text style={styles.helperText}>
              {selectedFarmer.farm_location || 'Field location not set'}
            </Text>
            <Text style={styles.helperText}>Only this farmer will see live monitoring for the session.</Text>
          </>
        ) : null}
        {showValidation && !selectedFarmerId ? (
          <Text style={styles.errorText}>Farmer selection is required</Text>
        ) : null}

        <Text style={[styles.fieldLabel, { marginTop: spacing.lg }]}>Select Implement</Text>
        <Pressable onPress={() => setImplementModalVisible(true)} style={styles.selector}>
          <Text style={[styles.selectorText, !selectedImplement && styles.selectorPlaceholder]}>
            {selectedImplement
              ? `${selectedImplement.name} • ${selectedImplement.implement_type} • ${sourcePillLabel(selectedImplement.is_library)}`
              : 'Choose an implement'}
          </Text>
          <Feather name="chevron-down" size={18} color={colors.muted} />
        </Pressable>
        {selectedImplement ? (
          <>
            <Text style={styles.helperText}>
              {selectedImplement.is_library ? 'Library implement' : 'Custom implement'}
            </Text>
            <Text style={styles.helperText}>{widthText}</Text>
          </>
        ) : null}

        <Text style={[styles.fieldLabel, { marginTop: spacing.lg }]}>Operation Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {OPERATION_TYPES.map((type) => {
            const active = operationType === type;
            return (
              <Pressable
                key={type}
                onPress={() => setOperationType(type)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{type}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        {showValidation && !operationType ? (
          <Text style={styles.errorText}>Operation type is required</Text>
        ) : null}
      </Card>

      <Card variant="default" spacing="default">
        <View style={styles.toggleRow}>
          <View style={styles.toggleTextWrap}>
            <Text style={styles.fieldLabel}>GPS Tracking</Text>
            <Text style={styles.helperText}>Tracks field coverage using GPS module</Text>
          </View>
          <Switch value={gpsTrackingEnabled} onValueChange={setGpsTrackingEnabled} color={colors.primary} />
        </View>
      </Card>

      {validationErrors.length > 0 ? (
        <Card variant="outlined" style={styles.errorCard}>
          {validationErrors.map((e) => (
            <Text key={e} style={styles.errorText}>• {e}</Text>
          ))}
        </Card>
      ) : null}
      {submitError || actionError ? (
        <Card variant="outlined" style={styles.errorCard}>
          <Text style={styles.errorText}>{submitError ?? actionError}</Text>
        </Card>
      ) : null}

      <Button onPress={onSubmit} fullWidth size="lg" loading={starting} style={styles.startButton}>
        Start Operation
      </Button>

      <Modal
        visible={tractorModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTractorModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Tractor</Text>
              <Pressable onPress={() => setTractorModalVisible(false)}>
                <Text style={styles.modalClose}>Close</Text>
              </Pressable>
            </View>
            <ScrollView>
              {tractors.map((tractor: Tractor) => (
                <Pressable
                  key={tractor.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedTractorId(tractor.id);
                    setTractorModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemTitle}>{tractor.name}</Text>
                  <Text style={styles.modalItemSub}>{tractor.model}</Text>
                  <View style={[styles.sourceBadge, tractor.is_library ? styles.libraryBadge : styles.customBadge]}>
                    <Text
                      style={[
                        styles.sourceBadgeText,
                        tractor.is_library ? styles.libraryBadgeText : styles.customBadgeText,
                      ]}
                    >
                      {sourcePillLabel(tractor.is_library)}
                    </Text>
                  </View>
                  <Text style={styles.modalItemSub}>
                    Registration: {(tractor as any).registration_number ?? tractor.id.slice(0, 8)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={farmerModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFarmerModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Farmer</Text>
              <Pressable onPress={() => setFarmerModalVisible(false)}>
                <Text style={styles.modalClose}>Close</Text>
              </Pressable>
            </View>
            <ScrollView>
              {farmers.map((farmer: FarmerOptionResponse) => (
                <Pressable
                  key={farmer.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedFarmerId(farmer.id);
                    setFarmerModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemTitle}>{farmer.name}</Text>
                  <Text style={styles.modalItemSub}>{farmer.farm_name ?? 'Farm name not set'}</Text>
                  <Text style={styles.modalItemSub}>
                    {farmer.farm_location ?? 'Farm location not set'}
                  </Text>
                  <Text style={styles.modalItemSub}>{farmer.phone_number}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={implementModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setImplementModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Implement</Text>
              <Pressable onPress={() => setImplementModalVisible(false)}>
                <Text style={styles.modalClose}>Close</Text>
              </Pressable>
            </View>
            <ScrollView>
              <Pressable
                style={styles.modalItem}
                onPress={() => {
                  setSelectedImplementId('');
                  setImplementModalVisible(false);
                }}
              >
                <Text style={styles.modalItemTitle}>None</Text>
                <Text style={styles.modalItemSub}>No implement selected</Text>
              </Pressable>
              {implementList.map((imp: Implement) => {
                const widthValue = (imp as any).working_width_m ?? (imp as any).width;
                const widthNumber = Number(widthValue);
                return (
                  <Pressable
                    key={imp.id}
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedImplementId(imp.id);
                      setImplementModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalItemTitle}>{imp.name}</Text>
                    <Text style={styles.modalItemSub}>{imp.implement_type}</Text>
                    <View style={[styles.sourceBadge, imp.is_library ? styles.libraryBadge : styles.customBadge]}>
                      <Text
                        style={[
                          styles.sourceBadgeText,
                          imp.is_library ? styles.libraryBadgeText : styles.customBadgeText,
                        ]}
                      >
                        {sourcePillLabel(imp.is_library)}
                      </Text>
                    </View>
                    <Text style={styles.modalItemSub}>
                      {Number.isFinite(widthNumber)
                        ? `Working width: ${widthNumber.toFixed(1)} m`
                        : 'Width not set'}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.background,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  fieldLabel: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  selector: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorError: {
    borderColor: colors.danger,
    borderWidth: 2,
  },
  selectorText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  selectorPlaceholder: {
    color: colors.muted,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: `${colors.primary}15`,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.labelSmall,
    color: colors.text,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  helperText: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  toggleTextWrap: {
    flex: 1,
  },
  errorCard: {
    marginTop: -spacing.sm,
  },
  startButton: {
    backgroundColor: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    maxHeight: '80%',
    paddingBottom: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  modalTitle: {
    ...typography.h5,
    color: colors.text,
  },
  modalClose: {
    ...typography.label,
    color: colors.primary,
  },
  modalItem: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: spacing.xs,
  },
  modalItemTitle: {
    ...typography.label,
    color: colors.text,
  },
  modalItemSub: {
    ...typography.bodySmall,
    color: colors.muted,
  },
  sourceBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  libraryBadge: {
    backgroundColor: '#EEF2F7',
  },
  customBadge: {
    backgroundColor: '#E8F7EC',
  },
  sourceBadgeText: {
    ...typography.labelSmall,
    fontWeight: '700',
  },
  libraryBadgeText: {
    color: '#475569',
  },
  customBadgeText: {
    color: colors.primary,
  },
});
