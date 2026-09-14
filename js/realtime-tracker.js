/**
 * Supabase Realtime Subscriptions
 * Enables real-time updates for shipment tracking and location changes
 */

class RealtimeTracker {
  constructor() {
    this.subscriptions = new Map();
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * Subscribe to shipment updates
   */
  subscribeToShipment(trackingNumber, callback) {
    if (!window.SwiftBackend?.client) {
      console.warn('Supabase client not initialized');
      return null;
    }

    const subscriptionKey = `shipment-${trackingNumber}`;

    // Unsubscribe from previous subscription
    if (this.subscriptions.has(subscriptionKey)) {
      this.subscriptions.get(subscriptionKey).unsubscribe?.();
    }

    try {
      const subscription = window.SwiftBackend.client
        .channel(`realtime:shipments:tracking_number=eq.${trackingNumber}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'shipments',
            filter: `tracking_number=eq.${trackingNumber}`,
          },
          (payload) => {
            console.log('Shipment update received:', payload);
            if (callback) {
              callback({
                type: payload.eventType,
                old: payload.old,
                new: payload.new,
                timestamp: Date.now(),
              });
            }
          }
        )
        .subscribe();

      this.subscriptions.set(subscriptionKey, subscription);
      this.isConnected = true;
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to shipment:', error);
      return null;
    }
  }

  /**
   * Subscribe to shipment events
   */
  subscribeToEvents(shipmentId, callback) {
    if (!window.SwiftBackend?.client) {
      console.warn('Supabase client not initialized');
      return null;
    }

    const subscriptionKey = `events-${shipmentId}`;

    if (this.subscriptions.has(subscriptionKey)) {
      this.subscriptions.get(subscriptionKey).unsubscribe?.();
    }

    try {
      const subscription = window.SwiftBackend.client
        .channel(`realtime:shipment_events:shipment_id=eq.${shipmentId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'shipment_events',
            filter: `shipment_id=eq.${shipmentId}`,
          },
          (payload) => {
            console.log('Event received:', payload);
            if (callback) {
              callback({
                type: 'new_event',
                event: payload.new,
                timestamp: Date.now(),
              });
            }
          }
        )
        .subscribe();

      this.subscriptions.set(subscriptionKey, subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to events:', error);
      return null;
    }
  }

  /**
   * Subscribe to driver location updates
   */
  subscribeToDriverLocation(driverId, callback) {
    if (!window.SwiftBackend?.client) {
      console.warn('Supabase client not initialized');
      return null;
    }

    const subscriptionKey = `driver-location-${driverId}`;

    if (this.subscriptions.has(subscriptionKey)) {
      this.subscriptions.get(subscriptionKey).unsubscribe?.();
    }

    try {
      const subscription = window.SwiftBackend.client
        .channel(`realtime:driver_locations:driver_id=eq.${driverId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'driver_locations',
            filter: `driver_id=eq.${driverId}`,
          },
          (payload) => {
            console.log('Driver location update:', payload);
            if (callback) {
              callback({
                type: 'location_update',
                location: payload.new,
                timestamp: Date.now(),
              });
            }
          }
        )
        .subscribe();

      this.subscriptions.set(subscriptionKey, subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to driver location:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from a specific channel
   */
  unsubscribe(subscriptionKey) {
    if (this.subscriptions.has(subscriptionKey)) {
      const subscription = this.subscriptions.get(subscriptionKey);
      subscription.unsubscribe?.();
      this.subscriptions.delete(subscriptionKey);
      return true;
    }
    return false;
  }

  /**
   * Unsubscribe from all subscriptions
   */
  unsubscribeAll() {
    for (const [key, subscription] of this.subscriptions.entries()) {
      subscription.unsubscribe?.();
      this.subscriptions.delete(key);
    }
    this.isConnected = false;
  }

  /**
   * Check connection status
   */
  getConnectionStatus() {
    if (!window.SwiftBackend?.client) {
      return { connected: false, reason: 'Supabase not initialized' };
    }

    return {
      connected: this.isConnected,
      activeSubscriptions: this.subscriptions.size,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  /**
   * Set up auto-refresh fallback (poll every 30 seconds)
   */
  setupPolling(shipmentId, callback, interval = 30000) {
    const pollKey = `poll-${shipmentId}`;

    if (this.subscriptions.has(pollKey)) {
      clearInterval(this.subscriptions.get(pollKey));
    }

    const pollInterval = setInterval(async () => {
      try {
        if (window.SwiftBackend?.getShipment) {
          const shipment = await window.SwiftBackend.getShipment(shipmentId);
          if (shipment) {
            callback({
              type: 'poll_update',
              shipment,
              timestamp: Date.now(),
            });
          }
        }
      } catch (error) {
        console.warn('Polling failed:', error);
      }
    }, interval);

    this.subscriptions.set(pollKey, pollInterval);
    return pollInterval;
  }

  /**
   * Stop polling
   */
  stopPolling(shipmentId) {
    const pollKey = `poll-${shipmentId}`;
    if (this.subscriptions.has(pollKey)) {
      clearInterval(this.subscriptions.get(pollKey));
      this.subscriptions.delete(pollKey);
      return true;
    }
    return false;
  }

  /**
   * Setup comprehensive tracking for a shipment
   */
  setupFullTracking(shipmentId, trackingNumber, driverId, callbacks = {}) {
    const setup = {
      shipment: null,
      events: null,
      driver: null,
      poll: null,
    };

    // Subscribe to shipment updates
    if (callbacks.onShipmentUpdate) {
      setup.shipment = this.subscribeToShipment(trackingNumber, callbacks.onShipmentUpdate);
    }

    // Subscribe to shipment events
    if (callbacks.onEventReceived) {
      setup.events = this.subscribeToEvents(shipmentId, callbacks.onEventReceived);
    }

    // Subscribe to driver location
    if (driverId && callbacks.onLocationUpdate) {
      setup.driver = this.subscribeToDriverLocation(driverId, callbacks.onLocationUpdate);
    }

    // Setup polling as fallback
    if (callbacks.onPoll) {
      setup.poll = this.setupPolling(shipmentId, callbacks.onPoll);
    }

    return setup;
  }

  /**
   * Cleanup tracking subscriptions
   */
  cleanupTracking(shipmentId, trackingNumber, driverId) {
    this.unsubscribe(`shipment-${trackingNumber}`);
    this.unsubscribe(`events-${shipmentId}`);
    this.unsubscribe(`driver-location-${driverId}`);
    this.stopPolling(shipmentId);
  }
}

// Export singleton instance
window.RealtimeTracker = new RealtimeTracker();

// Listen for connection events
if (window.SwiftBackend?.client?.auth?.onAuthStateChange) {
  window.SwiftBackend.client.auth.onAuthStateChange((event) => {
    window.RealtimeTracker.isConnected = event === 'SIGNED_IN';
    console.log(`Realtime tracker ${event === 'SIGNED_IN' ? 'connected' : 'disconnected'}`);
  });
}
