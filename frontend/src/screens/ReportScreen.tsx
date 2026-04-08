import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import {
  AlertTriangle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Droplets,
  Filter,
  Map,
  Timer,
  Wallet,
} from 'lucide-react-native';

import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../constants/colors';
import { getReportSummary, type ReportSummary } from '../services/ReportService';
import { borderRadius, spacing, typography } from '../theme';

const OPERATIONS = [
  'All',
  'Tillage',
  'Sowing',
  'Spraying',
  'Weeding',
  'Harvesting',
  'Threshing',
  'Grading',
] as const;

const VIEW_MODES = ['Summary', 'Day-wise', 'Time-wise'] as const;

function ymd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function parseYmd(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day] = match;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function fmtDateTime(value: string): string {
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function fmtDate(value: string): string {
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function fmtTime(value: string): string {
  return new Date(value).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function fmtArea(area?: number | null): string {
  if (area == null) return '--';
  return `${area.toFixed(2)} ha`;
}

function fmtCurrency(amount?: number | null): string {
  if (amount == null) return '--';
  return `₹${amount.toFixed(2)}`;
}

function fmtDurationHours(hours?: number | null): string {
  if (hours == null) return '--';
  return `${hours.toFixed(1)}h`;
}

function monthLabel(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
}

function getCalendarDays(monthDate: Date): Array<Date | null> {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = first.getDay();
  const days: Array<Date | null> = [];

  for (let i = 0; i < startPad; i += 1) {
    days.push(null);
  }
  for (let day = 1; day <= last.getDate(); day += 1) {
    days.push(new Date(year, month, day));
  }
  while (days.length % 7 !== 0) {
    days.push(null);
  }
  return days;
}

function isSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

type SessionItem = ReportSummary['sessions'][number];

export function ReportScreen() {
  const nav = useNavigation<any>();
  const { user } = useAuth();
  const today = useMemo(() => new Date(), []);
  const thirtyDaysAgo = useMemo(() => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), []);

  const [generated, setGenerated] = useState(false);
  const [operation, setOperation] = useState<(typeof OPERATIONS)[number]>('All');
  const [startDate, setStartDate] = useState(ymd(thirtyDaysAgo));
  const [endDate, setEndDate] = useState(ymd(today));
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('18:00');
  const [viewMode, setViewMode] = useState<(typeof VIEW_MODES)[number]>('Summary');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [calendarField, setCalendarField] = useState<'start' | 'end' | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => parseYmd(startDate) ?? today);

  const sessionsByDate = useMemo(() => {
    const grouped: Record<string, SessionItem[]> = {};
    for (const session of report?.sessions ?? []) {
      const key = fmtDate(session.started_at);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(session);
    }
    return grouped;
  }, [report]);

  const sessionsByTime = useMemo(
    () => [...(report?.sessions ?? [])].sort(
      (a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime(),
    ),
    [report],
  );

  const summaryCards = useMemo(() => {
    if (!report) return [];
    return [
      {
        label: 'Sessions',
        value: String(report.total_sessions),
        icon: Timer,
        color: '#7C3AED',
      },
      {
        label: 'Area',
        value: fmtArea(report.total_area_ha),
        icon: Map,
        color: '#0F766E',
      },
      {
        label: 'Duration',
        value: fmtDurationHours(report.total_duration_hours),
        icon: Clock3,
        color: '#2563EB',
      },
      {
        label: 'Charges',
        value: fmtCurrency(report.total_wages_paid),
        icon: Wallet,
        color: colors.primary,
      },
    ];
  }, [report]);

  const selectedCalendarDate = useMemo(() => {
    if (calendarField === 'start') return parseYmd(startDate);
    if (calendarField === 'end') return parseYmd(endDate);
    return null;
  }, [calendarField, startDate, endDate]);

  const calendarDays = useMemo(() => getCalendarDays(calendarMonth), [calendarMonth]);

  const onGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReportSummary({
        start_date: startDate,
        start_time: startTime || undefined,
        end_date: endDate,
        end_time: endTime || undefined,
        operation_type: operation === 'All' ? undefined : operation,
      });
      setReport(data);
      setGenerated(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate report');
      setReport(null);
      setGenerated(false);
    } finally {
      setLoading(false);
    }
  };

  const openCalendar = (field: 'start' | 'end') => {
    setCalendarField(field);
    setCalendarMonth(parseYmd(field === 'start' ? startDate : endDate) ?? today);
  };

  const closeCalendar = () => {
    setCalendarField(null);
  };

  const selectCalendarDate = (date: Date) => {
    const value = ymd(date);
    if (calendarField === 'start') setStartDate(value);
    if (calendarField === 'end') setEndDate(value);
    closeCalendar();
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.screenTitle}>Reports</Text>

      <Card variant="elevated" spacing="default" style={styles.filterCard}>
        <View style={styles.dateGrid}>
          <View style={styles.inputCell}>
            <Text style={styles.label}>Start Date</Text>
            <Pressable style={styles.dateButton} onPress={() => openCalendar('start')}>
              <View style={styles.dateButtonContent}>
                <Calendar size={16} color={colors.primary} />
                <Text style={styles.dateButtonText}>
                  {parseYmd(startDate) ? formatDisplayDate(parseYmd(startDate) as Date) : 'Pick date'}
                </Text>
              </View>
            </Pressable>
          </View>
          <View style={styles.inputCell}>
            <Text style={styles.label}>End Date</Text>
            <Pressable style={styles.dateButton} onPress={() => openCalendar('end')}>
              <View style={styles.dateButtonContent}>
                <Calendar size={16} color={colors.primary} />
                <Text style={styles.dateButtonText}>
                  {parseYmd(endDate) ? formatDisplayDate(parseYmd(endDate) as Date) : 'Pick date'}
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        <View style={styles.dateGrid}>
          <View style={styles.inputCell}>
            <Text style={styles.label}>Start Time</Text>
            <Input value={startTime} onChangeText={setStartTime} placeholder="HH:MM" />
          </View>
          <View style={styles.inputCell}>
            <Text style={styles.label}>End Time</Text>
            <Input value={endTime} onChangeText={setEndTime} placeholder="HH:MM" />
          </View>
        </View>

        <View>
          <Text style={styles.label}>Operation</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.operationChips}>
            {OPERATIONS.map((op) => {
              const active = operation === op;
              return (
                <Pressable
                  key={op}
                  onPress={() => setOperation(op)}
                  style={[styles.operationChip, active && styles.operationChipActive]}
                >
                  <Text style={[styles.operationChipText, active && styles.operationChipTextActive]}>
                    {op}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <Button onPress={onGenerate} fullWidth style={styles.generateButton}>
          <View style={styles.generateContent}>
            <Filter size={16} color="#FFFFFF" />
            <Text style={styles.generateText}>Generate Report</Text>
          </View>
        </Button>
      </Card>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {generated && report ? (
        <View style={styles.results}>
          <View style={styles.summaryGrid}>
            {summaryCards.map((card) => (
              <View key={card.label} style={styles.summaryTile}>
                <View style={styles.summaryHeader}>
                  <card.icon size={14} color={card.color} />
                  <Text style={styles.summaryLabel}>{card.label}</Text>
                </View>
                <Text style={styles.summaryValue}>{card.value}</Text>
              </View>
            ))}
          </View>

          <Card variant="elevated" spacing="default" style={styles.infoCard}>
            <View style={styles.infoTitleRow}>
              <Droplets size={16} color="#C58A00" />
              <Text style={styles.label}>Fuel Summary</Text>
            </View>
            <Text style={styles.infoLine}>
              Total fuel: <Text style={styles.infoStrong}>{report.total_fuel_litres.toFixed(2)} L</Text>
              <Text style={styles.infoMuted}> · Total cost: </Text>
              <Text style={styles.infoStrong}>{fmtCurrency(report.total_fuel_cost)}</Text>
            </Text>
          </Card>

          <Card variant="elevated" spacing="default" style={styles.alertCard}>
            <View style={styles.alertStat}>
              <AlertTriangle size={16} color="#C55A11" />
              <Text style={styles.warningText}>{report.alert_counts.warning} warnings</Text>
            </View>
            <View style={styles.alertStat}>
              <AlertTriangle size={16} color="#C00000" />
              <Text style={styles.criticalText}>{report.alert_counts.critical} critical</Text>
            </View>
          </Card>

          <View style={styles.viewTabs}>
            {VIEW_MODES.map((mode) => {
              const active = mode === viewMode;
              return (
                <Pressable
                  key={mode}
                  onPress={() => setViewMode(mode)}
                  style={[styles.viewTab, active && styles.viewTabActive]}
                >
                  <Text style={[styles.viewTabText, active && styles.viewTabTextActive]}>{mode}</Text>
                </Pressable>
              );
            })}
          </View>

          {viewMode === 'Summary' ? (
            <View>
              <Text style={styles.label}>Sessions</Text>
              <View style={styles.sessionList}>
                {report.sessions.map((session) => (
                  <Pressable
                    key={session.id}
                    style={styles.sessionCard}
                    onPress={() => nav.navigate('SessionSummary', { sessionId: session.id })}
                  >
                    <Text style={styles.sessionMain}>{fmtDateTime(session.started_at)}</Text>
                    <Text style={styles.sessionOp}>{session.operation_type}</Text>
                    <Text style={styles.sessionMeta}>
                      {fmtArea(session.area_ha)} · {session.operator_name}
                    </Text>
                    <Text style={styles.sessionMeta}>
                      Charges: {fmtCurrency(session.wage_total)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          {viewMode === 'Day-wise' ? (
            <View style={styles.dayWiseList}>
              {Object.entries(sessionsByDate).map(([date, sessions]) => (
                <View key={date} style={styles.dayBlock}>
                  <View style={styles.dayHeader}>
                    <Text style={styles.dayTitle}>{date}</Text>
                    <View style={styles.dayBadge}>
                      <Text style={styles.dayBadgeText}>{sessions.length} sessions</Text>
                    </View>
                  </View>
                  <View style={styles.dayItems}>
                    {sessions.map((session) => (
                      <Pressable
                        key={session.id}
                        style={styles.dayItemCard}
                        onPress={() => nav.navigate('SessionSummary', { sessionId: session.id })}
                      >
                        <View style={styles.dayItemTop}>
                          <Text style={styles.dayItemType}>{session.operation_type}</Text>
                        </View>
                        <Text style={styles.dayItemMeta}>
                          {fmtArea(session.area_ha)} · {session.operator_name}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {viewMode === 'Time-wise' ? (
            <Card variant="elevated" spacing="compact" style={styles.timeTable}>
              <View style={styles.timeHeaderRow}>
                <Text style={[styles.timeHeaderText, styles.timeColTime]}>Time</Text>
                <Text style={[styles.timeHeaderText, styles.timeColOp]}>Operation</Text>
                <Text style={[styles.timeHeaderText, styles.timeColArea]}>Area</Text>
                <Text style={[styles.timeHeaderText, styles.timeColDuration]}>Charge</Text>
              </View>
              {sessionsByTime.map((session) => (
                <Pressable
                  key={session.id}
                  style={styles.timeRow}
                  onPress={() => nav.navigate('SessionSummary', { sessionId: session.id })}
                >
                  <Text style={[styles.timeCell, styles.timeColTime]}>{fmtTime(session.started_at)}</Text>
                  <Text style={[styles.timeCell, styles.timeColOp]} numberOfLines={1}>
                    {session.operation_type}
                  </Text>
                  <Text style={[styles.timeCell, styles.timeColArea]}>{fmtArea(session.area_ha)}</Text>
                  <Text style={[styles.timeCell, styles.timeColDuration]}>{fmtCurrency(session.wage_total)}</Text>
                </Pressable>
              ))}
            </Card>
          ) : null}

          <Button variant="outline" fullWidth onPress={() => {}}>
            <View style={styles.exportContent}>
              <Download size={16} color={colors.primary} />
              <Text style={styles.exportText}>Export Report</Text>
            </View>
          </Button>
        </View>
      ) : null}

      <Modal
        visible={calendarField !== null}
        transparent
        animationType="fade"
        onRequestClose={closeCalendar}
      >
        <Pressable style={styles.modalOverlay} onPress={closeCalendar}>
          <Pressable style={styles.calendarCard} onPress={() => {}}>
            <View style={styles.calendarHeader}>
              <Pressable
                style={styles.calendarNav}
                onPress={() =>
                  setCalendarMonth(
                    (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
                  )
                }
              >
                <ChevronLeft size={18} color={colors.text} />
              </Pressable>
              <Text style={styles.calendarTitle}>{monthLabel(calendarMonth)}</Text>
              <Pressable
                style={styles.calendarNav}
                onPress={() =>
                  setCalendarMonth(
                    (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
                  )
                }
              >
                <ChevronRight size={18} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.weekHeader}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <Text key={day} style={styles.weekDay}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarDays.map((date, index) => {
                const selected = isSameDay(date, selectedCalendarDate);
                return (
                  <Pressable
                    key={`${date ? ymd(date) : 'empty'}-${index}`}
                    style={[styles.dayCell, selected && styles.dayCellSelected]}
                    disabled={!date}
                    onPress={() => {
                      if (date) selectCalendarDate(date);
                    }}
                  >
                    <Text style={[styles.dayText, selected && styles.dayTextSelected]}>
                      {date ? date.getDate() : ''}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  noAccess: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
  },
  screenTitle: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '700',
  },
  filterCard: {
    gap: spacing.md,
    borderRadius: 18,
  },
  dateGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inputCell: {
    flex: 1,
  },
  dateButton: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#D6DCE5',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  dateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateButtonText: {
    ...typography.body,
    color: colors.text,
  },
  label: {
    ...typography.labelSmall,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  operationChips: {
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  operationChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: '#EEF1F5',
  },
  operationChipActive: {
    backgroundColor: colors.primary,
  },
  operationChipText: {
    ...typography.bodySmall,
    color: colors.muted,
    fontWeight: '600',
  },
  operationChipTextActive: {
    color: '#FFFFFF',
  },
  generateButton: {
    backgroundColor: colors.primary,
  },
  generateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  generateText: {
    ...typography.label,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  loader: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  error: {
    ...typography.bodySmall,
    color: colors.danger,
  },
  results: {
    gap: spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  summaryTile: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: spacing.md,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    ...typography.labelSmall,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  summaryValue: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '700',
  },
  infoCard: {
    borderRadius: 18,
  },
  infoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  infoLine: {
    ...typography.bodySmall,
    color: colors.text,
  },
  infoStrong: {
    fontWeight: '700',
    color: colors.text,
  },
  infoMuted: {
    color: colors.muted,
  },
  alertCard: {
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  alertStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  warningText: {
    ...typography.bodySmall,
    color: '#C55A11',
    fontWeight: '700',
  },
  criticalText: {
    ...typography.bodySmall,
    color: '#C00000',
    fontWeight: '700',
  },
  viewTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  viewTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  viewTabActive: {
    borderBottomColor: colors.primary,
  },
  viewTabText: {
    ...typography.bodySmall,
    color: colors.muted,
    fontWeight: '500',
  },
  viewTabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  sessionList: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: spacing.md,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sessionMain: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  sessionOp: {
    ...typography.bodySmall,
    color: colors.primary,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  sessionMeta: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  dayWiseList: {
    gap: spacing.md,
  },
  dayBlock: {
    gap: spacing.sm,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dayTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  dayBadge: {
    backgroundColor: '#EEF1F5',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  dayBadgeText: {
    ...typography.bodySmall,
    color: colors.muted,
  },
  dayItems: {
    gap: spacing.sm,
    paddingLeft: spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: '#E5E7EB',
  },
  dayItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: spacing.md,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  dayItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayItemType: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '700',
  },
  dayItemMeta: {
    ...typography.bodySmall,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  timeTable: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  timeHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#EEF1F5',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  timeHeaderText: {
    ...typography.labelSmall,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  timeRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  timeCell: {
    ...typography.bodySmall,
    color: colors.text,
  },
  timeColTime: {
    width: 64,
  },
  timeColOp: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  timeColArea: {
    width: 72,
  },
  timeColDuration: {
    width: 84,
  },
  exportContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  exportText: {
    ...typography.label,
    color: colors.primary,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: spacing.lg,
    gap: spacing.md,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calendarTitle: {
    ...typography.h5,
    color: colors.text,
    fontWeight: '700',
  },
  calendarNav: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF1F5',
  },
  weekHeader: {
    flexDirection: 'row',
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    ...typography.labelSmall,
    color: colors.muted,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.2857%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
  },
  dayText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  dayTextSelected: {
    color: '#FFFFFF',
  },
});
