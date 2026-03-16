import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import {
  Bolt,
  Package as PackageIcon,
  Pencil,
  Tractor as TractorIcon,
  Trash2,
  UserRound,
} from 'lucide-react-native';

import { Card } from '../common/Card';
import { spacing, typography, borderRadius, colors } from '../../theme';
import type { Tractor } from '../../types/tractor';
import { fmtNum } from '../../utils/formatters';

export function TractorCard({
  tractor,
  onPress,
  onEdit,
  onDelete,
  showActions = false,
}: {
  tractor: Tractor;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}) {
  const handleEditPress = (e: any) => {
    e.stopPropagation();
    onEdit?.();
  };

  const handleDeletePress = (e: any) => {
    e.stopPropagation();
    onDelete?.();
  };

  const totalWeight =
    tractor.front_axle_weight != null && tractor.rear_axle_weight != null
      ? Number(tractor.front_axle_weight) + Number(tractor.rear_axle_weight)
      : null;

  return (
    <Card
      variant="elevated"
      spacing="default"
      pressable
      onPress={onPress}
      style={styles.card}
      accessible
      accessibilityLabel={`${tractor.name} - ${tractor.manufacturer ?? ''} ${tractor.model}`}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.name}>{tractor.name}</Text>
            <Text style={styles.subtitle}>
              {tractor.manufacturer ? `${tractor.manufacturer} - ` : ''}
              {tractor.model}
            </Text>
          </View>

          <View style={styles.badge}>
            <UserRound size={14} color="#8B5CF6" />
            <Text style={styles.badgeText}>Custom</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          {tractor.pto_power != null && (
            <View style={styles.detail}>
              <Bolt size={16} color={colors.primary} />
              <Text style={styles.detailText}>{fmtNum(tractor.pto_power, 2)} kW</Text>
            </View>
          )}

          <View style={styles.detail}>
            <TractorIcon size={16} color={colors.primary} />
            <Text style={styles.detailText}>{tractor.drive_mode}</Text>
          </View>

          {totalWeight != null && (
            <View style={styles.detail}>
              <PackageIcon size={16} color={colors.primary} />
              <Text style={styles.detailText}>{fmtNum(totalWeight, 2)} kg</Text>
            </View>
          )}
        </View>

        {showActions && (onEdit || onDelete) && (
          <View style={styles.actionsContainer}>
            {onEdit && (
              <Pressable
                style={[styles.actionButton, styles.editButton]}
                onPress={handleEditPress}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Edit tractor"
              >
                <Pencil size={16} color={colors.primary} />
                <Text style={styles.editButtonText}>Edit</Text>
              </Pressable>
            )}

            {onDelete && (
              <Pressable
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDeletePress}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Delete tractor"
              >
                <Trash2 size={16} color="#FF4D4F" />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  container: {
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#8B5CF615',
  },
  badgeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4B5563',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  editButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  editButtonText: {
    ...typography.label,
    color: colors.primary,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FF4D4F',
  },
  deleteButtonText: {
    ...typography.label,
    color: '#FF4D4F',
    fontWeight: '600',
  },
});
