/**
 * Notifications Service
 * Handles push notifications, in-app alerts, and browser permissions
 */

class NotificationsService {
  constructor() {
    this.serviceWorkerReady = false;
    this.permissionGranted = false;
    this.initialize();
  }

  async initialize() {
    // Register service worker for push notifications
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('./service-worker.js');
        this.serviceWorkerReady = true;
        console.log('Service Worker registered for notifications');
      } catch (error) {
        console.warn('Service Worker registration failed:', error);
      }
    }

    // Check notification permission status
    if ('Notification' in window) {
      this.permissionGranted = Notification.permission === 'granted';
    }
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permissionGranted = true;
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permissionGranted = permission === 'granted';
      return this.permissionGranted;
    }

    return false;
  }

  /**
   * Send in-app toast notification
   */
  showInApp(message, type = 'info', timeout = 3000) {
    if (window.showToast) {
      window.showToast(message, type, timeout);
    }
  }

  /**
   * Send browser push notification
   */
  async sendNotification(title, options = {}) {
    if (!this.serviceWorkerReady || !this.permissionGranted) {
      return false;
    }

    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title,
          options: {
            icon: './assets/logo-icon.png',
            badge: './assets/badge.png',
            ...options,
          },
        });
      } else {
        new Notification(title, {
          icon: './assets/logo-icon.png',
          badge: './assets/badge.png',
          ...options,
        });
      }
      return true;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }

  /**
   * Notify about shipment status change
   */
  async notifyShipmentUpdate(shipment, previousStatus) {
    if (!shipment) return;

    const title = `Shipment ${shipment.trackingNumber} Updated`;
    const status = shipment.status;
    
    const statusMessages = {
      'Order Placed': 'Your order has been confirmed',
      'Picked Up': 'Your package has been picked up',
      'In Transit': 'Your package is on the way',
      'Out for Delivery': 'Your package is out for delivery',
      'Delivered': 'Your package has been delivered',
      'Exception': 'There is an issue with your shipment',
    };

    const message = statusMessages[status] || `Status: ${status}`;

    // Show in-app notification
    this.showInApp(message, status === 'Exception' ? 'error' : 'success', 4000);

    // Send push notification if permission granted
    if (this.permissionGranted) {
      await this.sendNotification(title, {
        body: message,
        tag: shipment.trackingNumber,
        requireInteraction: status === 'Exception',
      });
    }

    // Store notification in shipment
    if (!shipment.notifications) shipment.notifications = [];
    shipment.notifications.push({
      id: Math.random().toString(36).slice(2, 10),
      type: status,
      message,
      timestamp: Date.now(),
      read: false,
    });
  }

  /**
   * Notify about waypoint completion
   */
  async notifyWaypointCompleted(shipment, waypoint) {
    if (!shipment || !waypoint) return;

    const title = `Waypoint: ${waypoint.type}`;
    const message = waypoint.description;

    this.showInApp(message, 'info', 3000);

    if (this.permissionGranted) {
      await this.sendNotification(title, {
        body: message,
        tag: `${shipment.trackingNumber}-wp-${waypoint.id}`,
      });
    }
  }

  /**
   * Notify about exceptions/delays
   */
  async notifyException(shipment, exceptionDetails) {
    if (!shipment) return;

    const title = `Alert: ${exceptionDetails.type}`;
    const message = exceptionDetails.message || 'Please check your shipment status';

    this.showInApp(message, 'error', 5000);

    if (this.permissionGranted) {
      await this.sendNotification(title, {
        body: message,
        tag: `${shipment.trackingNumber}-exception`,
        requireInteraction: true,
        badge: './assets/alert-badge.png',
      });
    }

    if (!shipment.exceptions) shipment.exceptions = [];
    shipment.exceptions.push({
      id: Math.random().toString(36).slice(2, 10),
      type: exceptionDetails.type,
      message: exceptionDetails.message,
      timestamp: Date.now(),
      resolved: false,
    });
  }

  /**
   * Mark notification as read
   */
  markNotificationRead(shipment, notificationId) {
    if (!shipment || !shipment.notifications) return;
    const notif = shipment.notifications.find(n => n.id === notificationId);
    if (notif) notif.read = true;
  }

  /**
   * Get unread notifications count
   */
  getUnreadCount(shipment) {
    if (!shipment || !shipment.notifications) return 0;
    return shipment.notifications.filter(n => !n.read).length;
  }
}

// Export singleton instance
window.NotificationsService = new NotificationsService();

// Request permission on first user interaction
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', () => {
      if (!window.NotificationsService.permissionGranted && 'Notification' in window) {
        window.NotificationsService.requestPermission().catch(err => console.warn('Notification permission denied:', err));
      }
    }, { once: true });
  });
} else {
  document.addEventListener('click', () => {
    if (!window.NotificationsService.permissionGranted && 'Notification' in window) {
      window.NotificationsService.requestPermission().catch(err => console.warn('Notification permission denied:', err));
    }
  }, { once: true });
}
