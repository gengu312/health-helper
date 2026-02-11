import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '@/features/bloodPressure/screens/HomeScreen';
import RecordScreen from '@/features/bloodPressure/screens/RecordScreen';
import ReminderScreen from '@/features/reminders/screens/ReminderScreen';
import { useTheme } from 'react-native-paper';

export type RootStackParamList = {
  Home: undefined;
  Record: undefined;
  Reminder: undefined;
  Analysis: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const theme = useTheme();

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.surface,
          },
          headerTintColor: theme.colors.onSurface,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: '健康助手' }} 
        />
        <Stack.Screen 
          name="Record" 
          component={RecordScreen} 
          options={{ title: '记录数据' }} 
        />
        <Stack.Screen 
          name="Reminder" 
          component={ReminderScreen} 
          options={{ title: '提醒设置' }} 
        />
        {/* Add other screens here */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;