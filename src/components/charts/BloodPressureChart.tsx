import React, { useMemo, useState } from 'react';
import { View, Dimensions, LayoutChangeEvent } from 'react-native';
import { VictoryChart, VictoryLine, VictoryScatter, VictoryAxis, VictoryArea, VictoryGroup } from 'victory-native';
import { useTheme } from 'react-native-paper';
import { BloodPressureRecord } from '@/types/models';
import { format } from 'date-fns';

interface Props {
  data: BloodPressureRecord[];
  viewMode?: 'day' | 'week' | 'month';
}

const BloodPressureChart = ({ data, viewMode = 'week' }: Props) => {
  const theme = useTheme();
  const [layoutWidth, setLayoutWidth] = useState(Dimensions.get('window').width - 32);

  const onLayout = (event: LayoutChangeEvent) => {
    setLayoutWidth(event.nativeEvent.layout.width);
  };
  
  if (!data || data.length === 0) return null;

  // Transform data and sort by time ascending
  const sortedData = useMemo(() => [...data].sort((a, b) => a.timestamp - b.timestamp), [data]);
  const systolicData = useMemo(() => sortedData.map(r => ({ x: new Date(r.timestamp), y: r.systolic })), [sortedData]);
  const diastolicData = useMemo(() => sortedData.map(r => ({ x: new Date(r.timestamp), y: r.diastolic })), [sortedData]);

  const getTickFormat = (x: Date) => {
    if (viewMode === 'day') {
      return format(x, 'HH:mm');
    } else if (viewMode === 'month') {
      return format(x, 'MM/dd');
    }
    return format(x, 'MM/dd');
  };

  const chartTheme = {
    axis: {
      style: {
        axis: { stroke: theme.colors.outline },
        grid: { stroke: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', strokeDasharray: '4, 4' },
        tickLabels: { fill: theme.colors.onSurfaceVariant, fontSize: 10, padding: 5 },
      },
    },
  };

  return (
    <View onLayout={onLayout} pointerEvents="none">
      <VictoryChart
        width={layoutWidth}
        height={220}
        padding={{ top: 20, bottom: 40, left: 40, right: 20 }}
        scale={{ x: "time" }}
        theme={chartTheme}
      >
        <VictoryAxis 
          dependentAxis 
          style={{ 
            grid: { stroke: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' },
            tickLabels: { fill: theme.colors.onSurfaceVariant, fontSize: 10, padding: 5 } 
          }}
        />
        <VictoryAxis
          tickFormat={getTickFormat}
          style={{ 
            grid: { stroke: 'none' },
            tickLabels: { fill: theme.colors.onSurfaceVariant, fontSize: 10, padding: 5, angle: viewMode === 'day' ? 0 : -45 }
          }}
          // Reduce number of ticks for cleaner look
          tickCount={viewMode === 'day' ? 6 : 7}
        />
        
        {/* Systolic Area & Line (Red) */}
        <VictoryGroup data={systolicData}>
          <VictoryArea
            style={{
              data: { fill: theme.colors.error, fillOpacity: 0.1 }
            }}
          />
          <VictoryLine
            style={{
              data: { stroke: theme.colors.error, strokeWidth: 2 }
            }}
          />
          <VictoryScatter
            size={3}
            style={{ data: { fill: theme.colors.error } }}
          />
        </VictoryGroup>

        {/* Diastolic Area & Line (Blue/Primary) */}
        <VictoryGroup data={diastolicData}>
          <VictoryArea
            style={{
              data: { fill: theme.colors.primary, fillOpacity: 0.1 }
            }}
          />
          <VictoryLine
            style={{
              data: { stroke: theme.colors.primary, strokeWidth: 2 }
            }}
          />
          <VictoryScatter
            size={3}
            style={{ data: { fill: theme.colors.primary } }}
          />
        </VictoryGroup>
      </VictoryChart>
    </View>
  );
};

export default BloodPressureChart;