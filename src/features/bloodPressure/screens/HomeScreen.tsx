import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, FAB, List, ActivityIndicator, SegmentedButtons, Surface, Avatar, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBloodPressureStore } from '../store/bloodPressureStore';
import { useThemeStore } from '@/store/themeStore';
import { format, subDays, startOfDay, isAfter } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import BloodPressureChart from '@/components/charts/BloodPressureChart';

type Props = {
  navigation: {
    navigate: (screen: string) => void;
  };
};

const HomeScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const toggleTheme = useThemeStore(state => state.toggleTheme);
  const recentRecords = useBloodPressureStore(state => state.getRecentRecords());
  const allRecords = useBloodPressureStore(state => state.records);
  const loadRecords = useBloodPressureStore(state => state.loadRecords);
  const isLoading = useBloodPressureStore(state => state.isLoading);

  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const filteredRecords = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (viewMode) {
      case 'day':
        startDate = startOfDay(now);
        break;
      case 'week':
        startDate = subDays(now, 7);
        break;
      case 'month':
        startDate = subDays(now, 30);
        break;
      default:
        startDate = subDays(now, 7);
    }

    return allRecords.filter(record => isAfter(new Date(record.timestamp), startDate));
  }, [allRecords, viewMode]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.onBackground }}>
              健康助手
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
              {format(new Date(), 'MM月dd日 EEEE', { locale: zhCN })}
            </Text>
          </View>
          <IconButton 
            icon={theme.dark ? "weather-sunny" : "weather-night"} 
            onPress={toggleTheme}
            size={28}
            accessibilityLabel="切换深浅色模式"
          />
        </View>

        {/* Chart Section */}
        <Surface style={[styles.chartCard, { backgroundColor: theme.colors.surface, borderRadius: 24 }]} elevation={2}>
          <View style={styles.chartHeader}>
            <View>
              <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>血压趋势</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                {viewMode === 'day' ? '今日' : viewMode === 'week' ? '近7天' : '近30天'}
              </Text>
            </View>
            <SegmentedButtons
              value={viewMode}
              onValueChange={value => setViewMode(value as 'day' | 'week' | 'month')}
              buttons={[
                { value: 'day', label: '日' },
                { value: 'week', label: '周' },
                { value: 'month', label: '月' },
              ]}
              style={styles.segmentedButton}
              density="small"
            />
          </View>
          
          <View style={styles.chartContent}>
            {isLoading ? (
              <View style={styles.chartPlaceholder}>
                <ActivityIndicator animating={true} color={theme.colors.primary} />
              </View>
            ) : filteredRecords.length > 0 ? (
              <BloodPressureChart data={filteredRecords} viewMode={viewMode} />
            ) : (
              <View style={styles.chartPlaceholder}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  暂无数据，请先记录
                </Text>
              </View>
            )}
          </View>
        </Surface>

        {/* Recent Records Section */}
        <View style={styles.sectionHeader}>
          <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onBackground }}>最近记录</Text>
        </View>
        
        {recentRecords.length === 0 ? (
          <Surface style={[styles.emptyCard, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              暂无记录，请点击下方按钮添加
            </Text>
          </Surface>
        ) : (
          <View style={styles.listContainer}>
            {recentRecords.map((record, index) => (
              <Surface 
                key={record.id} 
                style={[
                  styles.recordCard, 
                  { 
                    backgroundColor: theme.colors.surface,
                    marginBottom: index === recentRecords.length - 1 ? 80 : 12 
                  }
                ]}
                elevation={1}
              >
                <List.Item
                  title={() => (
                    <View style={styles.recordTitle}>
                      <Text variant="titleLarge" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                        {record.systolic}/{record.diastolic}
                      </Text>
                      <Text variant="bodySmall" style={{ marginLeft: 4, marginTop: 6, color: theme.colors.outline }}>mmHg</Text>
                    </View>
                  )}
                  description={() => (
                    <View style={styles.recordMeta}>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {format(record.timestamp, 'MM-dd HH:mm')}
                      </Text>
                      <View style={styles.pulseContainer}>
                        <Avatar.Icon size={16} icon="heart-pulse" style={{ backgroundColor: 'transparent' }} color={theme.colors.error} />
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 2 }}>
                          {record.pulse}
                        </Text>
                      </View>
                    </View>
                  )}
                  left={() => (
                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.secondaryContainer }]}>
                      <Avatar.Icon size={24} icon="heart-outline" style={{ backgroundColor: 'transparent' }} color={theme.colors.onSecondaryContainer} />
                    </View>
                  )}
                />
              </Surface>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Quick Action FABs */}
      <View style={styles.fabContainer}>
        <FAB
          icon="chart-box-outline"
          style={[styles.fab, { backgroundColor: theme.colors.tertiaryContainer, marginBottom: 16 }]}
          color={theme.colors.onTertiaryContainer}
          onPress={() => navigation.navigate('Analysis')}
          size="small"
        />
        <FAB
          icon="alarm"
          style={[styles.fab, { backgroundColor: theme.colors.secondaryContainer, marginBottom: 16 }]}
          color={theme.colors.onSecondaryContainer}
          onPress={() => navigation.navigate('Reminder')}
          size="small"
        />
        <FAB
          icon="plus"
          label="记录"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          color={theme.colors.onPrimary}
          onPress={() => navigation.navigate('Record')}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  header: {
    marginBottom: 24,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartCard: {
    padding: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  segmentedButton: {
    minWidth: 160,
  },
  chartContent: {
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  emptyCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    gap: 12,
  },
  recordCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  recordTitle: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  recordMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 12,
  },
  pulseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  fabContainer: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    alignItems: 'flex-end',
  },
  fab: {
  },
});

export default HomeScreen;
