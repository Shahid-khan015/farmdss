import React, { useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { RoleGuard } from '../components/common/RoleGuard';
import { colors } from '../constants/colors';
import {
  createOperationCharge,
  getOperationCharges,
  updateOperationCharge,
  type OperationChargeRead,
} from '../services/SessionService';
import { borderRadius, spacing, typography } from '../theme';

const OPERATION_TYPES = [
  'Tillage',
  'Sowing',
  'Spraying',
  'Weeding',
  'Harvesting',
  'Threshing',
  'Grading',
] as const;

export function OperationChargesScreen() {
  const queryClient = useQueryClient();
  const [editingCharge, setEditingCharge] = useState<OperationChargeRead | null>(null);
  const [editingType, setEditingType] = useState<(typeof OPERATION_TYPES)[number] | null>(null);
  const [chargeValue, setChargeValue] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const chargesQuery = useQuery({
    queryKey: ['operation-charges'],
    queryFn: getOperationCharges,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const parsed = Number(chargeValue);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error('Enter a valid charge per hectare.');
      }
      if (!editingType) {
        throw new Error('Select an operation type first.');
      }
      if (editingCharge) {
        return updateOperationCharge(editingCharge.id, { charge_per_ha: parsed });
      }
      return createOperationCharge({ operation_type: editingType, charge_per_ha: parsed });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['operation-charges'] });
      setEditingCharge(null);
      setEditingType(null);
      setChargeValue('');
      setFormError(null);
    },
    onError: (error) => {
      setFormError(error instanceof Error ? error.message : 'Failed to save operation charge');
    },
  });

  const chargesMap = useMemo(() => {
    const map = new Map<string, OperationChargeRead>();
    for (const charge of chargesQuery.data ?? []) {
      map.set(charge.operation_type, charge);
    }
    return map;
  }, [chargesQuery.data]);

  const openEditor = (operationType: (typeof OPERATION_TYPES)[number]) => {
    const existing = chargesMap.get(operationType) ?? null;
    setEditingCharge(existing);
    setEditingType(operationType);
    setChargeValue(existing ? String(existing.charge_per_ha) : '');
    setFormError(null);
  };

  const closeEditor = () => {
    setEditingCharge(null);
    setEditingType(null);
    setChargeValue('');
    setFormError(null);
  };

  return (
    <RoleGuard allowedRoles={['owner']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Operation Charges</Text>
        <Text style={styles.subtitle}>
          Set the rate charged to farmers per hectare for each operation type.
        </Text>

        {chargesQuery.isLoading ? <LoadingSpinner /> : null}
        {chargesQuery.error ? (
          <Text style={styles.errorText}>
            {(chargesQuery.error as Error).message}
          </Text>
        ) : null}

        <View style={styles.list}>
          {OPERATION_TYPES.map((operationType) => {
            const charge = chargesMap.get(operationType);
            return (
              <Card key={operationType} variant="elevated" spacing="default">
                <View style={styles.row}>
                  <View style={styles.rowText}>
                    <Text style={styles.operationName}>{operationType}</Text>
                    <Text style={styles.operationCharge}>
                      {charge ? `Rs ${charge.charge_per_ha}/ha` : 'Not set'}
                    </Text>
                  </View>
                  <Button
                    variant="outline"
                    size="sm"
                    style={styles.matchingOutlineButton}
                    onPress={() => openEditor(operationType)}
                  >
                    Edit
                  </Button>
                </View>
              </Card>
            );
          })}
        </View>

        <Modal visible={Boolean(editingType)} transparent animationType="slide" onRequestClose={closeEditor}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>{editingType}</Text>
              <Text style={styles.modalSubtitle}>Charge per hectare (Rs):</Text>
              <Input
                value={chargeValue}
                onChangeText={setChargeValue}
                keyboardType="decimal-pad"
                placeholder="Enter amount"
              />
              {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
              <View style={styles.modalActions}>
                <View style={styles.modalActionSlot}>
                  <Button
                    variant="outline"
                    style={styles.matchingOutlineButton}
                    onPress={closeEditor}
                    disabled={saveMutation.isPending}
                  >
                    Cancel
                  </Button>
                </View>
                <View style={styles.modalActionSlot}>
                  <Button
                    variant="primary"
                    style={styles.matchingPrimaryButton}
                    onPress={() => saveMutation.mutate()}
                    loading={saveMutation.isPending}
                  >
                    Save
                  </Button>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </RoleGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.body,
    color: colors.muted,
  },
  list: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  rowText: {
    flex: 1,
  },
  operationName: {
    ...typography.h5,
    color: colors.text,
  },
  operationCharge: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  matchingOutlineButton: {
    width: '100%',
    minHeight: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  matchingPrimaryButton: {
    width: '100%',
    minHeight: 48,
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
    padding: spacing.lg,
    gap: spacing.sm,
  },
  modalTitle: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '700',
  },
  modalSubtitle: {
    ...typography.bodySmall,
    color: colors.muted,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  modalActionSlot: {
    flex: 1,
    minWidth: 0,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.danger,
  },
});
