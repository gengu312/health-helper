import React from 'react';
import { View } from 'react-native';
import { VictoryChart, VictoryLine, VictoryScatter, VictoryTheme, VictoryAxis } from 'victory-native';
import { useTheme } from 'react-native-paper';
import { BloodPressureRecord } from '@/types/models';
import { format } from 'date-fns';

interface Props {
  data: BloodPressureRecord[];
}

const BloodPressureChart = ({ data }: Props) => {
  const theme = useTheme();
  
  if (!data || data.length === 0) return null;

  // Transform data and sort by time ascending
  const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp);
  const systolicData = sortedData.map(r => ({ x: new Date(r.timestamp), y: r.systolic }));
  const diastolicData = sortedData.map(r => ({ x: new Date(r.timestamp), y: r.diastolic }));

  return (
    <View pointerEvents="none">
      <VictoryChart
        theme={VictoryTheme.material}
        height={220}
        padding={{ top: 20, bottom: 40, left: 50, right: 30 }}
        scale={{ x: "time" }}
      >
        <VictoryAxis 
          dependentAxis 
          style={{ 
            grid: { stroke: '#e0e0e0' },
            tickLabels: { fontSize: 10, padding: 5 } 
          }}
        />
        <VictoryAxis
          tickFormat={(x) => format(x, 'MM/dd')}
          style={{ 
            grid: { stroke: 'none' },
            tickLabels: { fontSize: 10, padding: 5, angle: -45 }
          }}
        />
        
        {/* Systolic Line (Red) */}
        <VictoryLine
          data={systolicData}
          style={{
            data: { stroke: theme.colors.error, strokeWidth: 2 }
          }}
        />
        <VictoryScatter
          data={systolicData}
          size={3}
          style={{ data: { fill: theme.colors.error } }}
        />

        {/* Diastolic Line (Blue/Primary) */}
        <VictoryLine
          data={diastolicData}
          style={{
            data: { stroke: theme.colors.primary, strokeWidth: 2 }
          }}
        />
        <VictoryScatter
          data={diastolicData}
          size={3}
          style={{ data: { fill: theme.colors.primary } }}
        />
      </VictoryChart>
    </View>
  );
};

export default BloodPressureChart;