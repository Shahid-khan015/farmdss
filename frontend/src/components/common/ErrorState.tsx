import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';

import { ThemedButton } from './ThemedButton';
import { useTheme } from '../../theme/ThemeProvider';
import {
  describeRange,
  fieldErrorsOf,
  isRecoverable,
  type ApiError,
} from '../../services/apiError';

type Props = {
  error: ApiError;
  /** Shown when the error is retryable (network/timeout/server). */
  onRetry?: () => void;
  /** Secondary escape hatch, e.g. "Back to setup". */
  onSecondary?: () => void;
  secondaryLabel?: string;
  /** Human field labels keyed by backend field name, for validation errors. */
  fieldLabels?: Record<string, string>;
};

const ICON_FOR_KIND: Record<ApiError['kind'], keyof typeof Feather.glyphMap> = {
  field_validation: 'alert-circle',
  request_validation: 'alert-circle',
  engine_diagnostic: 'activity',
  not_found: 'search',
  auth: 'lock',
  forbidden: 'lock',
  conflict: 'copy',
  server: 'server',
  timeout: 'clock',
  network: 'wifi-off',
  unknown: 'alert-triangle',
};

const TITLE_FOR_KIND: Record<ApiError['kind'], string> = {
  field_validation: 'Check these inputs',
  request_validation: 'Check these inputs',
  engine_diagnostic: 'The engine could not solve this',
  not_found: 'Not found',
  auth: 'Session expired',
  forbidden: 'Not allowed',
  conflict: 'Already exists',
  server: 'Server error',
  timeout: 'Request timed out',
  network: 'No connection',
  unknown: 'Something went wrong',
};

/**
 * Full-region error presentation.
 *
 * Deliberately renders validation errors as a checklist and engine diagnostics as
 * prose: the DSS engine's failure messages are explanatory paragraphs meant to be
 * read, not toast fodder.
 */
export function ErrorState({ error, onRetry, onSecondary, secondaryLabel, fieldLabels }: Props) {
  const { colors, spacing, radius, typography } = useTheme();
  const tone =
    error.kind === 'field_validation' || error.kind === 'request_validation'
      ? colors.status.caution
      : colors.status.critical;
  const fields = fieldErrorsOf(error);
  const canRetry = isRecoverable(error) && !!onRetry;

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { padding: spacing.xl, gap: spacing.lg }]}
      keyboardShouldPersistTaps="handled"
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: tone.surface, borderColor: tone.border, borderRadius: radius.full },
        ]}
      >
        <Feather name={ICON_FOR_KIND[error.kind]} size={26} color={tone.base} />
      </View>

      <View style={{ gap: spacing.xs, alignItems: 'center' }}>
        <Text
          accessibilityRole="header"
          style={[typography.h3, { color: colors.textPrimary, textAlign: 'center' }]}
        >
          {TITLE_FOR_KIND[error.kind]}
        </Text>

        {fields.length === 0 ? (
          <Text
            style={[
              error.kind === 'engine_diagnostic' ? typography.body : typography.bodyLarge,
              { color: colors.textSecondary, textAlign: error.kind === 'engine_diagnostic' ? 'left' : 'center' },
            ]}
          >
            {error.message}
          </Text>
        ) : null}
      </View>

      {fields.length > 0 ? (
        <View style={{ gap: spacing.sm, width: '100%' }}>
          {fields.map((fieldError, index) => {
            const label = fieldLabels?.[fieldError.field] ?? humanizeField(fieldError.field);
            const range = describeRange(fieldError);
            return (
              <View
                key={`${fieldError.field}-${index}`}
                style={[
                  styles.fieldRow,
                  {
                    backgroundColor: tone.surface,
                    borderColor: tone.border,
                    borderRadius: radius.md,
                    padding: spacing.md,
                    gap: spacing.xs,
                  },
                ]}
              >
                <Text style={[typography.label, { color: tone.text }]}>{label}</Text>
                <Text style={[typography.body, { color: colors.textSecondary }]}>
                  {fieldError.message}
                </Text>
                {range ? (
                  <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>
                    Accepted range: {range}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </View>
      ) : null}

      <View style={{ gap: spacing.sm, width: '100%' }}>
        {canRetry ? (
          <ThemedButton onPress={onRetry!} fullWidth>
            Try again
          </ThemedButton>
        ) : null}
        {onSecondary ? (
          <ThemedButton variant="outline" onPress={onSecondary} fullWidth>
            {secondaryLabel ?? 'Go back'}
          </ThemedButton>
        ) : null}
      </View>
    </ScrollView>
  );
}

/** `cone_index` -> `Cone index`. Fallback only; prefer an explicit label map. */
function humanizeField(field: string): string {
  if (field === '__request__') return 'Request';
  const spaced = field.replace(/_/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  fieldRow: {
    borderWidth: 1,
  },
});
