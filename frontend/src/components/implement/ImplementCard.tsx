import React from 'react';
import {
  Pencil,
  Ruler,
  Trash2,
  UserRound,
  Weight,
  Wrench,
} from 'lucide-react-native';

import { ListEntityCard } from '../common/ListEntityCard';
import type { Implement } from '../../types/implement';
import { colors } from '../../theme';
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
  return (
    <ListEntityCard
      title={implement.name}
      subtitle={`${implement.manufacturer ? `${implement.manufacturer} - ` : ''}${implement.implement_type}`}
      badge={{
        icon: <UserRound size={14} color="#8B5CF6" />,
        label: 'Custom',
        textColor: '#8B5CF6',
        backgroundColor: '#8B5CF615',
      }}
      specs={[
        {
          icon: <Wrench size={16} color={colors.primary} />,
          text: implement.implement_type,
        },
        ...(implement.width != null
          ? [
              {
                icon: <Ruler size={16} color={colors.primary} />,
                text: `${fmtNum(implement.width, 2)} m`,
              },
            ]
          : []),
        ...(implement.weight != null
          ? [
              {
                icon: <Weight size={16} color={colors.primary} />,
                text: `${fmtNum(implement.weight, 2)} kg`,
              },
            ]
          : []),
      ]}
      actions={
        showActions
          ? [
              ...(onEdit
                ? [
                    {
                      label: 'Edit',
                      icon: <Pencil size={16} color={colors.primary} />,
                      onPress: onEdit,
                      variant: 'outline' as const,
                    },
                  ]
                : []),
              ...(onDelete
                ? [
                    {
                      label: 'Delete',
                      icon: <Trash2 size={16} color="#FF4D4F" />,
                      onPress: onDelete,
                      variant: 'danger' as const,
                    },
                  ]
                : []),
            ]
          : undefined
      }
      onPress={onPress}
      accessibilityLabel={`${implement.name} - ${implement.implement_type}`}
    />
  );
}
