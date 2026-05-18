import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { ChevronDown, ChevronUp, Save, Settings2 } from 'lucide-react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { RoleGuard } from '../components/common/RoleGuard';
import { colors } from '../constants/colors';
import { useImplements } from '../hooks/useImplements';
import { implementService } from '../services/implementService';
import { borderRadius, spacing, typography } from '../theme';
import type { Implement } from '../types/implement';

type PresetForm = {
  preset_depth_cm: string;
  preset_speed_kmh: string;
  preset_gearbox_temp_max_c: string;
};

function toFieldValue(value?: number | null): string {
  return value == null ? '' : String(value);
}

function parseOptionalNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function getImplementBadgeLabel(implement: Implement): string {
  const raw = implement.implement_type;
  if (!raw) return 'Preset';
  return raw;
}

function getInitialForm(implement: Implement): PresetForm {
  return {
    preset_depth_cm: toFieldValue(implement.preset_depth_cm),
    preset_speed_kmh: toFieldValue(implement.preset_speed_kmh),
    preset_gearbox_temp_max_c: toFieldValue(implement.preset_gearbox_temp_max_c),
  };
}

export function ConfigurationScreen() {
  const queryClient = useQueryClient();
  const implementsQuery = useImplements({ limit: 100, offset: 0, sort: 'name' });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [forms, setForms] = useState<Record<string, PresetForm>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const customImplements = useMemo(
    () => (implementsQuery.data?.items ?? []).filter((item) => !item.is_library),
    [implementsQuery.data?.items],
  );

  const saveMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<Implement> }) =>
      implementService.update(id, payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['implements'] });
      await queryClient.invalidateQueries({ queryKey: ['implement', variables.id] });
      setSavingId(null);
      setSaveError(null);
    },
    onError: (error) => {
      setSavingId(null);
      setSaveError(error instanceof Error ? error.message : 'Failed to save preset configuration');
    },
  });

  const ensureForm = (implement: Implement) => {
    setForms((prev) => {
      if (prev[implement.id]) return prev;
      return {
        ...prev,
        [implement.id]: getInitialForm(implement),
      };
    });
  };

  const toggleExpand = (implement: Implement) => {
    ensureForm(implement);
    setExpandedId((current) => (current === implement.id ? null : implement.id));
    setSaveError(null);
  };

  const updateForm = (implementId: string, field: keyof PresetForm, value: string) => {
    setForms((prev) => ({
      ...prev,
      [implementId]: {
        ...(prev[implementId] ?? {
          preset_depth_cm: '',
          preset_speed_kmh: '',
          preset_gearbox_temp_max_c: '',
        }),
        [field]: value,
      },
    }));
  };

  const onSave = async (implement: Implement) => {
    const form = forms[implement.id] ?? getInitialForm(implement);
    const payload = {
      preset_depth_cm: parseOptionalNumber(form.preset_depth_cm),
      preset_speed_kmh: parseOptionalNumber(form.preset_speed_kmh),
      preset_gearbox_temp_max_c: parseOptionalNumber(form.preset_gearbox_temp_max_c),
    };
    setSavingId(implement.id);
    setSaveError(null);
    await saveMutation.mutateAsync({ id: implement.id, payload });
  };

  return (
    <RoleGuard allowedRoles={['owner']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.helperText}>
          Define target values for specific operation + implement combinations. These are shown during
          active sessions as deviation indicators.
        </Text>

        {implementsQuery.isLoading ? <LoadingSpinner /> : null}
        {implementsQuery.error ? (
          <Text style={styles.errorText}>{(implementsQuery.error as Error).message}</Text>
        ) : null}

        {customImplements.map((implement) => {
          const expanded = expandedId === implement.id;
          const form = forms[implement.id] ?? getInitialForm(implement);

          return (
            <Card key={implement.id} variant="elevated" spacing="default" style={styles.card}>
              <Pressable style={styles.cardHeader} onPress={() => toggleExpand(implement)}>
                <View style={styles.cardHeaderLeft}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{getImplementBadgeLabel(implement)}</Text>
                  </View>
                  <Text style={styles.implementName}>{implement.name}</Text>
                </View>
                {expanded ? (
                  <ChevronUp size={18} color={colors.muted} />
                ) : (
                  <ChevronDown size={18} color={colors.muted} />
                )}
              </Pressable>

              {expanded ? (
                <View style={styles.formSection}>
                  <View style={styles.fieldBlock}>
                    <Text style={styles.sectionLabel}>DEPTH (CM)</Text>
                    <Input
                      label="Target"
                      value={form.preset_depth_cm}
                      onChangeText={(value) => updateForm(implement.id, 'preset_depth_cm', value)}
                      keyboardType="decimal-pad"
                      placeholder="e.g. 18"
                    />
                  </View>

                  <View style={styles.fieldBlock}>
                    <Text style={styles.sectionLabel}>SPEED (KM/H)</Text>
                    <Input
                      label="Target"
                      value={form.preset_speed_kmh}
                      onChangeText={(value) => updateForm(implement.id, 'preset_speed_kmh', value)}
                      keyboardType="decimal-pad"
                      placeholder="e.g. 6"
                    />
                  </View>

                  <View style={styles.fieldBlock}>
                    <Text style={styles.sectionLabel}>GEARBOX TEMP THRESHOLD</Text>
                    <Input
                      label="Critical (°C)"
                      value={form.preset_gearbox_temp_max_c}
                      onChangeText={(value) =>
                        updateForm(implement.id, 'preset_gearbox_temp_max_c', value)
                      }
                      keyboardType="decimal-pad"
                      placeholder="e.g. 100"
                    />
                  </View>

                  <View style={styles.noteBox}>
                    <Settings2 size={16} color={colors.primary} />
                    <Text style={styles.noteText}>
                      These saved implement presets are auto-applied when an operator starts a session
                      with this implement.
                    </Text>
                  </View>

                  {saveError && savingId === implement.id ? (
                    <Text style={styles.errorText}>{saveError}</Text>
                  ) : null}

                  <Pressable
                    style={[styles.saveButton, savingId === implement.id && styles.saveButtonDisabled]}
                    onPress={() => onSave(implement)}
                    disabled={savingId === implement.id}
                  >
                    <Save size={16} color="#FFFFFF" />
                    <Text style={styles.saveButtonText}>
                      {savingId === implement.id ? 'Saving...' : 'Save Preset'}
                    </Text>
                  </Pressable>
                </View>
              ) : null}
            </Card>
          );
        })}

        {!implementsQuery.isLoading && !customImplements.length ? (
          <Card variant="elevated" spacing="default">
            <Text style={styles.emptyTitle}>No custom implements found</Text>
            <Text style={styles.emptyBody}>
              Create a custom implement first, then configure its preset deviation values here.
            </Text>
          </Card>
        ) : null}
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
  helperText: {
    ...typography.body,
    color: colors.muted,
    lineHeight: 22,
  },
  card: {
    borderRadius: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  badge: {
    backgroundColor: '#F9E3B1',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    ...typography.labelSmall,
    color: '#A16207',
    fontWeight: '700',
  },
  implementName: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '400',
    flex: 1,
  },
  formSection: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  fieldBlock: {
    gap: spacing.xs,
  },
  sectionLabel: {
    ...typography.label,
    color: '#64748B',
    letterSpacing: 0.8,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  noteText: {
    ...typography.bodySmall,
    color: colors.muted,
    flex: 1,
    lineHeight: 18,
  },
  saveButton: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    ...typography.label,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.danger,
  },
  emptyTitle: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '700',
  },
  emptyBody: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: spacing.xs,
  },
});
