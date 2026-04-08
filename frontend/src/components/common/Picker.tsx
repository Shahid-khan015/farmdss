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
          <Feather
            name="chevron-down"
            size={20}
            color={error ? colors.danger : colors.text}
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setShowModal(false)}>
                <Text style={styles.modalActionText}>Cancel</Text>
              </Pressable>
              <Text style={styles.modalTitle}>{label || 'Select'}</Text>
              <Pressable>
                <Text style={{ opacity: 0 }}>Done</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.modalList}>
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
                    <Feather name="check" size={20} color={colors.primary} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
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
    minHeight: 44,
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
  chevron: {
    marginLeft: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    ...typography.h5,
    color: colors.text,
  },
  modalActionText: {
    ...typography.label,
    color: colors.primary,
  },
  modalList: {
    padding: spacing.lg,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalItemSelected: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: borderRadius.md,
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
