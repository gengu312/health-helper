import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, useTheme, FAB, List, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBloodPressureStore } from '../store/bloodPressureStore';
import { format } from 'date-fns';
import BloodPressureChart from '@/components/charts/BloodPressureChart';

const HomeScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const recentRecords = useBloodPressureStore(state => state.getRecentRecords());
  const allRecords = useBloodPressureStore(state => state.records);
  const loadRecords = useBloodPressureStore(state => state.loadRecords);
  const isLoading = useBloodPressureStore(state => state.isLoading);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Trend Overview Card */}
        <Card style={styles.card}>
          <Card.Title title="血压趋势 (近7天)" subtitle="收缩压/舒张压" />
          <Card.Content>
            {isLoading ? (
              <View style={styles.chartPlaceholder}>
                <ActivityIndicator animating={true} color={theme.colors.primary} />
              </View>
            ) : allRecords.length > 0 ? (
              <BloodPressureChart data={allRecords} />
            ) : (
              <View style={styles.chartPlaceholder}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  暂无数据，请先记录
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Recent Records */}
        <Text variant="titleMedium" style={styles.sectionTitle}>最近记录</Text>
        <Card style={styles.card}>
          <Card.Content>
            {recentRecords.length === 0 ? (
              <Text variant="bodyMedium">暂无记录，请点击下方按钮添加</Text>
            ) : (
              recentRecords.map(record => (
                <List.Item
                  key={record.id}
                  title={`${record.systolic}/${record.diastolic} mmHg`}
                  description={`${format(record.timestamp, 'MM-dd HH:mm')} | 脉搏: ${record.pulse}`}
                  left={props => <List.Icon {...props} icon="heart-pulse" color={theme.colors.primary} />}
                />
              ))
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Quick Action FAB */}
      <FAB
        icon="plus"
        label="记录"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={() => navigation.navigate('Record')}
      />
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
  card: {
    marginBottom: 16,
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  sectionTitle: {
    marginBottom: 8,
    marginLeft: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default HomeScreen;