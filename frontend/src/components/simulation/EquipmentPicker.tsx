import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../../theme/ThemeProvider';
import { EmptyState } from '../common/EmptyState';
import { formatQuantity } from '../../theme/units';
import type { Readiness } from '../../utils/simulationReadiness';
import { groupBadge, groupLabel, type EquipmentGroup } from '../../utils/equipmentLabels';

export type EquipmentOption = {
  id: string;
  title: string;
  subtitle?: string;
  /** Short spec line, e.g. "45 kW · 2.3 m wheelbase". */
  spec?: string;
  /** Which list this belongs to: the user's own equipment, or shared library
   *  data. Omitted for lists where the distinction does not apply (presets),
   *  which then render as a single unsectioned list with no badges. */
  group?: EquipmentGroup;
  /** Set only when the title alone does not identify the row within its group. */
  disambiguator?: string;
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
  const [query, setQuery] = useState('');

  const selected = useMemo(() => options.find((o) => o.id === value), [options, value]);
  const tone = error ? colors.status.critical : null;

  /** Sections, "My equipment" first. Empty sections are dropped so a
   *  library-only account never sees a stray header. */
  const sections = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const match = (o: EquipmentOption) =>
      !needle ||
      o.title.toLowerCase().includes(needle) ||
      (o.subtitle ?? '').toLowerCase().includes(needle);
    const visible = options.filter(match);
    if (!visible.some((o) => o.group)) return [{ group: undefined, items: visible }];
    return (['mine', 'library'] as EquipmentGroup[])
      .map((group) => ({ group: group as EquipmentGroup | undefined, items: visible.filter((o) => o.group === group) }))
      .filter((section) => section.items.length > 0);
  }, [options, query]);

  const badgeStyle = (group: EquipmentGroup) =>
    group === 'mine' ? colors.status.info : colors.status.neutral;

  const Badge = ({ group }: { group: EquipmentGroup }) => (
    <View
      style={[
        styles.badge,
        { backgroundColor: badgeStyle(group).surface, borderColor: badgeStyle(group).border },
      ]}
    >
      <Text style={[typography.caption, { color: badgeStyle(group).text }]}>{groupBadge(group)}</Text>
    </View>
  );

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
              <View style={styles.titleRow}>
                <Text style={[typography.bodyLarge, { color: colors.textPrimary }]} numberOfLines={1}>
                  {selected.title}
                </Text>
                {selected.group ? <Badge group={selected.group} /> : null}
              </View>
              {selected.disambiguator ? (
                <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                  {selected.disambiguator}
                </Text>
              ) : selected.spec ? (
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

            {options.length > 6 ? (
              <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search by name"
                  placeholderTextColor={colors.textTertiary}
                  accessibilityLabel={`Search ${label}`}
                  style={[
                    styles.search,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderRadius: radius.md,
                      color: colors.textPrimary,
                      paddingHorizontal: spacing.md,
                    },
                  ]}
                />
              </View>
            ) : null}

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
              ) : sections.length === 0 ? (
                <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>
                  Nothing matches “{query}”.
                </Text>
              ) : (
                sections.map((section) => (
                <View key={section.group ?? 'all'} style={{ gap: spacing.sm }}>
                  {section.group ? (
                    <Text
                      style={[
                        typography.caption,
                        { color: colors.textSecondary, marginTop: spacing.xs, letterSpacing: 0.6 },
                      ]}
                    >
                      {groupLabel(section.group).toUpperCase()}
                    </Text>
                  ) : null}
                {section.items.map((option) => {
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
                          ? [option.title, option.group ? groupBadge(option.group) : null, option.disambiguator]
                              .filter(Boolean)
                              .join(', ')
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
                        <View style={styles.titleRow}>
                          <Text
                            style={[typography.bodyLarge, { color: colors.textPrimary }]}
                            numberOfLines={1}
                          >
                            {option.title}
                          </Text>
                          {option.group ? <Badge group={option.group} /> : null}
                        </View>
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
                        {option.disambiguator && option.disambiguator !== option.spec &&
                        option.disambiguator !== option.subtitle ? (
                          <Text style={[typography.bodySmall, { color: colors.status.info.text }]}>
                            {option.disambiguator}
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
                })}
                </View>
                ))
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  search: {
    borderWidth: 1,
    minHeight: 44,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    minHeight: 56,
  },
});
