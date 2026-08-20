import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../../theme/ThemeProvider';
import { EmptyState } from '../common/EmptyState';
import { formatQuantity } from '../../theme/units';
import type { Readiness } from '../../utils/simulationReadiness';

export type EquipmentOption = {
  id: string;
  title: string;
  subtitle?: string;
  /** Short spec line, e.g. "45 kW · 2.3 m wheelbase". */
  spec?: string;
  readiness: Readiness;
};

type Props = {
  label: string;
  placeholder: string;
  options: EquipmentOption[];
  value: string;
  onChange: (id: string) => void;
  error?: string;
  /** Ids to grey out, e.g. the tool already chosen as tool 1. */
  excludeIds?: string[];
  emptyMessage?: string;
  onEmptyAction?: () => void;
  emptyActionLabel?: string;
};

/**
 * Selection control that surfaces simulation-readiness at pick time.
 *
 * Equipment missing fields the DSS engine requires is shown but not selectable, with
 * the reason stated — so the user never discovers the problem via a failed run.
 */
export function EquipmentPicker({
  label,
  placeholder,
  options,
  value,
  onChange,
  error,
  excludeIds = [],
  emptyMessage,
  onEmptyAction,
  emptyActionLabel,
}: Props) {
  const { colors, spacing, radius, typography } = useTheme();
  const [open, setOpen] = useState(false);

  const selected = useMemo(() => options.find((o) => o.id === value), [options, value]);
  const tone = error ? colors.status.critical : null;

  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={[typography.label, { color: colors.textPrimary }]}>{label}</Text>

      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={selected ? `${label}: ${selected.title}` : `${label}: ${placeholder}`}
        accessibilityHint="Opens the selection list"
        style={({ pressed }) => [
          styles.trigger,
          {
            backgroundColor: colors.surface,
            borderColor: tone ? tone.base : colors.border,
            borderRadius: radius.md,
            padding: spacing.md,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <View style={{ flex: 1, gap: 2 }}>
          {selected ? (
            <>
              <Text style={[typography.bodyLarge, { color: colors.textPrimary }]}>
                {selected.title}
              </Text>
              {selected.spec ? (
                <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>
                  {selected.spec}
                </Text>
              ) : null}
            </>
          ) : (
            <Text style={[typography.bodyLarge, { color: colors.textTertiary }]}>{placeholder}</Text>
          )}
        </View>
        <Feather name="chevron-down" size={20} color={colors.textSecondary} />
      </Pressable>

      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[typography.bodySmall, { color: colors.status.critical.text }]}
        >
          {error}
        </Text>
      ) : null}

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View style={[styles.backdrop, { backgroundColor: colors.scrim }]}>
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.bg,
                borderTopLeftRadius: radius.lg,
                borderTopRightRadius: radius.lg,
              },
            ]}
          >
            <View style={[styles.sheetHeader, { padding: spacing.lg, borderBottomColor: colors.border }]}>
              <Text style={[typography.h4, { color: colors.textPrimary }]}>{label}</Text>
              <Pressable
                onPress={() => setOpen(false)}
                accessibilityRole="button"
                accessibilityLabel="Close"
                hitSlop={12}
                style={styles.closeButton}
              >
                <Feather name="x" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}>
              {options.length === 0 ? (
                <EmptyState
                  icon="package"
                  title={emptyMessage ?? 'Nothing available'}
                  description="Add equipment before running a simulation."
                  actionLabel={emptyActionLabel}
                  onAction={
                    onEmptyAction
                      ? () => {
                          setOpen(false);
                          onEmptyAction();
                        }
                      : undefined
                  }
                />
              ) : (
                options.map((option) => {
                  const excluded = excludeIds.includes(option.id);
                  const blockers = option.readiness.issues.filter((i) => i.severity === 'blocker');
                  const selectable = option.readiness.ready && !excluded;
                  const isSelected = option.id === value;

                  return (
                    <Pressable
                      key={option.id}
                      disabled={!selectable}
                      onPress={() => {
                        onChange(option.id);
                        setOpen(false);
                      }}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected, disabled: !selectable }}
                      accessibilityLabel={
                        selectable
                          ? option.title
                          : `${option.title}, unavailable: ${
                              excluded ? 'already selected' : blockers[0]?.message ?? 'incomplete'
                            }`
                      }
                      style={({ pressed }) => [
                        styles.option,
                        {
                          backgroundColor: isSelected ? colors.primarySurface : colors.surface,
                          borderColor: isSelected ? colors.primary : colors.border,
                          borderRadius: radius.md,
                          padding: spacing.md,
                          opacity: selectable ? (pressed ? 0.9 : 1) : 0.55,
                        },
                      ]}
                    >
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text style={[typography.bodyLarge, { color: colors.textPrimary }]}>
                          {option.title}
                        </Text>
                        {option.subtitle ? (
                          <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                            {option.subtitle}
                          </Text>
                        ) : null}
                        {option.spec ? (
                          <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>
                            {option.spec}
                          </Text>
                        ) : null}

                        {excluded ? (
                          <Text style={[typography.bodySmall, { color: colors.status.info.text }]}>
                            Already selected as the other tool
                          </Text>
                        ) : blockers.length > 0 ? (
                          <View style={{ gap: 2, marginTop: 4 }}>
                            {blockers.slice(0, 2).map((issue, i) => (
                              <Text
                                key={i}
                                style={[typography.bodySmall, { color: colors.status.caution.text }]}
                              >
                                • {issue.message}
                              </Text>
                            ))}
                            {blockers.length > 2 ? (
                              <Text
                                style={[typography.bodySmall, { color: colors.status.caution.text }]}
                              >
                                • and {blockers.length - 2} more
                              </Text>
                            ) : null}
                          </View>
                        ) : null}
                      </View>

                      {isSelected ? (
                        <Feather name="check" size={20} color={colors.primary} />
                      ) : !selectable ? (
                        <Feather name="alert-circle" size={18} color={colors.status.caution.base} />
                      ) : null}
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/** Build a one-line spec summary for a tractor option. */
export function tractorSpecLine(ptoPower?: number | null, wheelbase?: number | null): string {
  return [
    ptoPower != null ? formatQuantity(ptoPower, 'power') : null,
    wheelbase != null ? `${formatQuantity(wheelbase, 'length')} wheelbase` : null,
  ]
    .filter(Boolean)
    .join(' · ');
}

/** Build a one-line spec summary for an implement option. */
export function implementSpecLine(width?: number | null, weight?: number | null): string {
  return [
    width != null ? `${formatQuantity(width, 'length')} wide` : null,
    weight != null ? formatQuantity(weight, 'mass') : null,
  ]
    .filter(Boolean)
    .join(' · ');
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    minHeight: 56,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '85%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  closeButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    minHeight: 56,
  },
});
