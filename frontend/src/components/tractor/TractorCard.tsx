import React from 'react';
import {
  Bolt,
  Package as PackageIcon,
  Pencil,
  Tractor as TractorIcon,
  Trash2,
  UserRound,
} from 'lucide-react-native';

import { ListEntityCard } from '../common/ListEntityCard';
import type { Tractor } from '../../types/tractor';
import { colors } from '../../theme';
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
  const totalWeight =
    tractor.front_axle_weight != null && tractor.rear_axle_weight != null
      ? Number(tractor.front_axle_weight) + Number(tractor.rear_axle_weight)
      : null;

  return (
    <ListEntityCard
      title={tractor.name}
      subtitle={`${tractor.manufacturer ? `${tractor.manufacturer} - ` : ''}${tractor.model}`}
      badge={{
        icon: <UserRound size={14} color="#8B5CF6" />,
        label: 'Custom',
        textColor: '#8B5CF6',
        backgroundColor: '#8B5CF615',
      }}
      specs={[
        {
          icon: <TractorIcon size={16} color={colors.primary} />,
          text: tractor.drive_mode,
        },
        ...(tractor.pto_power != null
          ? [
              {
                icon: <Bolt size={16} color={colors.primary} />,
                text: `${fmtNum(tractor.pto_power, 2)} kW`,
              },
            ]
          : []),
        ...(totalWeight != null
          ? [
              {
                icon: <PackageIcon size={16} color={colors.primary} />,
                text: `${fmtNum(totalWeight, 2)} kg`,
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
      accessibilityLabel={`${tractor.name} - ${tractor.manufacturer ?? ''} ${tractor.model}`}
    />
  );
}
