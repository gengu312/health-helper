import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from '@/services/notification/NotificationService';

interface Reminder {
  id: string;
  time: Date;
  isEnabled: boolean;
  label: string;
}

interface ReminderState {
  reminders: Reminder[];
  addReminder: (time: Date, label: string) => void;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;
}

export const useReminderStore = create<ReminderState>()(
  persist(
    (set, get) => ({
      reminders: [],

      addReminder: (time, label) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newReminder = { id, time, isEnabled: true, label };
        
        set((state) => ({
          reminders: [...state.reminders, newReminder]
        }));

        notificationService.scheduleReminder(time, id, `提醒: ${label}`);
      },

      toggleReminder: (id) => {
        const { reminders } = get();
        const reminder = reminders.find(r => r.id === id);
        
        if (reminder) {
          if (reminder.isEnabled) {
            notificationService.cancelReminder(id);
          } else {
            notificationService.scheduleReminder(reminder.time, id, `提醒: ${reminder.label}`);
          }

          set((state) => ({
            reminders: state.reminders.map(r => 
              r.id === id ? { ...r, isEnabled: !r.isEnabled } : r
            )
          }));
        }
      },

      deleteReminder: (id) => {
        notificationService.cancelReminder(id);
        set((state) => ({
          reminders: state.reminders.filter(r => r.id !== id)
        }));
      },
    }),
    {
      name: 'reminder-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);