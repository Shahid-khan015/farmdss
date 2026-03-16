import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import {
  Pencil,
  Ruler,
  Trash2,
  UserRound,
  Weight,
  Wrench,
} from 'lucide-react-native';

import { Card } from '../common/Card';
import type { Implement } from '../../types/implement';
import { borderRadius, spacing, typography, colors } from '../../theme';
import { fmtNum } from '../../utils/formatters';

export function ImplementCard({
  implement,
  onPress,
  onEdit,
  onDelete,
  showActions = false,
}: {
  implement: Implement;
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

  return (
    <Card
      variant="elevated"
      spacing="default"
      pressable
      onPress={onPress}
      style={styles.card}
      accessible
      accessibilityLabel={`${implement.name} - ${implement.implement_type}`}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.name}>{implement.name}</Text>
            <Text style={styles.subtitle}>
              {implement.manufacturer ? `${implement.manufacturer} - ` : ''}
              {implement.implement_type}
            </Text>
          </View>

          <View style={styles.badge}>
            <UserRound size={14} color="#8B5CF6" />
            <Text style={styles.badgeText}>Custom</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detail}>
            <Wrench size={16} color={colors.primary} />
            <Text style={styles.detailText}>{implement.implement_type}</Text>
          </View>

          {implement.width != null && (
            <View style={styles.detail}>
              <Ruler size={16} color={colors.primary} />
              <Text style={styles.detailText}>{fmtNum(implement.width, 2)} m</Text>
            </View>
          )}

          {implement.weight != null && (
            <View style={styles.detail}>
              <Weight size={16} color={colors.primary} />
              <Text style={styles.detailText}>{fmtNum(implement.weight, 2)} kg</Text>
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
                accessibilityLabel="Edit implement"
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
                accessibilityLabel="Delete implement"
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
