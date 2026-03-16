import React, { useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  Pressable,
} from 'react-native';
import { Button, FAB, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import {
  BookOpen,
  Bolt,
  Check,
  Copy,
  CircleAlert,
  Package as PackageIcon,
  Search,
  Tractor as TractorIcon,
  UserRound,
  X,
} from 'lucide-react-native';

import { Input } from '../components/common/Input';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Card } from '../components/common/Card';
import { TractorCard } from '../components/tractor/TractorCard';
import { useTractors, useDeleteTractor } from '../hooks/useTractors';
import type { Tractor } from '../types/tractor';
import { fmtNum } from '../utils/formatters';
import { colors } from '../constants/colors';

export function TractorListScreen() {
  const nav = useNavigation<any>();
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<'library' | 'custom'>('library');

  const params = useMemo(
    () => ({ q: q.trim() || undefined, limit: 50, offset: 0, sort: 'name' as const }),
    [q],
  );
  const { data, isLoading, error, refetch, isRefetching } = useTractors(params);
  const deleteTractor = useDeleteTractor();

  const items = data?.items ?? [];
  const libraryItems = items.filter((item) => item.is_library);
  const customItems = items.filter((item) => !item.is_library);
  const activeItems = tab === 'library' ? libraryItems : customItems;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tabBar}>
          <TabButton
            active={tab === 'library'}
            icon={<BookOpen size={20} color={tab === 'library' ? colors.primary : '#6B7280'} />}
            label="Library"
            count={libraryItems.length}
            onPress={() => setTab('library')}
          />
          <TabButton
            active={tab === 'custom'}
            icon={<UserRound size={20} color={tab === 'custom' ? colors.primary : '#6B7280'} />}
            label="My Tractors"
            count={customItems.length}
            onPress={() => setTab('custom')}
          />
        </View>

        <View style={styles.helperBar}>
          <CircleAlert size={14} color="#6B7280" />
          <Text style={styles.helperText}>
            {tab === 'library'
              ? 'Verified standard specifications from manufacturers'
              : 'Your custom tractors with exact specifications'}
          </Text>
        </View>

        <Input
          value={q}
          onChangeText={setQ}
          placeholder="Search tractors by name, manufacturer, or model"
          style={styles.searchInput}
          containerStyle={styles.searchContainer}
          icon={<Search size={18} color={q ? colors.primary : '#9CA3AF'} />}
          rightIcon={
            q ? (
              <Pressable onPress={() => setQ('')} hitSlop={10}>
                <X size={18} color="#6B7280" />
              </Pressable>
            ) : undefined
          }
        />
        <Text style={styles.searchHint}>Search is applied within the active tab.</Text>

        {isLoading ? <LoadingSpinner /> : null}
        {error ? <ErrorMessage message={(error as Error).message} /> : null}

        {activeItems.length ? (
          activeItems.map((tractor) =>
            tab === 'library' ? (
              <LibraryTractorCard
                key={tractor.id}
                tractor={tractor}
                onUse={() => nav.navigate('SimulationSetup', { tractorId: tractor.id })}
                onCopy={() => nav.navigate('TractorForm', { initial: tractor, source: 'library' })}
                onDetails={() => nav.navigate('TractorDetail', { id: tractor.id })}
              />
            ) : (
              <TractorCard
                key={tractor.id}
                tractor={tractor}
                onPress={() => nav.navigate('TractorDetail', { id: tractor.id })}
                onEdit={() => nav.navigate('TractorForm', { id: tractor.id })}
                onDelete={() => deleteTractor.mutate(tractor.id)}
                showActions
              />
            ),
          )
        ) : !isLoading && !error ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <UserRound size={44} color="#6B7280" />
            </View>
            <Text style={styles.emptyTitle}>
              {tab === 'custom' ? 'No Custom Tractors Yet' : 'No Library Tractors Found'}
            </Text>
            <Text style={styles.emptyDescription}>
              {tab === 'custom'
                ? 'Add your first custom tractor to get started'
                : 'Try a different search to browse the tractor library'}
            </Text>
            {tab === 'custom' ? (
              <Button
                mode="contained"
                style={styles.emptyButton}
                contentStyle={styles.emptyButtonContent}
                onPress={() => nav.navigate('TractorForm')}
              >
                + Add Custom Tractor
              </Button>
            ) : null}
          </View>
        ) : null}
      </ScrollView>

      {tab === 'custom' && (
        <FAB
          icon="plus"
          style={styles.fab}
          color="#FFFFFF"
          onPress={() => nav.navigate('TractorForm')}
        />
      )}
    </View>
  );
}

function TabButton({
  active,
  icon,
  label,
  count,
  onPress,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  count: number;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.tabButton, active && styles.tabButtonActive]}>
      <View style={styles.tabInner}>
        {icon}
        <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
        <View style={[styles.tabBadge, active ? styles.tabBadgeActive : styles.tabBadgeInactive]}>
          <Text style={[styles.tabBadgeText, active && styles.tabBadgeTextActive]}>{count}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function LibraryTractorCard({
  tractor,
  onUse,
  onCopy,
  onDetails,
}: {
  tractor: Tractor;
  onUse: () => void;
  onCopy: () => void;
  onDetails: () => void;
}) {
  const totalWeight =
    tractor.front_axle_weight != null && tractor.rear_axle_weight != null
      ? Number(tractor.front_axle_weight) + Number(tractor.rear_axle_weight)
      : null;

  return (
    <Card
      variant="elevated"
      spacing="default"
      pressable
      onPress={onDetails}
      style={styles.libraryCard}
      accessible
      accessibilityLabel={`${tractor.name} library tractor`}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderText}>
            <Text style={styles.cardTitle}>{tractor.name}</Text>
            <Text style={styles.cardSubtitle}>
              {tractor.manufacturer ? `${tractor.manufacturer} - ` : ''}
              {tractor.model}
            </Text>
          </View>
          <View style={styles.libraryBadge}>
            <BookOpen size={14} color={colors.primary} />
            <Text style={styles.libraryBadgeText}>Library</Text>
          </View>
        </View>

        <View style={styles.specRow}>
          {tractor.pto_power != null && (
            <View style={styles.specItem}>
              <Bolt size={16} color={colors.primary} />
              <Text style={styles.specText}>{fmtNum(tractor.pto_power, 2)} kW</Text>
            </View>
          )}
          <View style={styles.specItem}>
            <TractorIcon size={16} color={colors.primary} />
            <Text style={styles.specText}>{tractor.drive_mode}</Text>
          </View>
          {totalWeight != null && (
            <View style={styles.specItem}>
              <PackageIcon size={16} color={colors.primary} />
              <Text style={styles.specText}>{fmtNum(totalWeight, 2)} kg</Text>
            </View>
          )}
        </View>

        <View style={styles.libraryActions}>
          <Pressable style={[styles.actionButton, styles.primaryAction]} onPress={onUse}>
            <Check size={16} color="#FFFFFF" />
            <Text style={styles.primaryActionText}>Use in Simulation</Text>
          </Pressable>

          <Pressable style={[styles.actionButton, styles.secondaryAction]} onPress={onCopy}>
            <Copy size={16} color={colors.primary} />
            <Text style={styles.secondaryActionText}>Copy & Customize</Text>
          </Pressable>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 92,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: colors.primary,
  },
  tabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#111827',
    fontWeight: '600',
  },
  tabBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  tabBadgeActive: {
    backgroundColor: `${colors.primary}20`,
  },
  tabBadgeInactive: {
    backgroundColor: '#E5E7EB',
  },
  tabBadgeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  tabBadgeTextActive: {
    color: colors.primary,
  },
  helperBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  helperText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7280',
  },
  searchInput: {
    marginVertical: 0,
  },
  searchContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 6,
  },
  searchHint: {
    marginHorizontal: 16,
    marginBottom: 12,
    fontSize: 12,
    lineHeight: 16,
    color: '#6B7280',
  },
  libraryCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  cardContent: {
    gap: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: '#111827',
  },
  cardSubtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
  },
  libraryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: `${colors.primary}15`,
  },
  libraryBadgeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  specRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  specText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4B5563',
  },
  libraryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
  },
  primaryAction: {
    backgroundColor: colors.primary,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  secondaryAction: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  secondaryActionText: {
    color: colors.primary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  emptyIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  emptyDescription: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 16,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  emptyButtonContent: {
    minHeight: 48,
    paddingHorizontal: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    backgroundColor: colors.primary,
  },
});
