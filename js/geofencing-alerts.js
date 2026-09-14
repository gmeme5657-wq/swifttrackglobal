/**
 * Geofencing Alerts System
 * Advanced alerts for zone entry/exit, delay detection, and incident alerts
 */

class GeofencingAlertsSystem {
  constructor() {
    this.alerts = new Map();
    this.alertRules = [];
    this.alertHistory = [];
    this.maxHistorySize = 500;
  }

  /**
   * Define an alert rule
   */
  defineAlertRule(ruleId, options = {}) {
    const rule = {
      id: ruleId,
      type: options.type || 'geofence', // geofence, delay, exception, waypoint
      enabled: options.enabled !== false,
      priority: options.priority || 'normal', // low, normal, high, critical
      conditions: options.conditions || {},
      actions: options.actions || [],
      notifyChannels: options.notifyChannels || ['in-app', 'browser'],
      createdAt: Date.now(),
      triggeredCount: 0,
    };

    this.alertRules.push(rule);
    return rule;
  }

  /**
   * Create a zone alert
   */
  createZoneAlert(alertId, options = {}) {
    const alert = {
      id: alertId,
      shipmentId: options.shipmentId,
      trackingNumber: options.trackingNumber,
      type: 'zone-alert',
      zone: {
        name: options.zoneName || 'Zone',
        latitude: options.latitude,
        longitude: options.longitude,
        radiusMeters: options.radiusMeters || 500,
      },
      event: options.event || 'enter', // enter, exit
      timestamp: Date.now(),
      status: 'active',
      acknowledged: false,
      expiresAt: Date.now() + (options.ttlMinutes || 60) * 60 * 1000,
    };

    this.alerts.set(alertId, alert);
    this.recordAlertHistory(alert);
    this.triggerAlert(alert);

    return alert;
  }

  /**
   * Create a delay alert
   */
  createDelayAlert(alertId, options = {}) {
    const alert = {
      id: alertId,
      shipmentId: options.shipmentId,
      trackingNumber: options.trackingNumber,
      type: 'delay-alert',
      delayMinutes: options.delayMinutes || 0,
      reason: options.reason || 'Unknown delay',
      expectedEta: options.expectedEta,
      updatedEta: options.updatedEta,
      timestamp: Date.now(),
      status: 'active',
      acknowledged: false,
      severity: options.severity || 'medium',
      expiresAt: Date.now() + (options.ttlMinutes || 120) * 60 * 1000,
    };

    this.alerts.set(alertId, alert);
    this.recordAlertHistory(alert);
    this.triggerAlert(alert);

    return alert;
  }

  /**
   * Create an exception alert
   */
  createExceptionAlert(alertId, options = {}) {
    const alert = {
      id: alertId,
      shipmentId: options.shipmentId,
      trackingNumber: options.trackingNumber,
      type: 'exception-alert',
      exceptionType: options.exceptionType || 'unknown',
      severity: options.severity || 'high',
      message: options.message || 'An exception occurred',
      actionRequired: options.actionRequired !== false,
      suggestedActions: options.suggestedActions || [],
      timestamp: Date.now(),
      status: 'active',
      acknowledged: false,
      expiresAt: Date.now() + (options.ttlMinutes || 1440) * 60 * 1000, // 24 hours default
    };

    this.alerts.set(alertId, alert);
    this.recordAlertHistory(alert);
    this.triggerAlert(alert);

    return alert;
  }

  /**
   * Create a waypoint alert
   */
  createWaypointAlert(alertId, options = {}) {
    const alert = {
      id: alertId,
      shipmentId: options.shipmentId,
      trackingNumber: options.trackingNumber,
      type: 'waypoint-alert',
      waypointId: options.waypointId,
      waypointType: options.waypointType,
      event: options.event || 'reached', // reached, missed, delayed
      expectedTime: options.expectedTime,
      actualTime: options.actualTime,
      delayMinutes: options.delayMinutes || 0,
      timestamp: Date.now(),
      status: 'active',
      acknowledged: false,
      expiresAt: Date.now() + (options.ttlMinutes || 60) * 60 * 1000,
    };

    this.alerts.set(alertId, alert);
    this.recordAlertHistory(alert);
    this.triggerAlert(alert);

    return alert;
  }

  /**
   * Trigger alert notifications
   */
  triggerAlert(alert) {
    const title = this.getAlertTitle(alert);
    const message = this.getAlertMessage(alert);
    const icon = this.getAlertIcon(alert);

    // Determine notification channels
    const rule = this.alertRules.find(r => r.id === alert.id);
    const channels = rule?.notifyChannels || ['in-app', 'browser'];

    // In-app notification
    if (channels.includes('in-app') && window.showToast) {
      const severity = alert.severity || 'medium';
      const toastType = {
        'critical': 'error',
        'high': 'error',
        'medium': 'warning',
        'low': 'info',
      }[severity] || 'info';

      window.showToast(`${icon} ${title}: ${message}`, toastType, 5000);
    }

    // Browser notification
    if (channels.includes('browser') && window.NotificationsService) {
      window.NotificationsService.sendNotification(title, {
        body: message,
        tag: alert.id,
        badge: './assets/alert-badge.png',
        requireInteraction: alert.severity === 'critical' || alert.severity === 'high',
      });
    }

    // Email notification (can be implemented with backend)
    if (channels.includes('email')) {
      this.sendEmailNotification(alert, title, message);
    }

    // SMS notification (can be implemented with backend)
    if (channels.includes('sms')) {
      this.sendSmsNotification(alert, title, message);
    }
  }

  /**
   * Get alert title based on type
   */
  getAlertTitle(alert) {
    const titles = {
      'zone-alert': `Zone Alert - ${alert.zone?.name || 'Zone'}`,
      'delay-alert': `Delivery Delay Alert`,
      'exception-alert': `Exception: ${alert.exceptionType}`,
      'waypoint-alert': `Waypoint Alert - ${alert.waypointType}`,
    };
    return titles[alert.type] || 'Tracking Alert';
  }

  /**
   * Get alert message
   */
  getAlertMessage(alert) {
    switch (alert.type) {
      case 'zone-alert':
        return alert.event === 'enter' ?
          `Package entered ${alert.zone?.name}` :
          `Package left ${alert.zone?.name}`;

      case 'delay-alert':
        return `Delivery delayed by ${alert.delayMinutes} minutes - ${alert.reason}`;

      case 'exception-alert':
        return alert.message;

      case 'waypoint-alert':
        if (alert.event === 'reached') {
          return `Waypoint reached: ${alert.waypointType}`;
        } else if (alert.event === 'delayed') {
          return `Waypoint delayed by ${alert.delayMinutes} minutes`;
        }
        return `Waypoint status: ${alert.event}`;

      default:
        return 'Tracking alert';
    }
  }

  /**
   * Get alert icon/emoji
   */
  getAlertIcon(alert) {
    const icons = {
      'zone-alert': '📍',
      'delay-alert': '⏱️',
      'exception-alert': '⚠️',
      'waypoint-alert': '🗺️',
    };
    return icons[alert.type] || '📦';
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId) {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = Date.now();
      return true;
    }
    return false;
  }

  /**
   * Dismiss an alert
   */
  dismissAlert(alertId) {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.status = 'dismissed';
      alert.dismissedAt = Date.now();
      return true;
    }
    return false;
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId, resolution = '') {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.status = 'resolved';
      alert.resolvedAt = Date.now();
      alert.resolution = resolution;
      return true;
    }
    return false;
  }

  /**
   * Get active alerts for a shipment
   */
  getActiveAlerts(shipmentId) {
    const now = Date.now();
    const alerts = [];

    for (const [id, alert] of this.alerts.entries()) {
      if (alert.shipmentId === shipmentId &&
          alert.status === 'active' &&
          alert.expiresAt > now) {
        alerts.push(alert);
      }
    }

    return alerts.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return (priorityOrder[a.severity] || 2) - (priorityOrder[b.severity] || 2);
    });
  }

  /**
   * Get all alerts summary
   */
  getAlertsSummary() {
    const now = Date.now();
    let critical = 0;
    let high = 0;
    let medium = 0;
    let low = 0;

    for (const [id, alert] of this.alerts.entries()) {
      if (alert.status === 'active' && alert.expiresAt > now) {
        if (alert.severity === 'critical') critical++;
        else if (alert.severity === 'high') high++;
        else if (alert.severity === 'medium') medium++;
        else low++;
      }
    }

    return { critical, high, medium, low, total: critical + high + medium + low };
  }

  /**
   * Record alert in history
   */
  recordAlertHistory(alert) {
    this.alertHistory.push({
      ...alert,
      recordedAt: Date.now(),
    });

    // Keep history size limited
    if (this.alertHistory.length > this.maxHistorySize) {
      this.alertHistory.shift();
    }
  }

  /**
   * Get alert history
   */
  getAlertHistory(shipmentId = null, limit = 50) {
    let history = this.alertHistory;

    if (shipmentId) {
      history = history.filter(a => a.shipmentId === shipmentId);
    }

    return history.slice(-limit).reverse();
  }

  /**
   * Cleanup expired alerts
   */
  cleanupExpiredAlerts() {
    const now = Date.now();
    let removed = 0;

    for (const [id, alert] of this.alerts.entries()) {
      if (alert.expiresAt <= now) {
        this.alerts.delete(id);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Send email notification (stub for backend implementation)
   */
  async sendEmailNotification(alert, title, message) {
    if (window.SwiftBackend?.sendEmailNotification) {
      try {
        await window.SwiftBackend.sendEmailNotification({
          shipmentId: alert.shipmentId,
          subject: title,
          body: message,
          alertId: alert.id,
        });
      } catch (error) {
        console.warn('Email notification failed:', error);
      }
    }
  }

  /**
   * Send SMS notification (stub for backend implementation)
   */
  async sendSmsNotification(alert, title, message) {
    if (window.SwiftBackend?.sendSmsNotification) {
      try {
        await window.SwiftBackend.sendSmsNotification({
          shipmentId: alert.shipmentId,
          message: `${title}: ${message}`,
          alertId: alert.id,
        });
      } catch (error) {
        console.warn('SMS notification failed:', error);
      }
    }
  }

  /**
   * Export alerts summary
   */
  exportAlertsSummary() {
    return {
      exportedAt: new Date().toISOString(),
      summary: this.getAlertsSummary(),
      activeAlerts: Array.from(this.alerts.values()).filter(a => a.status === 'active'),
      recentHistory: this.getAlertHistory(null, 100),
    };
  }
}

// Export singleton instance
window.GeofencingAlertsSystem = new GeofencingAlertsSystem();
