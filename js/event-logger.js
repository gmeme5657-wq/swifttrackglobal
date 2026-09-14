/**
 * Event Logging & Incident Tracking
 * Provides detailed tracking of all shipment events, delays, and exceptions
 */

class EventLogger {
  constructor() {
    this.eventTypes = {
      STATUS_CHANGE: 'status_change',
      WAYPOINT_REACHED: 'waypoint_reached',
      DELAY: 'delay',
      EXCEPTION: 'exception',
      DELIVERY_ATTEMPT: 'delivery_attempt',
      LOCATION_UPDATE: 'location_update',
      HANDOFF: 'handoff',
      NOTE: 'note',
    };
  }

  /**
   * Log a shipment event with full details
   */
  logEvent(shipment, eventType, details = {}) {
    if (!shipment.eventLog) {
      shipment.eventLog = [];
    }

    const event = {
      id: Math.random().toString(36).slice(2, 10),
      type: eventType,
      timestamp: Date.now(),
      location: details.location || shipment.currentPos,
      details: {
        previous_status: details.previousStatus,
        current_status: details.currentStatus || shipment.status,
        message: details.message || '',
        driver_id: details.driverId || shipment.driverId,
        latitude: details.latitude || shipment.currentPos.lat,
        longitude: details.longitude || shipment.currentPos.lng,
        reason: details.reason || '',
        resolution: details.resolution || '',
        notes: details.notes || '',
        ...details,
      },
    };

    shipment.eventLog.push(event);
    return event;
  }

  /**
   * Log status change
   */
  logStatusChange(shipment, newStatus, details = {}) {
    return this.logEvent(shipment, this.eventTypes.STATUS_CHANGE, {
      previousStatus: shipment.status,
      currentStatus: newStatus,
      message: `Status changed from ${shipment.status} to ${newStatus}`,
      ...details,
    });
  }

  /**
   * Log waypoint reached
   */
  logWaypointReached(shipment, waypoint) {
    return this.logEvent(shipment, this.eventTypes.WAYPOINT_REACHED, {
      message: `Reached waypoint: ${waypoint.type}`,
      waypoint_id: waypoint.id,
      waypoint_type: waypoint.type,
      waypoint_description: waypoint.description,
      latitude: waypoint.position.lat,
      longitude: waypoint.position.lng,
    });
  }

  /**
   * Log delay
   */
  logDelay(shipment, delayMinutes, reason = '') {
    return this.logEvent(shipment, this.eventTypes.DELAY, {
      message: `Delay detected: ${delayMinutes} minutes`,
      delay_minutes: delayMinutes,
      reason: reason || 'Unspecified',
      original_eta: shipment.waypoints?.current?.eta || null,
      updated_eta: Date.now() + (delayMinutes * 60 * 1000),
    });
  }

  /**
   * Log exception/incident
   */
  logException(shipment, exceptionType, details = {}) {
    return this.logEvent(shipment, this.eventTypes.EXCEPTION, {
      message: `Exception: ${exceptionType}`,
      exception_type: exceptionType,
      severity: details.severity || 'medium', // low, medium, high, critical
      resolved: false,
      resolution: '',
      action_taken: details.actionTaken || '',
      ...details,
    });
  }

  /**
   * Log delivery attempt
   */
  logDeliveryAttempt(shipment, attemptNumber, result = 'pending', reason = '') {
    return this.logEvent(shipment, this.eventTypes.DELIVERY_ATTEMPT, {
      message: `Delivery attempt #${attemptNumber}: ${result}`,
      attempt_number: attemptNumber,
      result: result, // pending, success, failed, rescheduled
      reason: reason,
      recipient_response: '',
    });
  }

  /**
   * Log location update
   */
  logLocationUpdate(shipment, latitude, longitude, accuracy = null) {
    return this.logEvent(shipment, this.eventTypes.LOCATION_UPDATE, {
      message: 'Location updated',
      latitude,
      longitude,
      accuracy_meters: accuracy,
    });
  }

  /**
   * Log handoff (driver change, carrier change, etc.)
   */
  logHandoff(shipment, fromDetails, toDetails) {
    return this.logEvent(shipment, this.eventTypes.HANDOFF, {
      message: `Handoff: ${fromDetails.name || 'Unknown'} → ${toDetails.name || 'Unknown'}`,
      from_driver_id: fromDetails.id,
      from_driver_name: fromDetails.name,
      from_vehicle: fromDetails.vehicle,
      to_driver_id: toDetails.id,
      to_driver_name: toDetails.name,
      to_vehicle: toDetails.vehicle,
    });
  }

  /**
   * Log custom note
   */
  logNote(shipment, note, author = 'System') {
    return this.logEvent(shipment, this.eventTypes.NOTE, {
      message: note,
      author,
      note_text: note,
    });
  }

  /**
   * Get all events of a specific type
   */
  getEventsByType(shipment, eventType) {
    if (!shipment.eventLog) return [];
    return shipment.eventLog.filter(e => e.type === eventType);
  }

  /**
   * Get events within date range
   */
  getEventsByDateRange(shipment, startTime, endTime) {
    if (!shipment.eventLog) return [];
    return shipment.eventLog.filter(
      e => e.timestamp >= startTime && e.timestamp <= endTime
    );
  }

  /**
   * Get delay summary
   */
  getDelaySummary(shipment) {
    const delays = this.getEventsByType(shipment, this.eventTypes.DELAY);
    if (!delays.length) return null;

    const totalDelay = delays.reduce((sum, d) => sum + (d.details.delay_minutes || 0), 0);
    return {
      total_delays: delays.length,
      total_minutes: totalDelay,
      latest_reason: delays[delays.length - 1]?.details.reason,
      last_updated: delays[delays.length - 1]?.timestamp,
    };
  }

  /**
   * Get exception summary
   */
  getExceptionSummary(shipment) {
    const exceptions = this.getEventsByType(shipment, this.eventTypes.EXCEPTION);
    if (!exceptions.length) return null;

    const unresolved = exceptions.filter(e => !e.details.resolved);
    return {
      total_exceptions: exceptions.length,
      unresolved_count: unresolved.length,
      types: [...new Set(exceptions.map(e => e.details.exception_type))],
      latest: exceptions[exceptions.length - 1],
    };
  }

  /**
   * Get delivery attempts
   */
  getDeliveryAttempts(shipment) {
    return this.getEventsByType(shipment, this.eventTypes.DELIVERY_ATTEMPT);
  }

  /**
   * Get timeline summary for display
   */
  getTimeline(shipment) {
    if (!shipment.eventLog) return [];

    return shipment.eventLog
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(event => ({
        timestamp: event.timestamp,
        type: event.type,
        message: event.details.message || '',
        status: event.details.current_status,
        location: event.details.latitude ? 
          `${event.details.latitude.toFixed(4)}, ${event.details.longitude.toFixed(4)}` : 
          '',
        details: event.details,
      }));
  }

  /**
   * Resolve an exception
   */
  resolveException(shipment, exceptionId, resolution = '') {
    if (!shipment.eventLog) return null;

    const event = shipment.eventLog.find(
      e => e.type === this.eventTypes.EXCEPTION && e.id === exceptionId
    );

    if (event) {
      event.details.resolved = true;
      event.details.resolution = resolution;
      event.details.resolved_at = Date.now();
    }

    return event;
  }

  /**
   * Export event log as JSON
   */
  exportEventLog(shipment) {
    return JSON.stringify({
      tracking_number: shipment.trackingNumber,
      exported_at: new Date().toISOString(),
      events: shipment.eventLog || [],
    }, null, 2);
  }
}

// Export singleton instance
window.EventLogger = new EventLogger();
