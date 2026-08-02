import { LocalNotifications } from '@capacitor/local-notifications';

export class NotificationService {
  private static isAvailable(): boolean {
    return typeof window !== 'undefined' && 'Capacitor' in window;
  }

  public static async requestPermission(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    try {
      const perm = await LocalNotifications.checkPermissions();
      if (perm.display !== 'granted') {
        const req = await LocalNotifications.requestPermissions();
        return req.display === 'granted';
      }
      return true;
    } catch (e) {
      console.warn('LocalNotifications permission request failed:', e);
      return false;
    }
  }

  public static async scheduleWalkReminder(petName: string, hour: number, minute: number): Promise<void> {
    if (!this.isAvailable()) return;
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) return;

      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hour, minute, 0, 0);
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            title: `${petName}와(과) 함께하는 즐거운 산책 시간!`,
            body: `오늘 산책 목표 시각(${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')})입니다. 신나게 출발해볼까요?`,
            id: 1001,
            schedule: { at: scheduledTime, repeats: true, every: 'day' },
            sound: undefined,
            attachments: undefined,
            actionTypeId: '',
            extra: null
          }
        ]
      });
    } catch (e) {
      console.warn('Failed to schedule walk notification:', e);
    }
  }

  public static async scheduleMedicationReminder(petName: string, medName: string, date: Date, hour: number, minute: number, idOffset: number = 0): Promise<void> {
    if (!this.isAvailable()) return;
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) return;

      const scheduledTime = new Date(date);
      scheduledTime.setHours(hour, minute, 0, 0);
      if (scheduledTime <= new Date()) return;

      await LocalNotifications.schedule({
        notifications: [
          {
            title: `${petName} 약/영양제 복용 시간`,
            body: `'${medName}' 복용 시간입니다. 잊지 말고 챙겨주세요!`,
            id: 2000 + idOffset,
            schedule: { at: scheduledTime },
            sound: undefined,
            attachments: undefined,
            actionTypeId: '',
            extra: null
          }
        ]
      });
    } catch (e) {
      console.warn('Failed to schedule medication notification:', e);
    }
  }

  public static async cancelAll(): Promise<void> {
    if (!this.isAvailable()) return;
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }
    } catch (e) {
      console.warn('Failed to cancel notifications:', e);
    }
  }
}

export default NotificationService;
