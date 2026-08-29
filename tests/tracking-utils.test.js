const assert = require('node:assert/strict');
const test = require('node:test');
const { normalizeTrackingNumber, normalizePhoneNumber, matchesShipmentIdentifier } = require('../js/tracking-utils.js');

const shipment = {
  trackingNumber: 'SC100234567',
  receiver: { name: 'Jane Smith', email: 'jane@example.com', phone: '+1 (415) 555-0187' }
};

test('tracking number normalization keeps the shipment prefix', () => {
  assert.equal(normalizeTrackingNumber('sc100234567'), 'SC100234567');
  assert.equal(normalizeTrackingNumber('100234567'), 'SC100234567');
});

test('phone normalization strips formatting before comparison', () => {
  assert.equal(normalizePhoneNumber('+1 (415) 555-0187'), '14155550187');
});

test('shipment lookup matches by phone and tracking number', () => {
  assert.equal(matchesShipmentIdentifier(shipment, 'SC100234567'), true);
  assert.equal(matchesShipmentIdentifier(shipment, '+1 (415) 555-0187'), true);
  assert.equal(matchesShipmentIdentifier(shipment, '4155550187'), true);
  assert.equal(matchesShipmentIdentifier(shipment, 'SC999999999'), false);
});

const fs = require('node:fs');
const path = require('node:path');

test('admin shipment form includes a receiver phone field and stores it', () => {
  const appSource = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
  assert.match(appSource, /id="ns-phone"/);
  assert.match(appSource, /receiver:\s*\{\s*name:receiver,\s*city:dest,\s*email,\s*phone\s*\}/);
});
