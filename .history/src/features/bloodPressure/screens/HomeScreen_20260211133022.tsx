import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, useTheme, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen = ({ navigation }: any) => {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Trend Overview Card */}
        <Card style={styles.card}>
          <Card.Title title="血压趋势 (近7天)" subtitle="收缩压/舒张压" />
          <Card.Content>
            <View style={styles.chartPlaceholder}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                图表区域 (待集成Victory Native XL)
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Recent Records */}
        <Text variant="titleMedium" style={styles.sectionTitle}>最近记录</Text>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="bodyMedium">暂无记录，请点击下方按钮添加</Text>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Quick Action FAB */}
      <FAB
        icon="plus"
        label="记录"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={() => console.log('Navigate to Record')}
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