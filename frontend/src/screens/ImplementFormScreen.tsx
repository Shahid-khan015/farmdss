import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

import { colors } from '../constants/colors';
import { spacing, typography, borderRadius } from '../theme';
import type { ImplementType } from '../constants/enums';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { CollapsibleSection } from '../components/common/CollapsibleSection';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { useImplement, useUpsertImplement } from '../hooks/useImplements';
import { required, toNumber } from '../utils/validators';

export function ImplementFormScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const id = route.params?.id as string | undefined;
  const initial = route.params?.initial as any | undefined;
  const isCopyMode = !id && !!initial;

  const impQ = useImplement(id ?? '');
  const { create, update } = useUpsertImplement();
  const saving = create.isPending || update.isPending;

  const [name, setName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [implementType, setImplementType] = useState<ImplementType>('MB Plough');
  const [width, setWidth] = useState('');
  const [weight, setWeight] = useState('');
  const [cg, setCg] = useState('');
  const [vh, setVh] = useState('');
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [c, setC] = useState('');
const [touched, setTouched] = useState({
  name: false,
});

  useEffect(() => {
    const i = id ? impQ.data : initial;
    if (!i) return;

    setName(i.name ?? '');
    setManufacturer(i.manufacturer ?? '');
    setImplementType(i.implement_type);
    setWidth(i.width?.toString() ?? '');
    setWeight(i.weight?.toString() ?? '');
    setCg(i.cg_distance_from_hitch?.toString() ?? '');
    setVh(i.vertical_horizontal_ratio?.toString() ?? '');
    setA(i.asae_param_a?.toString() ?? '');
    setB(i.asae_param_b?.toString() ?? '');
    setC(i.asae_param_c?.toString() ?? '');
  }, [id, initial, impQ.data]);

  const errors = useMemo(() => {
    const e: Record<string, string | null> = {};
    e.name = required(name.trim(), 'Name');
    return e;
  }, [name]);

  const canSubmit = Object.values(errors).every((v) => !v) && !saving;

  const handleSave = async () => {
    const payload: any = {
      name: name.trim(),
      manufacturer: manufacturer.trim() || null,
      implement_type: implementType,
      is_library: false,
      width: toNumber(width),
      weight: toNumber(weight),
      cg_distance_from_hitch: toNumber(cg),
      vertical_horizontal_ratio: toNumber(vh),
      asae_param_a: toNumber(a),
      asae_param_b: toNumber(b),
      asae_param_c: toNumber(c),
    };

    if (!id) {
      const created = await create.mutateAsync(payload);
      nav.replace('ImplementDetail', { id: created.id });
    } else {
      await update.mutateAsync({ id, payload });
      nav.goBack();
    }
  };

  const canSave = Object.values(errors).every((v) => !v) && !saving;

  if (id && impQ.isLoading) return <LoadingSpinner />;
  if (id && impQ.error) return <ErrorMessage message={(impQ.error as Error).message} />;

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {id ? 'Edit Implement' : isCopyMode ? 'Customize Implement' : 'Add Implement'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {id
              ? 'Update implement specifications'
              : isCopyMode
                ? 'Modify this library implement and save it to My Implements'
                : 'Register a new implement'}
          </Text>
        </View>
        {(id || isCopyMode) && (
          <View style={styles.badgeWrapper}>
            <Text style={styles.badge}>{id ? 'Edit' : 'Copy'}</Text>
          </View>
        )}
      </View>

      {/* Basic Information Section */}
      <CollapsibleSection title="Basic Information" icon="info" defaultExpanded>
       <Input
  label="Implement Name"
  placeholder="e.g., Plough #1"
  value={name}
  onChangeText={setName}
  onBlur={() => setTouched(t => ({ ...t, name: true }))}
  error={touched.name && !!errors.name}
  helperText={touched.name ? errors.name : undefined}
  containerStyle={styles.field}
/>

        <Input
          label="Manufacturer"
          placeholder="e.g., Massey Ferguson"
          value={manufacturer}
          onChangeText={setManufacturer}
          containerStyle={styles.field}
        />

        {/* Implement Type Selector */}
        <Text style={styles.fieldLabel}>Implement Type</Text>
        <View style={styles.typeContainer}>
          {(['MB Plough', 'Disc Plough', 'Cultivator', 'Disc Harrow'] as const).map((type) => (
            <Pressable
              key={type}
              onPress={() => setImplementType(type as ImplementType)}
              style={[
                styles.typeButton,
                implementType === type && styles.typeButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  implementType === type && styles.typeButtonTextActive,
                ]}
              >
                {type}
              </Text>
            </Pressable>
          ))}
        </View>
      </CollapsibleSection>

      {/* Implement Properties Section */}
      <CollapsibleSection title="Implement Properties" icon="square" defaultExpanded={false}>
        <Input
          label="Width"
          placeholder="m"
          value={width}
          onChangeText={setWidth}
          keyboardType="decimal-pad"
          rightIcon={<Text style={styles.unit}>m</Text>}
          containerStyle={styles.field}
        />
        <Input
          label="Weight"
          placeholder="kg"
          value={weight}
          onChangeText={setWeight}
          keyboardType="decimal-pad"
          rightIcon={<Text style={styles.unit}>kg</Text>}
          containerStyle={styles.field}
        />
        <Input
          label="CG Distance from Hitch"
          placeholder="m"
          value={cg}
          onChangeText={setCg}
          keyboardType="decimal-pad"
          rightIcon={<Text style={styles.unit}>m</Text>}
          containerStyle={styles.field}
        />
        <Input
          label="Vertical/Horizontal Ratio"
          placeholder="ratio"
          value={vh}
          onChangeText={setVh}
          keyboardType="decimal-pad"
          containerStyle={styles.field}
        />
      </CollapsibleSection>

      {/* ASAE Parameters Section */}
      <CollapsibleSection title="ASAE Parameters" icon="settings" defaultExpanded={false}>
        <Input
          label="Parameter A"
          placeholder="value"
          value={a}
          onChangeText={setA}
          keyboardType="decimal-pad"
          containerStyle={styles.field}
        />
        <Input
          label="Parameter B"
          placeholder="value"
          value={b}
          onChangeText={setB}
          keyboardType="decimal-pad"
          containerStyle={styles.field}
        />
        <Input
          label="Parameter C"
          placeholder="value"
          value={c}
          onChangeText={setC}
          keyboardType="decimal-pad"
          containerStyle={styles.field}
        />
      </CollapsibleSection>

      {/* Error Messages */}
      {create.error && (
        <Card variant="outlined" style={styles.errorCard}>
          <ErrorMessage message={(create.error as Error).message} />
        </Card>
      )}
      {update.error && (
        <Card variant="outlined" style={styles.errorCard}>
          <ErrorMessage message={(update.error as Error).message} />
        </Card>
      )}

      {/* Action Buttons */}
      <View style={styles.footer}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canSave}
          loading={saving}
          onPress={handleSave}
        >
          {id ? 'Update Implement' : isCopyMode ? 'Save to My Implements' : 'Create Implement'}
        </Button>
        <Button
          variant="outline"
          size="lg"
          fullWidth
          style={styles.matchingOutlineButton}
          disabled={saving}
          onPress={() => nav.goBack()}
        >
          Cancel
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxl,
    gap: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  badgeWrapper: {
    backgroundColor: `${colors.primary}20`,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  badge: {
    ...typography.labelSmall,
    color: colors.primary,
  },
  field: {
    marginVertical: spacing.sm,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  typeContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',   // important
},

  typeButton: {
  width: '48%',              // fixed grid column
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.lg,
  borderRadius: borderRadius.md,
  borderWidth: 2,
  borderColor: '#E5E7EB',
  justifyContent: 'center',
  alignItems: 'center',
},

  typeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  typeButtonText: {
    ...typography.label,
    color: colors.muted,
  },
  typeButtonTextActive: {
    color: colors.primary,
  },
  unit: {
    ...typography.bodySmall,
    color: colors.muted,
  },
  errorCard: {
    marginTop: spacing.lg,
  },
  footer: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  matchingOutlineButton: {
    minHeight: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
});

