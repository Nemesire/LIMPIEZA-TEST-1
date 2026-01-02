
import { AppNotification, UserRole } from '../types';

class NotificationService {
  private listeners: ((notifications: AppNotification[]) => void)[] = [];
  private notifications: AppNotification[] = [
    {
      id: '1',
      title: 'Nueva Reserva',
      message: 'John Doe ha reservado la Habitación 1 para mañana.',
      type: 'reservation',
      timestamp: new Date().toISOString(),
      isRead: false,
      targetRole: UserRole.HOST
    },
    {
      id: '2',
      title: 'Stock Bajo',
      message: 'El Papel Higiénico está por debajo del nivel mínimo.',
      type: 'stock',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      isRead: false
    }
  ];

  subscribe(callback: (notifications: AppNotification[]) => void) {
    this.listeners.push(callback);
    callback(this.notifications);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify() {
    this.listeners.forEach(l => l([...this.notifications]));
  }

  send(notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) {
    const newNotif: AppNotification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      isRead: false
    };

    // Simulate persistent storage by adding to local list
    this.notifications = [newNotif, ...this.notifications];
    this.notify();

    // Browser Notification API simulation
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(newNotif.title, { body: newNotif.message });
    }
  }

  markAsRead(id: string) {
    this.notifications = this.notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    );
    this.notify();
  }

  markAllAsRead() {
    this.notifications = this.notifications.map(n => ({ ...n, isRead: true }));
    this.notify();
  }

  requestPermission() {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }
}

export const notificationService = new NotificationService();
