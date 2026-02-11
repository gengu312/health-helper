import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, useTheme, List, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBloodPressureStore } from '@/features/bloodPressure/store/bloodPressureStore';
import { ExportService } from '@/services/export/ExportService';
import BloodPressureChart from '@/components/charts/BloodPressureChart';

const AnalysisScreen = () => {
  const theme = useTheme();
  const records = useBloodPressureStore(state => state.records);

  const calculateStats = () => {
    if (records.length === 0) return null;
    
    const systolicSum = records.reduce((acc, r) => acc + r.systolic, 0);
    const diastolicSum = records.reduce((acc, r) => acc + r.diastolic, 0);
    
    return {
      avgSystolic: Math.round(systolicSum / records.length),
      avgDiastolic: Math.round(diastolicSum / records.length),
      totalRecords: records.length,
      highBpCount: records.filter(r => r.systolic >= 140 || r.diastolic >= 90).length
    };
  };

  const stats = calculateStats();

  const handleExport = async () => {
    try {
      await ExportService.generateAndSharePDF(records);
    } catch (error) {
      Alert.alert('导出失败', '无法生成或分享报告，请稍后重试。');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>健康分析报告</Text>
        
        {/* Chart Section */}
        <Card style={styles.card}>
          <Card.Title title="近期趋势" />
          <Card.Content>
            {records.length > 0 ? (
              <BloodPressureChart data={records} />
            ) : (
              <Text>暂无数据</Text>
            )}
          </Card.Content>
        </Card>

        {/* Stats Section */}
        {stats && (
          <Card style={styles.card}>
            <Card.Title title="统计概览" />
            <Card.Content>
              <List.Item
                title="平均血压"
                description={`${stats.avgSystolic} / ${stats.avgDiastolic} mmHg`}
                left={props => <List.Icon {...props} icon="chart-timeline-variant" />}
              />
              <Divider />
              <List.Item
                title="总记录数"
                description={`${stats.totalRecords} 条`}
                left={props => <List.Icon {...props} icon="file-document-outline" />}
              />
              <Divider />
              <List.Item
                title="高血压风险记录"
                description={`${stats.highBpCount} 条 (收缩压≥140 或 舒张压≥90)`}
                left={props => <List.Icon {...props} icon="alert-circle-outline" color={theme.colors.error} />}
              />
            </Card.Content>
          </Card>
        )}

        {/* Export Button */}
        <Button 
          mode="contained" 
          icon="file-export" 
          onPress={handleExport} 
          style={styles.button}
          disabled={records.length === 0}
        >
          导出 PDF 报告
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    marginBottom: 32,
  },
});

export default AnalysisScreen;