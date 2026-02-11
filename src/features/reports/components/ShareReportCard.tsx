import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text, useTheme, Divider } from 'react-native-paper';
import { BloodPressureRecord } from '@/types/models';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export type ShareReportStats = {
  avgSystolic: number;
  avgDiastolic: number;
  totalRecords: number;
  highBpCount: number;
};

type Props = {
  records: BloodPressureRecord[];
  stats: ShareReportStats | null;
};

const ShareReportCard = ({ records, stats }: Props) => {
  const theme = useTheme();

  const latestRecord = useMemo(() => {
    if (records.length === 0) return null;
    return [...records].sort((a, b) => b.timestamp - a.timestamp)[0];
  }, [records]);

  const recentRecords = useMemo(() => {
    return [...records].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
  }, [records]);

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.surface }]} elevation={2}>
      <View style={styles.header}>
        <View>
          <Text variant="titleLarge" style={{ fontWeight: '700', color: theme.colors.onSurface }}>
            血压健康报告
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {format(new Date(), 'yyyy年MM月dd日 EEEE HH:mm', { locale: zhCN })}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: theme.colors.primaryContainer }]}>
          <Text variant="labelMedium" style={{ color: theme.colors.onPrimaryContainer, fontWeight: '700' }}>
            健康助手
          </Text>
        </View>
      </View>

      <Divider />

      <View style={styles.summaryRow}>
        <View style={[styles.metricCard, { backgroundColor: theme.colors.secondaryContainer }]}>
          <Text variant="labelMedium" style={{ color: theme.colors.onSecondaryContainer }}>
            平均血压
          </Text>
          <Text variant="titleLarge" style={{ color: theme.colors.onSecondaryContainer, fontWeight: '800' }}>
            {stats ? `${stats.avgSystolic}/${stats.avgDiastolic}` : '--/--'}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSecondaryContainer }}>
            mmHg
          </Text>
        </View>

        <View style={[styles.metricCard, { backgroundColor: theme.colors.tertiaryContainer }]}>
          <Text variant="labelMedium" style={{ color: theme.colors.onTertiaryContainer }}>
            记录数
          </Text>
          <Text variant="titleLarge" style={{ color: theme.colors.onTertiaryContainer, fontWeight: '800' }}>
            {stats ? `${stats.totalRecords}` : '--'}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onTertiaryContainer }}>
            条
          </Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={[styles.metricCard, { backgroundColor: theme.colors.errorContainer }]}>
          <Text variant="labelMedium" style={{ color: theme.colors.onErrorContainer }}>
            高风险
          </Text>
          <Text variant="titleLarge" style={{ color: theme.colors.onErrorContainer, fontWeight: '800' }}>
            {stats ? `${stats.highBpCount}` : '--'}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onErrorContainer }}>
            条
          </Text>
        </View>

        <View style={[styles.metricCard, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            最近一次
          </Text>
          <Text variant="titleLarge" style={{ color: theme.colors.onSurface, fontWeight: '800' }}>
            {latestRecord ? `${latestRecord.systolic}/${latestRecord.diastolic}` : '--/--'}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {latestRecord ? `${format(latestRecord.timestamp, 'MM-dd HH:mm')}` : '-'}
          </Text>
        </View>
      </View>

      <View style={styles.table}>
        <Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: '700', marginBottom: 8 }}>
          最近 5 条记录
        </Text>
        <View style={[styles.tableHeader, { borderColor: theme.colors.outlineVariant }]}>
          <Text variant="labelSmall" style={[styles.cellTime, { color: theme.colors.onSurfaceVariant }]}>
            时间
          </Text>
          <Text variant="labelSmall" style={[styles.cellBp, { color: theme.colors.onSurfaceVariant }]}>
            血压
          </Text>
          <Text variant="labelSmall" style={[styles.cellPulse, { color: theme.colors.onSurfaceVariant }]}>
            脉搏
          </Text>
        </View>
        {recentRecords.map((r) => (
          <View key={r.id} style={[styles.tableRow, { borderColor: theme.colors.outlineVariant }]}>
            <Text variant="bodySmall" style={[styles.cellTime, { color: theme.colors.onSurfaceVariant }]}>
              {format(r.timestamp, 'MM-dd HH:mm')}
            </Text>
            <Text variant="bodySmall" style={[styles.cellBp, { color: theme.colors.onSurface }]}>
              {r.systolic}/{r.diastolic}
            </Text>
            <Text variant="bodySmall" style={[styles.cellPulse, { color: theme.colors.onSurfaceVariant }]}>
              {r.pulse}
            </Text>
          </View>
        ))}
      </View>

      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 12 }}>
        提示：分享内容仅供参考，如有不适请及时就医。
      </Text>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 360,
    borderRadius: 24,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  metricCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    minHeight: 84,
    justifyContent: 'space-between',
  },
  table: {
    marginTop: 14,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cellTime: {
    flex: 1.45,
  },
  cellBp: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
  },
  cellPulse: {
    flex: 0.6,
    textAlign: 'right',
  },
});

export default ShareReportCard;
