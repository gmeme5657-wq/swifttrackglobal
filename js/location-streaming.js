/**
 * Location Streaming & Geofencing
 * Handles real-time GPS updates and geofence alerts
 */

class LocationStreamingService {
  constructor() {
    this.watchId = null;
    this.geofences = [];
    this.activeStreams = new Map();
    this.locationHistory = new Map();
    this.isTracking = false;
  }

  /**
   * Start streaming current device location
   */
  startLocationTracking(shipmentId, options = {}) {
    if (!('geolocation' in navigator)) {
      console.warn('Geolocation not supported');
      return null;
    }

    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
      ...options,
    };

    this.isTracking = true;

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const timestamp = position.timestamp || Date.now();

        this.handleLocationUpdate(shipmentId, {
          latitude,
          longitude,
          accuracy,
          timestamp,
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        this.isTracking = false;
        if (window.showToast) {
          window.showToast('Location tracking failed: ' + error.message, 'error', 4000);
        }
      },
      defaultOptions
    );

    return this.watchId;
  }

  /**
   * Stop tracking location
   */
  stopLocationTracking() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isTracking = false;
      return true;
    }
    return false;
  }

  /**
   * Handle location update
   */
  handleLocationUpdate(shipmentId, location) {
    if (!this.locationHistory.has(shipmentId)) {
      this.locationHistory.set(shipmentId, []);
    }

    const history = this.locationHistory.get(shipmentId);
    history.push(location);

    // Keep only last 100 locations
    if (history.length > 100) {
      history.shift();
    }

    // Send to server if available
    if (window.SwiftBackend?.updateDriverLocation) {
      window.SwiftBackend.updateDriverLocation({
        shipment_id: shipmentId,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy_m: location.accuracy,
      }).catch(err => console.warn('Location sync failed:', err));
    }

    // Check geofences
    this.checkGeofences(shipmentId, location);

    // Trigger callback if registered
    const callback = this.activeStreams.get(shipmentId);
    if (callback) {
      callback(location);
    }
  }

  /**
   * Register a geofence
   */
  registerGeofence(geofenceId, options = {}) {
    const geofence = {
      id: geofenceId,
      latitude: options.latitude || 0,
      longitude: options.longitude || 0,
      radiusMeters: options.radiusMeters || 500,
      name: options.name || `Geofence ${geofenceId}`,
      onEnter: options.onEnter || null,
      onExit: options.onExit || null,
      isInside: false,
    };

    this.geofences.push(geofence);
    return geofence;
  }

  /**
   * Unregister a geofence
   */
  unregisterGeofence(geofenceId) {
    this.geofences = this.geofences.filter(g => g.id !== geofenceId);
    return true;
  }

  /**
   * Check if location is inside geofence
   */
  isInsideGeofence(location, geofence) {
    const R = 6371000; // Earth's radius in meters
    const lat1 = (geofence.latitude * Math.PI) / 180;
    const lat2 = (location.latitude * Math.PI) / 180;
    const dLat = ((location.latitude - geofence.latitude) * Math.PI) / 180;
    const dLon = ((location.longitude - geofence.longitude) * Math.PI) / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance <= geofence.radiusMeters;
  }

  /**
   * Check all geofences
   */
  checkGeofences(shipmentId, location) {
    for (const geofence of this.geofences) {
      const isNowInside = this.isInsideGeofence(location, geofence);
      const wasInside = geofence.isInside;

      if (isNowInside && !wasInside) {
        // Entered geofence
        geofence.isInside = true;
        if (geofence.onEnter) {
          geofence.onEnter({
            shipmentId,
            geofence,
            location,
            timestamp: Date.now(),
          });
        }
        this.triggerGeofenceAlert('enter', geofence, shipmentId);
      } else if (!isNowInside && wasInside) {
        // Exited geofence
        geofence.isInside = false;
        if (geofence.onExit) {
          geofence.onExit({
            shipmentId,
            geofence,
            location,
            timestamp: Date.now(),
          });
        }
        this.triggerGeofenceAlert('exit', geofence, shipmentId);
      }
    }
  }

  /**
   * Trigger geofence alert
   */
  triggerGeofenceAlert(type, geofence, shipmentId) {
    const message = type === 'enter' ?
      `Package entered ${geofence.name}` :
      `Package exited ${geofence.name}`;

    if (window.showToast) {
      window.showToast(message, 'info', 3000);
    }

    if (window.NotificationsService) {
      window.NotificationsService.showInApp(message, 'info', 3000);
    }

    if (window.EventLogger) {
      // Log the geofence event
      const shipment = window.DATA?.shipments?.find(s => s.id === shipmentId);
      if (shipment) {
        window.EventLogger.logEvent(shipment, 'geofence_' + type, {
          message,
          geofence_id: geofence.id,
          geofence_name: geofence.name,
        });
      }
    }
  }

  /**
   * Add location stream callback
   */
  onLocationUpdate(shipmentId, callback) {
    this.activeStreams.set(shipmentId, callback);
  }

  /**
   * Get location history
   */
  getLocationHistory(shipmentId) {
    return this.locationHistory.get(shipmentId) || [];
  }

  /**
   * Get average speed
   */
  getAverageSpeed(shipmentId) {
    const history = this.getLocationHistory(shipmentId);
    if (history.length < 2) return 0;

    const R = 6371; // Earth's radius in km
    let totalDistance = 0;

    for (let i = 1; i < history.length; i++) {
      const lat1 = (history[i - 1].latitude * Math.PI) / 180;
      const lat2 = (history[i].latitude * Math.PI) / 180;
      const dLat = ((history[i].latitude - history[i - 1].latitude) * Math.PI) / 180;
      const dLon = ((history[i].longitude - history[i - 1].longitude) * Math.PI) / 180;

      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      totalDistance += R * c;
    }

    const timeDiffHours = (history[history.length - 1].timestamp - history[0].timestamp) / (1000 * 60 * 60);
    return timeDiffHours > 0 ? totalDistance / timeDiffHours : 0;
  }

  /**
   * Setup delivery zone geofence
   */
  setupDeliveryZoneGeofence(shipment) {
    const destination = shipment.destination;
    return this.registerGeofence(`delivery-${shipment.trackingNumber}`, {
      latitude: destination.lat,
      longitude: destination.lng,
      radiusMeters: 1000, // 1km radius
      name: `Delivery Zone - ${destination.city}`,
      onEnter: (data) => {
        if (window.NotificationsService) {
          window.NotificationsService.notifyShipmentUpdate(shipment, 'in-delivery-zone');
        }
      },
    });
  }

  /**
   * Get tracking status
   */
  getTrackingStatus() {
    return {
      isTracking: this.isTracking,
      activeGeofences: this.geofences.length,
      activeStreams: this.activeStreams.size,
      locationHistorySize: this.locationHistory.size,
    };
  }
}

// Export singleton instance
window.LocationStreamingService = new LocationStreamingService();
