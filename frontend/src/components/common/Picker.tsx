import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  Modal,
  ScrollView,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { spacing, typography, borderRadius, colors } from '../../theme';
import { Feather } from '@expo/vector-icons';

interface PickerProps {
  label?: string;
  placeholder?: string;
  value: string | number | undefined;
  onValueChange: (value: string | number) => void;
  items: Array<{ label: string; value: string | number }>;
  error?: boolean;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  rightIcon?: React.ReactNode;
}

export function Picker({
  label,
  placeholder = 'Select an option',
  value,
  onValueChange,
  items,
  error = false,
  disabled = false,
  containerStyle,
  style,
  rightIcon,
}: PickerProps) {
  const [showModal, setShowModal] = useState(false);

  const selectedItem = items.find(item => item.value === value);
  const displayText = selectedItem?.label || placeholder;

  const handleSelect = (selectedValue: string | number) => {
    onValueChange(selectedValue);
    setShowModal(false);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable
        onPress={() => !disabled && setShowModal(true)}
        disabled={disabled}
      >
        <View
          style={[
            styles.pickerWrapper,
            error && styles.pickerWrapperError,
            disabled && styles.pickerWrapperDisabled,
            style,
          ]}
        >
          <Text
            style={[
              styles.pickerText,
              !selectedItem && styles.pickerPlaceholder,
            ]}
          >
            {displayText}
          </Text>
          {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
          <Feather
            name="chevron-down"
            size={18}
            color={error ? colors.danger : selectedItem ? colors.text : colors.muted}
            style={styles.chevron}
          />
        </View>
      </Pressable>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowModal(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setShowModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Text style={styles.modalTitle}>{label || 'Select'}</Text>
              <View style={{ width: 60 }} />
            </View>

            <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
              {items.map(item => (
                <Pressable
                  key={item.value}
                  onPress={() => handleSelect(item.value)}
                  style={[
                    styles.modalItem,
                    value === item.value && styles.modalItemSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      value === item.value && styles.modalItemTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {value === item.value && (
                    <Feather name="check" size={18} color={colors.primary} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  pickerWrapperError: {
    borderColor: colors.danger,
    borderWidth: 2,
  },
  pickerWrapperDisabled: {
    backgroundColor: '#F3F4F6',
    opacity: 0.5,
  },
  pickerText: {
    flex: 1,
    ...typography.body,
    color: colors.text,
  },
  pickerPlaceholder: {
    color: colors.muted,
  },
  rightIconContainer: {
    marginRight: spacing.sm,
  },
  chevron: {
    marginLeft: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    maxHeight: '70%',
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F3',
  },
  modalTitle: {
    ...typography.label,
    color: colors.text,
    fontWeight: '600',
  },
  modalCancelText: {
    ...typography.label,
    color: colors.primary,
    width: 60,
  },
  modalList: {
    padding: spacing.md,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  modalItemSelected: {
    backgroundColor: `${colors.primary}10`,
  },
  modalItemText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  modalItemTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
});
