import PushNotification, { Importance } from 'react-native-push-notification';
import { Platform } from 'react-native';

class NotificationService {
  constructor() {
    this.configure();
    this.createChannel();
  }

  configure() {
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },

      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });
  }

  createChannel() {
    PushNotification.createChannel(
      {
        channelId: "health-helper-reminder",
        channelName: "Health Helper Reminders",
        channelDescription: "Reminders for blood pressure measurement",
        playSound: true,
        soundName: "default",
        importance: Importance.HIGH,
        vibrate: true,
      },
      (created) => console.log(`createChannel returned '${created}'`)
    );
  }

  scheduleReminder(date: Date, id: string, message: string = "是时候测量您的血压了") {
    PushNotification.localNotificationSchedule({
      id: id,
      channelId: "health-helper-reminder",
      title: "血压测量提醒",
      message: message,
      date: date,
      allowWhileIdle: true,
      repeatType: 'day', // Default to daily for now
    });
  }

  cancelReminder(id: string) {
    PushNotification.cancelLocalNotifications({ id: id });
  }

  cancelAll() {
    PushNotification.cancelAllLocalNotifications();
  }
}

export const notificationService = new NotificationService();