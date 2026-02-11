import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Switch, Button, IconButton, useTheme, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useReminderStore } from '../store/reminderStore';
import { format } from 'date-fns';

const ReminderScreen = () => {
  const theme = useTheme();
  const { reminders, addReminder, toggleReminder, deleteReminder } = useReminderStore();
  
  const [showPicker, setShowPicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());

  const handleTimeChange = (event: any, date?: Date) => {
    setShowPicker(false);
    if (date) {
      addReminder(date, '日常测量');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
              暂无提醒，请添加
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Title
              title={format(new Date(item.time), 'HH:mm')}
              subtitle={item.label}
              right={(props) => (
                <View style={styles.actionContainer}>
                  <Switch
                    value={item.isEnabled}
                    onValueChange={() => toggleReminder(item.id)}
                    color={theme.colors.primary}
                  />
                  <IconButton
                    icon="delete"
                    size={20}
                    onPress={() => deleteReminder(item.id)}
                  />
                </View>
              )}
            />
          </Card>
        )}
      />

      <FAB
        icon="alarm-plus"
        label="添加提醒"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={() => setShowPicker(true)}
      />

      {showPicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  card: {
    marginBottom: 12,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default ReminderScreen;