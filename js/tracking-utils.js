(function(){
  function normalizeTrackingNumber(raw){
    if(!raw) return '';
    let val = String(raw).trim().toUpperCase();
    if(!val) return '';
    const digits = val.replace(/[^0-9]/g, '');
    if(/^SC\d+/.test(val)) return val;
    if(digits) return 'SC' + digits;
    return '';
  }

  function normalizePhoneNumber(raw){
    if(!raw) return '';
    return String(raw).replace(/\D/g, '');
  }

  function matchesShipmentIdentifier(shipment, query){
    if(!shipment || !query) return false;
    const identifier = String(query).trim();
    if(!identifier) return false;

    const normalizedTracking = normalizeTrackingNumber(identifier);
    const normalizedPhone = normalizePhoneNumber(identifier);
    const shipmentTracking = normalizeTrackingNumber(shipment?.trackingNumber || '');
    if(shipmentTracking && normalizedTracking && shipmentTracking === normalizedTracking) return true;

    const receiver = shipment?.receiver || {};
    const shipmentPhone = normalizePhoneNumber(receiver.phone || receiver.phoneNumber || receiver.phone_number || receiver.mobile || '');
    if(!shipmentPhone || !normalizedPhone) return false;
    return shipmentPhone.includes(normalizedPhone) || normalizedPhone.includes(shipmentPhone);
  }

  const api = { normalizeTrackingNumber, normalizePhoneNumber, matchesShipmentIdentifier };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  if (typeof window !== 'undefined') {
    window.SwiftTrackingUtils = api;
  }
})();
