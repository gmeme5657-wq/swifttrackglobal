/* ============================================================
   DATA
============================================================ */
// Global error handlers — display visible messages to help diagnose runtime failures
window.addEventListener('error', function(e){
  try{ showToast && showToast('JavaScript error occurred — see console', 'error', 6000); }catch(err){}
  try{
    function isOurErrorObj(o){
      try{
        if(!o) return false;
        if(typeof o==='string') return o.includes('app.js') || o.includes('swift-courier');
        if(o instanceof Error) return !!(o.stack && o.stack.indexOf('app.js')!==-1);
        if(o && o.stack) return String(o.stack).indexOf('app.js')!==-1;
        if(o && o.message) return String(o.message).indexOf('app.js')!==-1;
        return false;
      }catch(ex){return false;}
    }
    const reason = e && (e.error || e.message || e);
    const showOverlay = isOurErrorObj(reason) || window.location.search.indexOf('showErrors=true')!==-1 || getDebugErrorsEnabled();
    if(showOverlay){
      const existing = document.querySelector('.app-error'); if(existing) existing.remove();
      const ov = document.createElement('div'); ov.className='app-error';
      const msg = (e && (e.message || e.toString())) || 'Unknown error';
      ov.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;"><div>JavaScript error: ${escapeHtml(msg)}</div><button aria-label="dismiss" class="app-error-close">Dismiss</button></div>`;
      document.body.appendChild(ov);
      ov.querySelector('.app-error-close').addEventListener('click', ()=>ov.remove());
    }
  }catch(err){}
  console.error('JS error', e.error || e.message || e);
});
window.addEventListener('unhandledrejection', function(e){
  try{ showToast && showToast('Unhandled promise rejection — see console', 'error', 4000); }catch(err){}
  try{
    function isOurErrorObj(o){
      try{
        if(!o) return false;
        if(typeof o==='string') return o.includes('app.js') || o.includes('swift-courier');
        if(o instanceof Error) return !!(o.stack && o.stack.indexOf('app.js')!==-1);
        if(o && o.stack) return String(o.stack).indexOf('app.js')!==-1;
        if(o && o.message) return String(o.message).indexOf('app.js')!==-1;
        return false;
      }catch(ex){return false;}
    }
    const reason = e && e.reason ? e.reason : null;
    const showOverlay = isOurErrorObj(reason) || window.location.search.indexOf('showErrors=true')!==-1 || getDebugErrorsEnabled();
    if(showOverlay){
      const existing = document.querySelector('.app-error'); if(existing) existing.remove();
      const reasonText = reason && (reason.message || String(reason)) || 'Unknown reason';
      const ov = document.createElement('div'); ov.className='app-error';
      ov.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;"><div>Unhandled promise rejection: ${escapeHtml(reasonText)}</div><button aria-label="dismiss" class="app-error-close">Dismiss</button></div>`;
      document.body.appendChild(ov);
      ov.querySelector('.app-error-close').addEventListener('click', ()=>ov.remove());
    } else {
      // Non-fatal/unrelated rejections: log a warning but don't disrupt the UI
      console.warn('Ignored non-app unhandled rejection:', reason);
    }
  }catch(err){}
  console.error('Unhandled rejection', e.reason);
});

const CITIES = {
  "Montgomery, AL":{lat:32.3777,lng:-86.3006},
  "Juneau, AK":{lat:58.3019,lng:-134.4197},
  "Little Rock, AR":{lat:34.7465,lng:-92.2896},
  "Hartford, CT":{lat:41.7640,lng:-72.6820},
  "Dover, DE":{lat:39.1573,lng:-75.5197},
  "New York, NY":{lat:40.7128,lng:-74.0060},
  "Sacramento, CA":{lat:38.5767,lng:-121.4944},
  "Chicago, IL":{lat:41.8781,lng:-87.6298},
  "Indianapolis, IN":{lat:39.7686,lng:-86.1626},
  "Des Moines, IA":{lat:41.5911,lng:-93.6037},
  "Topeka, KS":{lat:39.0482,lng:-95.6779},
  "Frankfort, KY":{lat:38.1867,lng:-84.8753},
  "Baton Rouge, LA":{lat:30.4571,lng:-91.1874},
  "Augusta, ME":{lat:44.3072,lng:-69.7817},
  "Annapolis, MD":{lat:38.9784,lng:-76.4922},
  "Boston, MA":{lat:42.3582,lng:-71.0637},
  "Lansing, MI":{lat:42.7336,lng:-84.5553},
  "Saint Paul, MN":{lat:44.9551,lng:-93.1022},
  "Jackson, MS":{lat:32.3038,lng:-90.1821},
  "Jefferson City, MO":{lat:38.5792,lng:-92.1729},
  "Helena, MT":{lat:46.5857,lng:-112.0184},
  "Lincoln, NE":{lat:40.8081,lng:-96.6997},
  "Carson City, NV":{lat:39.1638,lng:-119.7661},
  "Concord, NH":{lat:43.2067,lng:-71.5371},
  "Trenton, NJ":{lat:40.2206,lng:-74.7699},
  "Santa Fe, NM":{lat:35.6822,lng:-105.9397},
  "Albany, NY":{lat:42.6528,lng:-73.7579},
  "Raleigh, NC":{lat:35.7804,lng:-78.6391},
  "Bismarck, ND":{lat:46.8209,lng:-100.7833},
  "Columbus, OH":{lat:39.9612,lng:-82.9988},
  "Oklahoma City, OK":{lat:35.4922,lng:-97.5033},
  "Salem, OR":{lat:44.9385,lng:-123.0304},
  "Harrisburg, PA":{lat:40.2644,lng:-76.8836},
  "Providence, RI":{lat:41.8309,lng:-71.4149},
  "Columbia, SC":{lat:34.0003,lng:-81.0332},
  "Pierre, SD":{lat:44.3670,lng:-100.3464},
  "Nashville, TN":{lat:36.1658,lng:-86.7842},
  "Salt Lake City, UT":{lat:40.7774,lng:-111.8882},
  "Montpelier, VT":{lat:44.2624,lng:-72.5805},
  "Richmond, VA":{lat:37.5389,lng:-77.4336},
  "Olympia, WA":{lat:47.0358,lng:-122.9050},
  "Charleston, WV":{lat:38.3362,lng:-81.6123},
  "Madison, WI":{lat:43.0747,lng:-89.3844},
  "Cheyenne, WY":{lat:41.1403,lng:-104.8202},
  "Los Angeles, CA":{lat:34.0522,lng:-118.2437},
  "Houston, TX":{lat:29.7604,lng:-95.3698},
  "Phoenix, AZ":{lat:33.4484,lng:-112.0740},
  "Denver, CO":{lat:39.7392,lng:-104.9903},
  "Atlanta, GA":{lat:33.7490,lng:-84.3880},
  "Seattle, WA":{lat:47.6062,lng:-122.3321},
  "Miami, FL":{lat:25.7617,lng:-80.1918},
  "Dallas, TX":{lat:32.7767,lng:-96.7970},
  "Honolulu, HI":{lat:21.3070,lng:-157.8584},
  "Boise, ID":{lat:43.6178,lng:-116.1997},
  "Toronto, ON":{lat:43.6532,lng:-79.3832},
  "Vancouver, BC":{lat:49.2827,lng:-123.1207},
  "Montreal, QC":{lat:45.5017,lng:-73.5673},
  "Calgary, AB":{lat:51.0447,lng:-114.0719},
  "Ottawa, ON":{lat:45.4215,lng:-75.6972},
  "Canada":{lat:56.1304,lng:-106.3468},
  "Mexico City, MX":{lat:19.4326,lng:-99.1332},
  "Guadalajara, MX":{lat:20.6597,lng:-103.3496},
  "Monterrey, MX":{lat:25.6866,lng:-100.3161},
  "Bogota, CO":{lat:4.7110,lng:-74.0721},
  "Lima, PE":{lat:-12.0464,lng:-77.0428},
  "Sao Paulo, BR":{lat:-23.5505,lng:-46.6333},
  "Buenos Aires, AR":{lat:-34.6037,lng:-58.3816},
  "Santiago, CL":{lat:-33.4489,lng:-70.6693},
  "Panama City, PA":{lat:8.9824,lng:-79.5199},
  "San Jose, CR":{lat:9.9281,lng:-84.0907},
  "Caracas, VE":{lat:10.4806,lng:-66.9036}
};
const STATUS_STEPS = ["Order Placed","Picked Up","In Transit","Out for Delivery","Delivered"];
const CARGO_ITEM_TYPES = ["Goods","Puppy","Pet","Documents","Equipment","Fragile","Perishable","Other"];

function lerp(a,b,t){return a+(b-a)*t;}
function dist(a,b){return Math.hypot(a.lat-b.lat,a.lng-b.lng);}
function fmtTime(ts){const d=new Date(ts);return d.toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});}
function fmtDateShort(ts){const d=new Date(ts);return d.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});}
function fmtDateCompact(ts){const d=new Date(ts);return d.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});}
function getShipmentDate(shipment, status){
  if(!shipment || !shipment.statusHistory || !shipment.statusHistory.length) return null;
  const match = [...shipment.statusHistory].reverse().find(item => item && item.status === status);
  return match ? match.timestamp : null;
}
function statusClass(s){return 'status-'+s.replace(/\s+/g,'-');}
function initials(name){return name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();}
function genTracking(){return 'SC'+Math.floor(100000000+Math.random()*899999999);}
function money(value){return '$'+Number(value || 0).toFixed(2);}

function generateTemplates(n){
  const cityNames = Object.keys(CITIES);
  const templates = [];
  for(let i=1;i<=n;i++){
    let a = cityNames[Math.floor(Math.random()*cityNames.length)];
    let b = cityNames[Math.floor(Math.random()*cityNames.length)];
    while(b===a) b = cityNames[Math.floor(Math.random()*cityNames.length)];
    templates.push({id:i, senderName:`Template ${i}`, originCity:a, destCity:b, note:`${a} → ${b}`});
  }
  return templates;
}
function progressPct(status){
  const i = STATUS_STEPS.indexOf(status);
  if(i<0) return 0;
  return (i/(STATUS_STEPS.length-1))*100;
}

let DATA = null; // {shipments, drivers, notifications}
let isAdminAuthed = false;
let trackMapInstance=null, trackMapMarker=null, trackMapLine=null;
let adminMapInstance=null, adminMapLayer=null;
let currentTrackingNumber=null;
let saveTimer=null;

function seedData(){
  const now = Date.now();
  const shipments = [
    mkShipment("SC100234567","Order Placed","New York, NY","Chicago, IL", -0.001, "d2", now-1000*60*60*30, "amelia.ross@example.com"),
    mkShipment("SC100234568","Order Placed","Los Angeles, CA","Phoenix, AZ", -0.001, "d3", now-1000*60*60*10, "n.patel@example.com"),
    mkShipment("SC100234569","Order Placed","Houston, TX","Dallas, TX", -0.001, null, now-1000*60*60*72, "j.moore@example.com"),
    mkShipment("SC100234570","Order Placed","Seattle, WA","Denver, CO", -0.001, null, now-1000*60*60*4, ""),
    mkShipment("SC100234571","Order Placed","Atlanta, GA","Miami, FL", -0.001, null, now-1000*60*30, "")
  ];
  // advance a few to realistic mid-flight statuses with history
  advanceTo(shipments[0], "In Transit", now);
  shipments[0].driverId = "d2";
  advanceTo(shipments[1], "Out for Delivery", now);
  shipments[1].driverId = "d3";
  advanceTo(shipments[2], "Delivered", now);
  advanceTo(shipments[3], "Picked Up", now);

  const drivers = [
    {id:"d1",name:"Marcus Bell",phone:"(212) 555-0148",vehicle:"Sprinter Van · NY-2281",status:"Available",pos:{...CITIES["New York, NY"]},assignedShipmentId:null},
    {id:"d2",name:"Priya Nair",phone:"(312) 555-0173",vehicle:"Box Truck · IL-4402",status:"On Delivery",pos:midpoint(CITIES["New York, NY"],CITIES["Chicago, IL"],0.55),assignedShipmentId:"SC100234567"},
    {id:"d3",name:"Diego Ruiz",phone:"(602) 555-0199",vehicle:"Sprinter Van · CA-7761",status:"On Delivery",pos:midpoint(CITIES["Los Angeles, CA"],CITIES["Phoenix, AZ"],0.8),assignedShipmentId:"SC100234568"},
    {id:"d4",name:"Hana Kim",phone:"(303) 555-0110",vehicle:"Box Truck · CO-1190",status:"Off Duty",pos:{...CITIES["Denver, CO"]},assignedShipmentId:null}
  ];

  shipments[0].currentPos = {...drivers[1].pos};
  shipments[1].currentPos = {...drivers[2].pos};

  const notifications = [
    {id:cryptoId(),trackingNumber:"SC100234569",type:"Delivered",recipientEmail:"j.moore@example.com",subject:"Your package has been delivered",timestamp:now-1000*60*60*20},
    {id:cryptoId(),trackingNumber:"SC100234567",type:"In Transit",recipientEmail:"amelia.ross@example.com",subject:"Your package is on its way",timestamp:now-1000*60*60*26}
  ];

  // generate template pool (40 ready-to-use routes across the Americas)
  const cityNames = Object.keys(CITIES);
  function genTemplate(id){
    // pick two different cities
    let a = cityNames[Math.floor(Math.random()*cityNames.length)];
    let b = cityNames[Math.floor(Math.random()*cityNames.length)];
    while(b===a){ b = cityNames[Math.floor(Math.random()*cityNames.length)]; }
    return {id:id, senderName:`Template ${id}`, originCity:a, destCity:b, note:`${a} → ${b}`};
  }
  const templates = [];
  for(let i=1;i<=40;i++) templates.push(genTemplate(i));

  return {shipments, drivers, notifications, templates};
}

function cryptoId(){return Math.random().toString(36).slice(2,10);}

function midpoint(a,b,t){return {lat:lerp(a.lat,b.lat,t), lng:lerp(a.lng,b.lng,t)};}

function mkShipment(tracking,status,originCity,destCity,_unused,driverId,createdAt,email){
  const phoneList = [
    '+1 (415) 555-0148',
    '+1 (646) 555-0172',
    '+1 (310) 555-0191',
    '+1 (713) 555-0124',
    '+1 (206) 555-0117',
    '+1 (404) 555-0166'
  ];
  const phone = phoneList[Math.abs((tracking.split('').reduce((sum,ch)=>sum + ch.charCodeAt(0), 0) + Math.floor((createdAt || Date.now()) / 1000)) % phoneList.length)];
  return {
    trackingNumber:tracking,
    packageName:"Shipment "+tracking,
    status:"Order Placed",
    sender:{name:"Warehouse — "+originCity, city:originCity},
    receiver:{name:"Recipient", city:destCity, email:email||"", phone:phone},
    origin:{city:originCity, ...CITIES[originCity]},
    destination:{city:destCity, ...CITIES[destCity]},
    currentPos:{...CITIES[originCity]},
    driverId: null,
    createdAt: createdAt||Date.now(),
    statusHistory:[{status:"Order Placed",timestamp:createdAt||Date.now(),location:originCity}]
  };
}

function advanceTo(shipment,targetStatus,now){
  const idx = STATUS_STEPS.indexOf(targetStatus);
  for(let i=1;i<=idx;i++){
    const st = STATUS_STEPS[i];
    shipment.status = st;
    const t = now - (idx-i)*1000*60*60*6;
    shipment.statusHistory.push({status:st, timestamp:t, location: i===idx ? "En route" : shipment.origin.city});
  }
  if(targetStatus==="Delivered"){
    shipment.currentPos = {...shipment.destination};
  } else if(idx>=2){
    const t = idx===2?0.4:0.8;
    shipment.currentPos = midpoint(shipment.origin, shipment.destination, t);
  }
}

/* ============================================================
   STORAGE
============================================================ */
/* Lightweight local "database": persists to the browser's localStorage under
   DB_KEY. Works fully offline / on any static host — no server required.
   For a production deployment, swap loadData()/persist() to call your API
   instead (see README.md, "Connecting a real backend"). */
const DB_KEY = 'swift-courier-db-v1';
function getDebugErrorsEnabled(){
  try{return localStorage.getItem('swift.debugErrors')==='1';}catch(error){return false;}
}
function readLocalData(){
  try{return localStorage.getItem(DB_KEY);}catch(error){
    console.warn('Browser storage is unavailable; using in-memory data.', error);
    return null;
  }
}
function writeLocalData(value){
  try{localStorage.setItem(DB_KEY,value);return true;}catch(error){
    console.error('Local browser storage is unavailable; changes will last only for this session.', error);
    showToast('Browser storage is unavailable; changes may not persist.', 'error', 5000);
    return false;
  }
}

async function loadData(){
  try{
    const raw = readLocalData();
    if(raw){
      DATA = JSON.parse(raw);
      // ensure templates exist for backwards compatibility
      if(!DATA.templates) DATA.templates = generateTemplates(40);
      return;
    }
  }catch(e){ /* corrupt or unavailable, fall through to reseed */ }
  DATA = seedData();
  await persist(true);
}

async function persist(force){
  if(!force){
    clearTimeout(saveTimer);
    saveTimer = setTimeout(()=>persist(true), 800);
    return;
  }
  try{
    writeLocalData(JSON.stringify(DATA));
    if(window.SwiftBackend?.ready) {
      Promise.all(DATA.shipments.map(shipment=>window.SwiftBackend.upsertShipment(shipment)))
        .catch(error=>console.error('cloud shipment sync failed', error));
    }
  }catch(e){ console.error('local database save failed', e); }
}

function cloudShipmentToLocal(row){
  if(!row) return null;
  const existing = DATA && DATA.shipments.find(s=>s.trackingNumber===row.tracking_number);
  const shipment = {
    ...(existing||{}),
    id:row.id,
    trackingNumber:row.tracking_number,
    status:row.status||'Order Placed',
    sender:{...(existing?.sender||{}),name:row.sender_name||'Warehouse',address:row.sender_address||'',city:row.origin_city||''},
    receiver:{...(existing?.receiver||{}),name:row.receiver_name||'Recipient',email:row.receiver_email||'',phone:row.receiver_phone||'',address:row.receiver_address||''},
    origin:{city:row.origin_city||'',lat:Number(row.origin_lat),lng:Number(row.origin_lng)},
    destination:{city:row.destination_city||'',lat:Number(row.destination_lat),lng:Number(row.destination_lng)},
    currentPos:{lat:Number(row.current_lat),lng:Number(row.current_lng)},
    driverId:row.driver_id||existing?.driverId||null,
    createdAt:row.created_at ? new Date(row.created_at).getTime() : (existing?.createdAt||Date.now()),
    statusHistory:existing?.statusHistory||[{status:row.status||'Order Placed',timestamp:Date.now(),location:row.origin_city||''}]
  };
  const last=shipment.statusHistory[shipment.statusHistory.length-1];
  if(!last || last.status!==shipment.status) shipment.statusHistory.push({status:shipment.status,timestamp:row.updated_at?new Date(row.updated_at).getTime():Date.now(),location:row.destination_city||''});
  return shipment;
}

async function loadCloudTracking(trackingNumber){
  let row=null;
  if(window.SwiftClientApi && window.SWIFT_BACKEND_API){
    const result=await window.SwiftClientApi.track(trackingNumber);
    row=result?.shipment||null;
  } else if(window.SwiftBackend?.ready){
    row=await window.SwiftBackend.getShipmentByTracking(trackingNumber);
  }
  if(!row) return null;
  const shipment=cloudShipmentToLocal(row);
  const index=DATA.shipments.findIndex(s=>s.trackingNumber===trackingNumber);
  if(index>=0) DATA.shipments[index]=shipment; else DATA.shipments.unshift(shipment);
  return shipment;
}

function subscribeToCloudShipments(){
  if(!window.SwiftBackend?.ready || window._swiftShipmentSubscription) return;
  window._swiftShipmentSubscription=window.SwiftBackend.subscribeShipments(payload=>{
    if(payload.eventType==='DELETE'){
      const deleted=payload.old;
      const deletedIndex=DATA.shipments.findIndex(s=>s.id===deleted?.id || s.trackingNumber===deleted?.tracking_number);
      if(deletedIndex>=0) DATA.shipments.splice(deletedIndex,1);
      if(currentTrackingNumber && (currentTrackingNumber===deleted?.tracking_number || !DATA.shipments.some(s=>s.trackingNumber===currentTrackingNumber))){
        backHome();
      }
      if(document.getElementById('admin-shell') && !document.getElementById('admin-shell').hidden) renderAdminSub(currentAdminSub);
      return;
    }
    const shipment=cloudShipmentToLocal(payload.new);
    if(!shipment) return;
    const index=DATA.shipments.findIndex(s=>s.trackingNumber===shipment.trackingNumber);
    if(index>=0) DATA.shipments[index]=shipment; else DATA.shipments.unshift(shipment);
    if(currentTrackingNumber===shipment.trackingNumber) renderTrackView(currentTrackingNumber);
    if(document.getElementById('admin-shell') && !document.getElementById('admin-shell').hidden) renderAdminSub(currentAdminSub);
  });
}

/* ============================================================
   NAV
============================================================ */
document.querySelectorAll('.topnav button').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.topnav button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const toggle = document.querySelector('.nav-toggle');
    const wrap = document.querySelector('.topnav-wrap');
    if(toggle){ toggle.setAttribute('aria-expanded', 'false'); }
    if(wrap){ wrap.classList.remove('menu-open'); }

    const nav = btn.dataset.nav;
    if(nav === 'home'){
      showView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if(nav === 'tracking' || nav === 'services' || nav === 'policies' || nav === 'contact'){
      if(document.getElementById('view-track') && !document.getElementById('view-track').hidden){
        showView('home');
      }
      const targetId = nav === 'tracking' ? 'track-form-anchor' : nav;
      const target = document.getElementById(targetId);
      if(target){
        requestAnimationFrame(()=>{
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
      return;
    }

    showView(nav);
  });
});

function showView(name){
  const vHome = document.getElementById('view-home'); if(vHome) vHome.hidden = name!=='home';
  const vTrack = document.getElementById('view-track'); if(vTrack) vTrack.hidden = name!=='track';
  const vAdmin = document.getElementById('view-admin'); if(vAdmin) vAdmin.hidden = name!=='admin';
  if(name==='admin') renderAdmin();
  if(name==='home' && vTrack){ vTrack.hidden = true; }

  document.body.classList.remove('page-transition');
  void document.body.offsetWidth;
  document.body.classList.add('page-transition');
  setTimeout(()=> document.body.classList.remove('page-transition'), 240);
}

/* ============================================================
   HOME
============================================================ */
const _homeBtn = document.getElementById('home-track-btn');
const _homeInput = document.getElementById('home-track-input');
if(_homeBtn) _homeBtn.addEventListener('click', doHomeTrack);
if(_homeInput) _homeInput.addEventListener('keydown', e=>{ if(e.key==='Enter') doHomeTrack(); });

function normalizeTrackingNumber(raw){
  if(!raw) return '';
  let val = String(raw).trim().toUpperCase();
  if(!val) return '';
  if(/^SC\d+/.test(val)) return val;
  const digits = val.replace(/[^0-9]/g,'');
  if(digits) return 'SC' + digits;
  return '';
}

function normalizePhoneNumber(raw){
  if(!raw) return '';
  return String(raw).replace(/\D/g, '');
}

function shipmentMatchesIdentifier(shipment, query){
  if(!shipment || !query) return false;
  const text = String(query).trim();
  if(!text) return false;
  if(window.SwiftTrackingUtils?.matchesShipmentIdentifier) {
    return window.SwiftTrackingUtils.matchesShipmentIdentifier(shipment, text);
  }

  const normalizedTracking = normalizeTrackingNumber(text);
  if(normalizedTracking && normalizeTrackingNumber(shipment?.trackingNumber || '') === normalizedTracking) return true;

  const shipmentPhone = normalizePhoneNumber(shipment?.receiver?.phone || shipment?.receiver?.phoneNumber || shipment?.receiver?.phone_number || shipment?.receiver?.mobile || '');
  const queryPhone = normalizePhoneNumber(text);
  if(!shipmentPhone || !queryPhone) return false;
  return shipmentPhone.includes(queryPhone) || queryPhone.includes(shipmentPhone);
}

function doHomeTrack(){
  const el = document.getElementById('home-track-input');
  if(!el) return;
  const raw = el.value.trim();
  const val = normalizeTrackingNumber(raw);
  const phone = normalizePhoneNumber(raw);
  if(!val && !phone) return;
  const lookup = raw && !/^SC\d+/i.test(raw) && /\d/.test(raw) && !/^SC/i.test(raw) ? raw : val;
  goToTracking(lookup);
}

// Toast / snackbar helper
function showToast(msg, type='info', timeout=3000){
  let wrap = document.getElementById('toast-wrap');
  if(!wrap){ wrap = document.createElement('div'); wrap.id='toast-wrap'; wrap.className='toast-wrap'; document.body.appendChild(wrap); }
  const t = document.createElement('div'); t.className='toast '+(type||''); t.textContent = msg; wrap.appendChild(t);
  // show
  requestAnimationFrame(()=>t.classList.add('show'));
  const kill = ()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),220); };
  if(timeout>0) setTimeout(kill, timeout);
  return {dismiss:kill,el:t};
}

function goToTracking(trackingNumber){
  currentTrackingNumber = trackingNumber;
  document.querySelectorAll('.topnav button').forEach(b=>b.classList.remove('active'));
  showView('track');
  renderTrackView(trackingNumber);
}

/* ============================================================
   TRACK VIEW
============================================================ */
async function renderTrackView(trackingNumber){
  // Refresh shared browser storage so an order created in the admin tab is visible here.
  await loadData();
  const identifier = String(trackingNumber || '').trim();
  let s = DATA.shipments.find(x => shipmentMatchesIdentifier(x, identifier));
  if(window.SwiftBackend?.ready){
    try{
      const cloudMatch = await window.SwiftBackend.getShipmentByTracking(normalizeTrackingNumber(identifier));
      if(cloudMatch) {
        s = cloudShipmentToLocal(cloudMatch) || s;
      }
    }catch(error){
      console.error('cloud tracking load failed', error);
      showToast('Live tracking is temporarily unavailable. Showing cached data.', 'error', 3500);
    }
  }
  const el = document.getElementById('track-container');
  showToast('Searching '+identifier+'...', 'info', 1400);
  if(!s){
    el.innerHTML = `
      <button class="back-link" onclick="backHome()">← Back</button>
      <div class="not-found">
        <h2>No shipment found</h2>
        <p>We couldn't find a shipment matching "${escapeHtml(identifier)}". Double check the tracking number or phone number and try again.</p>
      </div>`;
    showToast('No shipment found: '+identifier, 'error', 3000);
    return;
  }
  currentTrackingNumber = s.trackingNumber;
  showToast('Shipment found — opening map', 'success', 1000);
  const displayStatusSteps = [
    {key:'Order Placed', label:'Order Received', date:getShipmentDate(s,'Order Placed')},
    {key:'Picked Up', label:'In Transit', date:getShipmentDate(s,'Picked Up')},
    {key:'In Transit', label:'On Sorting Center', date:getShipmentDate(s,'In Transit')},
    {key:'Out for Delivery', label:'On the Way', date:getShipmentDate(s,'Out for Delivery')},
    {key:'Delivered', label:'Delivered', date:getShipmentDate(s,'Delivered')}
  ];
  const stepIndex = displayStatusSteps.findIndex(step => step.key === s.status || step.label === s.status);
  const orderNumber = `#${String(s.trackingNumber).replace(/[^0-9]/g,'').slice(-6) || '000000'}`;
  const currentStatusText = s.status || 'Order Placed';
  const lastStep = s.statusHistory && s.statusHistory.length ? s.statusHistory[s.statusHistory.length - 1] : null;
  const locationText = getShipmentLocationText(s, lastStep);
  const itemRows = getShipmentItems(s);
  const subtotal = itemRows.reduce((sum,row)=>sum + row.price * row.qty, 0);
  const customerName = s.receiver.name || 'Jane Smith';
  const pickupLocation = s.sender.name || 'Warehouse';
  const pickupDate = fmtDateShort(s.createdAt || Date.now());
  const estDate = fmtDateShort(new Date((s.createdAt || Date.now()) + 1000*60*60*24*8).getTime());

  el.innerHTML = `
    <button class="back-link" onclick="backHome()">← Track another package</button>
    <div class="track-shell">
      <div class="track-order-card">
        <div class="track-order-header">
          <div class="track-order-id">Order ${orderNumber}</div>
        </div>

        <div class="track-status-banner">
          <div class="track-status-badge">${currentStatusText}</div>
          <div class="track-status-copy">
            <span><strong>Current status:</strong> ${currentStatusText}</span>
            <span>Last updated: ${lastStep ? fmtTime(lastStep.timestamp) : 'Pending'}</span>
            <span>Location: ${escapeHtml(locationText)}</span>
          </div>
        </div>

        <div class="track-steps">
          ${displayStatusSteps.map((step, index) => {
            const isDone = index <= (stepIndex >= 0 ? stepIndex : 0);
            const isCurrent = index === (stepIndex >= 0 ? stepIndex : 0);
            return `
              <div class="track-step ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}">
                <div class="track-step-badge">${index + 1}</div>
                <div class="track-step-name">${step.label}</div>
                <div class="track-step-date">${step.date ? fmtDateCompact(step.date) : 'Pending'}</div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="track-info-row">
          <div class="track-info-box">
            <div class="track-box-title">Order Information</div>
            <div class="track-box-label">Pickup Date</div>
            <div class="track-box-value">${pickupDate}</div>
            <div class="track-box-label">Estimate Drop</div>
            <div class="track-box-value">${estDate}</div>
            <div class="track-box-label">Return / Refund</div>
            <div class="track-box-value">In 7 Days</div>
          </div>

          <div class="track-info-box">
            <div class="track-box-title">Locations</div>
            <div class="track-box-label">Pickup Location</div>
            <div class="track-box-value">${escapeHtml(pickupLocation)}</div>
            <div class="track-box-label">Dropoff Location</div>
            <div class="track-box-value">${escapeHtml(s.destination.city)}</div>
          </div>

          <div class="track-info-box">
            <div class="track-box-title">Customer Details</div>
            <div class="track-box-label">Full Name</div>
            <div class="track-box-value">${escapeHtml(customerName)}</div>
            <div class="track-box-label">Email</div>
            <div class="track-box-value">${escapeHtml(s.receiver.email || 'mail@padgone.com')}</div>
            <div class="track-box-label">Phone Number</div>
            <div class="track-box-value">${escapeHtml(s.receiver.phone || s.receiver.phoneNumber || s.receiver.phone_number || '+1 (000) 000-0000')}</div>
          </div>
        </div>

        ${itemRows.length ? `
          <div class="track-item-wrap">
            <div class="track-item-title">Item List</div>
            <table class="track-items">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Type</th>
                  <th>Item Name</th>
                  <th>Base Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemRows.map((row, idx) => `
                  <tr>
                    <td>${idx + 1}</td>
                    <td><span class="cargo-type">${escapeHtml(row.type)}</span></td>
                    <td class="item-name-cell"><span class="item-thumb" aria-hidden="true"></span>${escapeHtml(row.name)}</td>
                    <td>${money(row.price)}</td>
                    <td>${row.qty}</td>
                    <td>${money(row.price * row.qty)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="5" class="total-label">All total</td>
                  <td class="total-value">${money(subtotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        ` : ''}

        <div class="track-map-wrap">
          <div class="track-map-head">
            <div>
              <div class="track-box-title">Live Route Map</div>
              <div class="track-map-meta">${escapeHtml(s.origin.city)} to ${escapeHtml(s.destination.city)}</div>
            </div>
            <div class="track-map-coords mono">${formatCoords(s.currentPos)}</div>
          </div>
          <div id="track-map"></div>
          <div id="track-map-fallback" class="track-map-fallback" hidden></div>
        </div>
      </div>
    </div>
  `;

  initTrackMap(s);
  // ensure map is resized and centered after render
  setTimeout(()=>{
    if(trackMapInstance){
      try{ trackMapInstance.invalidateSize(); }catch(e){}
      if(trackMapMarker){
        try{ trackMapInstance.setView([s.currentPos.lat, s.currentPos.lng], trackMapInstance.getZoom()||8); }catch(e){}
        // briefly highlight marker
        try{ const iconEl = trackMapMarker._icon || (trackMapMarker.getElement && trackMapMarker.getElement()); if(iconEl){ iconEl.querySelector('.pulse-marker-outer')?.classList.add('highlight'); setTimeout(()=>{ iconEl.querySelector('.pulse-marker-outer')?.classList.remove('highlight'); }, 3500); } }catch(e){}
      }
    }
  }, 200);
}

function estDeliveryText(s){
  if(s.status==='Delivered') return 'Delivered';
  const created = s.createdAt;
  const est = created + 1000*60*60*48;
  return new Date(est).toLocaleDateString(undefined,{month:'short',day:'numeric'});
}

function saveTrackEmail(trackingNumber){
  const s = DATA.shipments.find(x=>x.trackingNumber===trackingNumber);
  const val = document.getElementById('track-email-input').value.trim();
  if(!s) return;
  s.receiver.email = val;
  document.getElementById('track-email-note').textContent = val ? `We'll notify ${val} on every status change.` : 'Add an email to receive delivery notifications.';
  persist();
}

function getShipmentItems(shipment){
  if(!shipment || !Array.isArray(shipment.items)) return [];
  return shipment.items
    .map(item => ({
      type: CARGO_ITEM_TYPES.includes(item.type) ? item.type : 'Goods',
      name: String(item.name || '').trim(),
      price: Number(item.price || 0),
      qty: Math.max(1, Math.floor(Number(item.qty || 1)))
    }))
    .filter(item => item.name && Number.isFinite(item.price) && item.price >= 0);
}

window.addEventListener('storage', e=>{
  if(e.key!==DB_KEY || !e.newValue) return;
  try{
    DATA = JSON.parse(e.newValue);
    if(!DATA.templates) DATA.templates = generateTemplates(40);
    if(currentTrackingNumber && !document.getElementById('view-track')?.hidden){
      renderTrackView(currentTrackingNumber);
    }
  }catch(error){ console.error('shared shipment update failed', error); }
});

function backHome(){
  document.querySelectorAll('.topnav button').forEach(b=>b.classList.toggle('active', b.dataset.nav==='home'));
  showView('home');
}

function formatCoords(pos){
  if(!pos || !Number.isFinite(pos.lat) || !Number.isFinite(pos.lng)) return 'Position pending';
  return `${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`;
}

function getShipmentLocationText(s, lastStep){
  if(!s) return 'Position pending';
  if(s.currentPos && Number.isFinite(s.currentPos.lat) && Number.isFinite(s.currentPos.lng)){
    return formatCoords(s.currentPos);
  }
  if(lastStep && lastStep.location) return lastStep.location;
  return s.origin && s.origin.city ? s.origin.city : 'Position pending';
}

function renderTrackMapFallback(s, message){
  const map = document.getElementById('track-map');
  const fallback = document.getElementById('track-map-fallback');
  if(map) map.hidden = true;
  if(!fallback) return;
  fallback.hidden = false;
  const status = s.status || 'Order Placed';
  fallback.innerHTML = `
    <div class="fallback-route">
      <div class="fallback-node">
        <span class="fallback-dot origin"></span>
        <strong>${escapeHtml(s.origin.city)}</strong>
        <small>Origin</small>
      </div>
      <div class="fallback-line">
        <span style="width:${Math.max(6, Math.min(100, progressPct(status)))}%"></span>
      </div>
      <div class="fallback-node">
        <span class="fallback-dot destination"></span>
        <strong>${escapeHtml(s.destination.city)}</strong>
        <small>Destination</small>
      </div>
    </div>
    <div class="fallback-details">
      <div><span>Status</span><strong>${escapeHtml(status)}</strong></div>
      <div><span>Live coordinates</span><strong class="mono">${formatCoords(s.currentPos)}</strong></div>
      <div><span>Map service</span><strong>${escapeHtml(message || 'Route view active')}</strong></div>
    </div>
  `;
}

function initTrackMap(s){
  const container = document.getElementById('track-map');
  if(!container) return;
  if(!s.currentPos || !Number.isFinite(s.currentPos.lat) || !Number.isFinite(s.currentPos.lng)){
    renderTrackMapFallback(s, 'Waiting for live position');
    return;
  }
  if(!window.L){
    renderTrackMapFallback(s, 'Loading interactive map');
    loadLeaflet(()=>initTrackMap(s));
    return;
  }
  if(trackMapInstance){ trackMapInstance.remove(); trackMapInstance=null; }
  try{
    const center = s.currentPos;
    trackMapInstance = L.map(container,{zoomControl:true,attributionControl:false}).setView([center.lat,center.lng], 5);
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
    tiles.on('tileerror', ()=>renderTrackMapFallback(s, 'Map tiles unavailable'));
    tiles.addTo(trackMapInstance);

    const line = L.polyline([[s.origin.lat,s.origin.lng],[s.destination.lat,s.destination.lng]], {color:'#1D6FE0',weight:2,dashArray:'6,7',opacity:.6}).addTo(trackMapInstance);
    L.circleMarker([s.origin.lat,s.origin.lng],{radius:5,color:'#5B6472',fillColor:'#fff',fillOpacity:1,weight:2}).addTo(trackMapInstance).bindTooltip(s.origin.city,{permanent:false});
    L.circleMarker([s.destination.lat,s.destination.lng],{radius:5,color:'#5B6472',fillColor:'#fff',fillOpacity:1,weight:2}).addTo(trackMapInstance).bindTooltip(s.destination.city,{permanent:false});

    const color = s.status==='Delivered' ? '#1B8A5A' : (s.status==='Out for Delivery' ? '#C98A1D' : '#1D6FE0');
    trackMapMarker = L.marker([s.currentPos.lat,s.currentPos.lng],{icon: pulseIcon(color)}).addTo(trackMapInstance);
    trackMapInstance.fitBounds(line.getBounds(),{padding:[40,40]});
    setTimeout(()=>trackMapInstance && trackMapInstance.invalidateSize(),150);
  }catch(error){
    console.error('track map failed', error);
    renderTrackMapFallback(s, 'Route fallback active');
  }
}

function loadLeaflet(onReady){
  if(window.L){onReady();return;}
  if(window._swiftLeafletLoading){window._swiftLeafletLoading.push(onReady);return;}
  window._swiftLeafletLoading=[onReady];
  const css=document.createElement('link');
  css.rel='stylesheet';
  css.href='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
  document.head.appendChild(css);
  const script=document.createElement('script');
  script.src='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
  script.async=true;
  const finish=()=>{const callbacks=window._swiftLeafletLoading||[];window._swiftLeafletLoading=null;callbacks.forEach(callback=>callback());};
  script.onload=finish;
  script.onerror=()=>{window._swiftLeafletLoading=null;};
  document.head.appendChild(script);
}

function pulseIcon(color){
  return L.divIcon({
    className:'',
    html:`<div class="pulse-marker-outer" style="position:relative;">
            <div class="ring" style="background:${color};"></div>
            <div class="core" style="background:${color};"></div>
          </div>`,
    iconSize:[20,20],
    iconAnchor:[10,10]
  });
}

/* ============================================================
   ADMIN — GATE
============================================================ */
function renderAdminGate(){
  document.getElementById('admin-gate-wrap').innerHTML = `
    <div class="admin-gate">
      <div class="brand-mark" style="background:var(--navy);"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><rect x="3" y="11" width="18" height="9" rx="1"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></div>
      <h3>Operations sign in</h3>
      <p style="font-size:13px;color:var(--text-muted);margin-top:6px;">Sign in to access the dispatch dashboard.</p>
      <input type="email" id="admin-email" placeholder="Owner email" autocomplete="username" />
      <input type="password" id="admin-pass" placeholder="Passcode" />
      <button class="btn-primary" style="width:100%;" onclick="tryAdminLogin()">Sign in</button>
      
    </div>`;
  document.getElementById('admin-pass').addEventListener('keydown',e=>{if(e.key==='Enter') tryAdminLogin();});
}

async function tryAdminLogin(){
  const email = document.getElementById('admin-email')?.value.trim();
  const val = document.getElementById('admin-pass').value;
  let authenticated = val==='admin221r' && !window.SwiftBackend?.ready;
  if(window.SwiftBackend?.ready){
    try{
      if(!email) throw Error('Enter the owner email.');
      const result=await window.SwiftBackend.signIn(email,val);
      if(result.error) throw result.error;
      authenticated=true;
    }catch(error){
      showToast(error.message||'Sign in failed.', 'error');
    }
  }
  if(authenticated){
    isAdminAuthed = true;
    document.getElementById('admin-gate-wrap').hidden = true;
    document.getElementById('admin-shell').hidden = false;
    renderAdminSub('overview');
  } else {
    const inp = document.getElementById('admin-pass');
    inp.style.borderColor='var(--red)';
    inp.value='';
    inp.placeholder='Incorrect passcode';
  }
}

let currentAdminSub = 'overview';
const _adminSidebar = document.getElementById('admin-sidebar');
if(_adminSidebar){
  _adminSidebar.addEventListener('click',e=>{
    const btn = e.target.closest('button[data-sub]');
    if(!btn) return;
    document.querySelectorAll('#admin-sidebar button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    renderAdminSub(btn.dataset.sub);
  });
}

function renderAdmin(){
  if(!isAdminAuthed){
    document.getElementById('admin-gate-wrap').hidden = false;
    document.getElementById('admin-shell').hidden = true;
    renderAdminGate();
  } else {
    document.getElementById('admin-gate-wrap').hidden = true;
    document.getElementById('admin-shell').hidden = false;
    renderAdminSub(currentAdminSub);
  }
}

function renderAdminSub(sub){
  currentAdminSub = sub;
  const main = document.getElementById('admin-main');
  if(sub==='overview') return renderOverview(main);
  if(sub==='shipments') return renderShipments(main);
  if(sub==='drivers') return renderDrivers(main);
  if(sub==='map') return renderAdminMap(main);
  if(sub==='notifications') return renderNotifications(main);
}

/* ---------- OVERVIEW ---------- */
function renderOverview(main){
  const active = DATA.shipments.filter(s=>s.status!=='Delivered').length;
  const transit = DATA.shipments.filter(s=>s.status==='In Transit'||s.status==='Out for Delivery').length;
  const driversOn = DATA.drivers.filter(d=>d.status!=='Off Duty').length;
  const delivered = DATA.shipments.filter(s=>s.status==='Delivered').length;
  const recent = [...DATA.shipments].sort((a,b)=>b.createdAt-a.createdAt).slice(0,5);

  main.innerHTML = `
    <div class="admin-header"><h2>Overview</h2><button class="btn-secondary" onclick="resetLocalData()">Reset local data</button></div>
    <div class="stat-row">
      <div class="stat-card"><div class="stat-num">${active}</div><div class="stat-label">Active shipments</div></div>
      <div class="stat-card"><div class="stat-num">${transit}</div><div class="stat-label">In transit</div></div>
      <div class="stat-card"><div class="stat-num">${driversOn}</div><div class="stat-label">Drivers on duty</div></div>
      <div class="stat-card"><div class="stat-num">${delivered}</div><div class="stat-label">Delivered</div></div>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Tracking #</th><th>Route</th><th>Status</th><th>Driver</th></tr></thead>
        <tbody>
          ${recent.map(s=>{
            const d = s.driverId ? DATA.drivers.find(x=>x.id===s.driverId) : null;
            return `<tr>
              <td class="mono">${s.trackingNumber}</td>
              <td>${s.origin.city.split(',')[0]} → ${s.destination.city.split(',')[0]}</td>
              <td><span class="status-pill ${statusClass(s.status)}"><span class="dot"></span>${s.status}</span></td>
              <td>${d?d.name:'—'}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/* ---------- SHIPMENTS ---------- */
function renderShipments(main){
  main.innerHTML = `
    <div class="admin-header"><h2>Shipments</h2><button class="btn-primary" onclick="openNewShipmentModal()">+ New shipment</button></div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Tracking #</th><th>Route</th><th>Cargo</th><th>Status</th><th>Driver</th><th>Actions</th></tr></thead>
        <tbody id="shipments-tbody"></tbody>
      </table>
    </div>
  `;
  const tbody = document.getElementById('shipments-tbody');
  tbody.innerHTML = DATA.shipments.map(s=>{
    const d = s.driverId ? DATA.drivers.find(x=>x.id===s.driverId) : null;
    const stepIdx = STATUS_STEPS.indexOf(s.status);
    const nextStatus = stepIdx<STATUS_STEPS.length-1 ? STATUS_STEPS[stepIdx+1] : null;
    const availableDrivers = DATA.drivers.filter(dr=>dr.status==='Available' || dr.id===s.driverId);
    return `<tr>
      <td class="mono"><a href="#" onclick="event.preventDefault();goToAdminTrackingView('${s.trackingNumber}')" style="color:var(--blue);text-decoration:none;font-weight:600;">${s.trackingNumber}</a></td>
      <td>${s.origin.city.split(',')[0]} → ${s.destination.city.split(',')[0]}</td>
      <td>${cargoSummary(s)}</td>
      <td><span class="status-pill ${statusClass(s.status)}"><span class="dot"></span>${s.status}</span></td>
      <td>
        <select onchange="assignDriver('${s.trackingNumber}', this.value)">
          <option value="">Unassigned</option>
          ${availableDrivers.map(dr=>`<option value="${dr.id}" ${dr.id===s.driverId?'selected':''}>${dr.name}</option>`).join('')}
        </select>
      </td>
      <td class="row-actions">
        ${nextStatus?`<button class="advance" onclick="advanceShipment('${s.trackingNumber}')">Mark ${nextStatus}</button>`:''}
        <button onclick="openShipmentItemsModal('${s.trackingNumber}')">Items</button>
        <button onclick="markException('${s.trackingNumber}')">Flag issue</button>
        <button class="danger" onclick="deleteShipment('${s.trackingNumber}')">Delete</button>
      </td>
    </tr>`;
  }).join('');
}

async function deleteShipment(trackingNumber){
  const shipment=DATA.shipments.find(s=>s.trackingNumber===trackingNumber);
  if(!shipment) return;
  if(!confirm(`Delete shipment ${trackingNumber}? This cannot be undone.`)) return;
  const driver=shipment.driverId ? DATA.drivers.find(d=>d.id===shipment.driverId) : null;
  if(driver){
    driver.status='Available';
    driver.assignedShipmentId=null;
  }
  DATA.shipments=DATA.shipments.filter(s=>s.trackingNumber!==trackingNumber);
  try{
    if(window.SwiftBackend?.ready && shipment.id) await window.SwiftBackend.deleteShipment(shipment.id);
    await persist(true);
    renderAdminSub(currentAdminSub);
    if(currentTrackingNumber===trackingNumber) backHome();
    showToast(`Shipment ${trackingNumber} deleted.`, 'success');
  }catch(error){
    DATA.shipments.unshift(shipment);
    if(driver){
      driver.status='On Delivery';
      driver.assignedShipmentId=trackingNumber;
    }
    await persist(true);
    renderAdminSub(currentAdminSub);
    showToast(error.message||'Could not delete shipment.', 'error');
  }
}

function cargoSummary(shipment){
  const items = getShipmentItems(shipment);
  if(!items.length) return '<span class="cargo-empty">No items set</span>';
  const total = items.reduce((sum,item)=>sum + item.price * item.qty, 0);
  const names = items.slice(0,2).map(item => `${escapeHtml(item.type)}: ${escapeHtml(item.name)}`).join('<br>');
  const more = items.length > 2 ? `<br><span class="cargo-empty">+${items.length - 2} more</span>` : '';
  return `<span class="cargo-summary">${names}${more}<br><strong>${items.length} item${items.length === 1 ? '' : 's'} · ${money(total)}</strong></span>`;
}

function cargoTypeOptions(selected){
  return CARGO_ITEM_TYPES.map(type => `<option value="${type}" ${type === selected ? 'selected' : ''}>${type}</option>`).join('');
}

function shipmentItemRow(item){
  const normalized = item || {};
  const type = CARGO_ITEM_TYPES.includes(normalized.type) ? normalized.type : 'Goods';
  const name = escapeHtml(normalized.name || '');
  const qty = normalized.qty ? Math.max(1, Math.floor(Number(normalized.qty))) : 1;
  const price = Number.isFinite(Number(normalized.price)) && Number(normalized.price) > 0 ? Number(normalized.price).toFixed(2) : '';
  return `
    <div class="cargo-item-row">
      <div class="field cargo-type-field"><label>Type</label><select class="cargo-item-type">${cargoTypeOptions(type)}</select></div>
      <div class="field cargo-name-field"><label>Item name</label><input class="cargo-item-name" placeholder="Puppy, crate, laptop, documents" value="${name}"></div>
      <div class="field cargo-price-field"><label>Price</label><input class="cargo-item-price" type="number" min="0" step="0.01" placeholder="0.00" value="${price}"></div>
      <div class="field cargo-qty-field"><label>Qty</label><input class="cargo-item-qty" type="number" min="1" step="1" value="${qty}"></div>
      <button class="cargo-remove-btn" type="button" onclick="removeShipmentItemRow(this)">Remove</button>
    </div>
  `;
}

function addShipmentItemRow(targetId, item){
  const body = document.getElementById(targetId || 'ns-items-body');
  if(!body) return;
  body.insertAdjacentHTML('beforeend', shipmentItemRow(item));
}

function removeShipmentItemRow(button){
  const row = button ? button.closest('.cargo-item-row') : null;
  if(row) row.remove();
}

function collectShipmentItems(targetId){
  const body = document.getElementById(targetId);
  if(!body) return [];
  const items = [];
  const rows = Array.from(body.querySelectorAll('.cargo-item-row'));
  for(const row of rows){
    const type = row.querySelector('.cargo-item-type')?.value || 'Goods';
    const name = row.querySelector('.cargo-item-name')?.value.trim() || '';
    const priceRaw = row.querySelector('.cargo-item-price')?.value.trim() || '';
    const qtyRaw = row.querySelector('.cargo-item-qty')?.value.trim() || '1';
    if(!name && !priceRaw) continue;
    if(!name){
      showToast('Enter an item name before saving.', 'error');
      return null;
    }
    if(priceRaw === ''){
      showToast('Enter a price for '+name+'.', 'error');
      return null;
    }
    const price = Number(priceRaw);
    const qty = Math.max(1, Math.floor(Number(qtyRaw || 1)));
    if(!Number.isFinite(price) || price < 0){
      showToast('Enter a valid price for '+name+'.', 'error');
      return null;
    }
    if(!Number.isFinite(qty) || qty < 1){
      showToast('Enter a valid quantity for '+name+'.', 'error');
      return null;
    }
    items.push({type, name, price, qty});
  }
  return items;
}

function goToAdminTrackingView(tn){
  // If the track container exists in this DOM, render inline (legacy single-page).
  const trackContainer = document.getElementById('track-container');
  if(trackContainer){
    document.querySelectorAll('.topnav button').forEach(b=>b.classList.toggle('active', b.dataset.nav==='home'));
    showView('track');
    renderTrackView(tn);
    return;
  }
  // Otherwise we're on the admin page (separate). Redirect to client with track param.
  const url = new URL(window.location.href);
  const base = url.pathname.endsWith('admin.html') ? url.pathname.replace(/admin\.html$/,'index.html') : 'index.html';
  window.location.href = base + '?track=' + encodeURIComponent(tn);
}

function advanceShipment(trackingNumber){
  const s = DATA.shipments.find(x=>x.trackingNumber===trackingNumber);
  if(!s) return;
  const idx = STATUS_STEPS.indexOf(s.status);
  if(idx<0 || idx>=STATUS_STEPS.length-1) return;
  const next = STATUS_STEPS[idx+1];
  s.status = next;
  const loc = next==='Delivered' ? s.destination.city : (next==='Out for Delivery' ? 'Near '+s.destination.city.split(',')[0] : 'En route');
  s.statusHistory.push({status:next, timestamp:Date.now(), location:loc});
  if(next==='Delivered'){
    s.currentPos = {...s.destination};
    if(s.driverId){
      const d = DATA.drivers.find(x=>x.id===s.driverId);
      if(d){ d.status='Available'; d.assignedShipmentId=null; }
    }
  }
  sendNotification(s, next);
  persist();
  renderAdminSub(currentAdminSub);
  notifyTrackViewUpdate(trackingNumber);
}

function markException(trackingNumber){
  const s = DATA.shipments.find(x=>x.trackingNumber===trackingNumber);
  if(!s) return;
  s.status = 'Exception';
  s.statusHistory.push({status:'Exception', timestamp:Date.now(), location:'Flagged by dispatch'});
  sendNotification(s,'Exception');
  persist();
  renderAdminSub(currentAdminSub);
  notifyTrackViewUpdate(trackingNumber);
}

function assignDriver(trackingNumber, driverId){
  const s = DATA.shipments.find(x=>x.trackingNumber===trackingNumber);
  if(!s) return;
  if(s.driverId){
    const prev = DATA.drivers.find(x=>x.id===s.driverId);
    if(prev){ prev.status='Available'; prev.assignedShipmentId=null; }
  }
  s.driverId = driverId || null;
  if(driverId){
    const d = DATA.drivers.find(x=>x.id===driverId);
    if(d){ d.status='On Delivery'; d.assignedShipmentId=trackingNumber; d.pos = {...s.currentPos}; }
  }
  persist();
  renderAdminSub(currentAdminSub);
  notifyTrackViewUpdate(trackingNumber);
}

function openNewShipmentModal(){
  const cityOptions = Object.keys(CITIES).map(c=>`<option value="${c}">${c}</option>`).join('');
  const templateOptions = (DATA && DATA.templates ? DATA.templates : []).map(t=>`<option value="${t.id}">${t.originCity.split(',')[0]} → ${t.destCity.split(',')[0]} (${t.id})</option>`).join('');
  const overlay = document.createElement('div');
  overlay.className='modal-overlay';
  overlay.innerHTML = `
    <div class="modal modal-wide">
      <div class="modal-header-section">
        <h3>Create New Shipment</h3>
        <p class="modal-desc">Fill in all shipment details below</p>
      </div>
      
      <!-- SENDER INFORMATION -->
      <div class="form-section">
        <h4 class="form-section-title">Sender Information</h4>
        <div class="field-grid">
          <label><span>Sender Name</span><input id="ns-sender-name" type="text" placeholder="Company or warehouse name"/></label>
          <label><span>Sender Phone</span><input id="ns-sender-phone" type="tel" placeholder="+1 (555) 000-0000"/></label>
          <label><span>Sender Email</span><input id="ns-sender-email" type="email" placeholder="sender@company.com"/></label>
          <label><span>Sender Address</span><input id="ns-sender-address" type="text" placeholder="Street address, city, state"/></label>
        </div>
      </div>

      <!-- RECEIVER INFORMATION -->
      <div class="form-section">
        <h4 class="form-section-title">Receiver Information</h4>
        <div class="field-grid">
          <label><span>Receiver Name</span><input id="ns-receiver-name" type="text" placeholder="Recipient name"/></label>
          <label><span>Receiver Phone</span><input id="ns-receiver-phone" type="tel" placeholder="+1 (555) 000-0000"/></label>
          <label><span>Receiver Email</span><input id="ns-receiver-email" type="email" placeholder="recipient@example.com"/></label>
          <label><span>Receiver Address</span><input id="ns-receiver-address" type="text" placeholder="Delivery street address, city, state"/></label>
        </div>
      </div>

      <!-- SHIPMENT DETAILS -->
      <div class="form-section">
        <h4 class="form-section-title">Shipment Details</h4>
        <div class="field-grid">
          <label><span>Shipment Name</span><input id="ns-shipment-name" type="text" placeholder="e.g. Electronics Order #12345"/></label>
          <label><span>Tracking Number</span><input id="ns-tracking-number" type="text" placeholder="Auto-generated if left blank" readonly/></label>
          <label><span>Quantity</span><input id="ns-quantity" type="number" placeholder="1" min="1" value="1"/></label>
          <label><span>Weight (kg)</span><input id="ns-weight" type="number" placeholder="0.00" step="0.01" min="0"/></label>
          <label><span>Shipping Mode</span><select id="ns-shipping-mode"><option value="">Select shipping mode</option><option value="Air Freight">Air Freight</option><option value="Sea Freight">Sea Freight</option><option value="Land Transport">Land Transport</option></select></label>
          <label><span>Length (cm)</span><input id="ns-length" type="number" placeholder="0.00" step="0.01" min="0"/></label>
          <label><span>Width (cm)</span><input id="ns-width" type="number" placeholder="0.00" step="0.01" min="0"/></label>
          <label><span>Height (cm)</span><input id="ns-height" type="number" placeholder="0.00" step="0.01" min="0"/></label>
          <label><span>Status</span><select id="ns-status"><option value="Order Placed">Order Placed</option><option value="Processing">Processing</option><option value="Ready for Pickup">Ready for Pickup</option></select></label>
          <label><span>Current Location</span><select id="ns-current-location">${cityOptions}</select></label>
          <label><span>Shipment Cost ($)</span><input id="ns-shipment-cost" type="number" placeholder="0.00" step="0.01" min="0"/></label>
          <label><span>Insurance Cost ($)</span><input id="ns-insurance-cost" type="number" placeholder="0.00" step="0.01" min="0"/></label>
        </div>
      </div>

      <!-- SCHEDULE & DELIVERY -->
      <div class="form-section">
        <h4 class="form-section-title">Schedule & Delivery</h4>
        <div class="field-grid">
          <label><span>Origin City</span><select id="ns-origin-city">${cityOptions}</select></label>
          <label><span>Origin Date</span><input id="ns-origin-date" type="date"/></label>
          <label><span>Destination City</span><select id="ns-destination-city">${cityOptions}</select></label>
          <label><span>Destination Country</span><input id="ns-destination-country" type="text" placeholder="Country name"/></label>
          <label><span>Delivery Address</span><input id="ns-delivery-address" type="text" placeholder="Full delivery address"/></label>
          <label><span>Pickup Date</span><input id="ns-pickup-date" type="date"/></label>
          <label><span>Pickup Time</span><input id="ns-pickup-time" type="time"/></label>
          <label><span>Departure Date</span><input id="ns-departure-date" type="date"/></label>
          <label><span>Departure Time</span><input id="ns-departure-time" type="time"/></label>
          <label><span>Expected Delivery Date</span><input id="ns-expected-delivery-date" type="date"/></label>
          <label><span>Expected Delivery Time</span><input id="ns-expected-delivery-time" type="time"/></label>
          <label colspan="2"><span>Additional Comments</span><textarea id="ns-additional-comments" placeholder="Any special handling instructions or additional notes..." rows="3"></textarea></label>
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn-primary" onclick="createShipment()">Create Shipment</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  document.getElementById('ns-destination-city').selectedIndex = 1;
  document.getElementById('ns-origin-city').selectedIndex = 0;
  document.getElementById('ns-current-location').selectedIndex = 0;
}

function populateNewShipmentFromTemplate(templateId){
  if(!templateId) return;
  const t = DATA.templates.find(x=>String(x.id)===String(templateId));
  if(!t) return;
  const senderEl = document.getElementById('ns-sender');
  const recvEl = document.getElementById('ns-receiver');
  const originEl = document.getElementById('ns-origin');
  const destEl = document.getElementById('ns-dest');
  if(senderEl) senderEl.value = t.senderName || ('Warehouse — '+t.originCity);
  if(recvEl) recvEl.value = 'Recipient';
  if(originEl) originEl.value = t.originCity;
  if(destEl) destEl.value = t.destCity;
}
function closeModal(){ const o=document.querySelector('.modal-overlay'); if(o) o.remove(); }

function createShipment(){
  // Sender Information
  const senderName = document.getElementById('ns-sender-name').value.trim() || 'Warehouse';
  const senderPhone = document.getElementById('ns-sender-phone').value.trim();
  const senderEmail = document.getElementById('ns-sender-email').value.trim();
  const senderAddress = document.getElementById('ns-sender-address').value.trim();

  // Receiver Information
  const receiverName = document.getElementById('ns-receiver-name').value.trim() || 'Recipient';
  const receiverPhone = document.getElementById('ns-receiver-phone').value.trim();
  const receiverEmail = document.getElementById('ns-receiver-email').value.trim();
  const receiverAddress = document.getElementById('ns-receiver-address').value.trim();

  // Shipment Details
  const shipmentName = document.getElementById('ns-shipment-name').value.trim() || 'Shipment';
  const quantity = parseInt(document.getElementById('ns-quantity').value) || 1;
  const weight = parseFloat(document.getElementById('ns-weight').value) || 0;
  const shippingMode = document.getElementById('ns-shipping-mode').value || 'Land Transport';
  const length = parseFloat(document.getElementById('ns-length').value) || 0;
  const width = parseFloat(document.getElementById('ns-width').value) || 0;
  const height = parseFloat(document.getElementById('ns-height').value) || 0;
  const status = document.getElementById('ns-status').value || 'Order Placed';
  const shipmentCost = parseFloat(document.getElementById('ns-shipment-cost').value) || 0;
  const insuranceCost = parseFloat(document.getElementById('ns-insurance-cost').value) || 0;

  // Schedule & Delivery
  const originCity = document.getElementById('ns-origin-city').value;
  const originDate = document.getElementById('ns-origin-date').value;
  const destinationCity = document.getElementById('ns-destination-city').value;
  const destinationCountry = document.getElementById('ns-destination-country').value.trim();
  const deliveryAddress = document.getElementById('ns-delivery-address').value.trim();
  const pickupDate = document.getElementById('ns-pickup-date').value;
  const pickupTime = document.getElementById('ns-pickup-time').value;
  const departureDate = document.getElementById('ns-departure-date').value;
  const departureTime = document.getElementById('ns-departure-time').value;
  const expectedDeliveryDate = document.getElementById('ns-expected-delivery-date').value;
  const expectedDeliveryTime = document.getElementById('ns-expected-delivery-time').value;
  const additionalComments = document.getElementById('ns-additional-comments').value.trim();

  // Validation
  if(!receiverPhone){ showToast('Receiver phone is required for tracking lookup.', 'error'); return; }
  if(!originCity || !destinationCity){ showToast('Select origin and destination cities.', 'error'); return; }
  if(originCity === destinationCity){ showToast('Origin and destination must differ.', 'error'); return; }
  if(receiverEmail && !/^\S+@\S+\.\S+$/.test(receiverEmail)){ showToast('Enter a valid receiver email.', 'error'); return; }

  const tn = genTracking();
  const s = {
    trackingNumber: tn,
    status: status,
    packageName: shipmentName,
    sender: {
      name: senderName,
      phone: senderPhone,
      email: senderEmail,
      address: senderAddress,
      city: originCity
    },
    receiver: {
      name: receiverName,
      phone: receiverPhone,
      email: receiverEmail,
      address: receiverAddress,
      city: destinationCity
    },
    origin: {
      city: originCity,
      date: originDate,
      ...CITIES[originCity]
    },
    destination: {
      city: destinationCity,
      country: destinationCountry,
      address: deliveryAddress,
      ...CITIES[destinationCity]
    },
    currentPos: {...CITIES[originCity]},
    shipment: {
      quantity: quantity,
      weight: weight,
      dimensions: {
        length: length,
        width: width,
        height: height
      },
      mode: shippingMode,
      cost: shipmentCost,
      insuranceCost: insuranceCost
    },
    schedule: {
      pickup: {
        date: pickupDate,
        time: pickupTime
      },
      departure: {
        date: departureDate,
        time: departureTime
      },
      expectedDelivery: {
        date: expectedDeliveryDate,
        time: expectedDeliveryTime
      }
    },
    additionalComments: additionalComments,
    items: [],
    driverId: null,
    createdAt: Date.now(),
    statusHistory: [{
      status: status,
      timestamp: Date.now(),
      location: originCity
    }]
  };

  DATA.shipments.unshift(s);
  sendNotification(s, status);
  closeModal();
  persist();
  renderAdminSub('shipments');
  notifyTrackViewUpdate(s.trackingNumber);
  showToast('Shipment created successfully!', 'success');
}

function openShipmentItemsModal(trackingNumber){
  const shipment = DATA.shipments.find(x=>x.trackingNumber===trackingNumber);
  if(!shipment) return;
  const overlay = document.createElement('div');
  overlay.className='modal-overlay';
  overlay.innerHTML = `
    <div class="modal modal-wide">
      <h3>Shipment items</h3>
      <div class="modal-sub mono">${escapeHtml(shipment.trackingNumber)}</div>
      <div class="cargo-items-editor" id="edit-items-body"></div>
      <button class="btn-secondary cargo-add-btn" type="button" onclick="addShipmentItemRow('edit-items-body')">+ Add item</button>
      <div class="modal-actions">
        <button class="btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn-primary" onclick="saveShipmentItems('${shipment.trackingNumber}')">Save items</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  const items = getShipmentItems(shipment);
  if(items.length){
    items.forEach(item => addShipmentItemRow('edit-items-body', item));
  } else {
    addShipmentItemRow('edit-items-body');
  }
}

function saveShipmentItems(trackingNumber){
  const shipment = DATA.shipments.find(x=>x.trackingNumber===trackingNumber);
  if(!shipment) return;
  const items = collectShipmentItems('edit-items-body');
  if(items === null) return;
  shipment.items = items;
  persist();
  closeModal();
  renderAdminSub('shipments');
  notifyTrackViewUpdate(trackingNumber);
  showToast(items.length ? 'Shipment items saved.' : 'Shipment item list cleared.', 'success');
}

// renderAvailableTracks removed per request: demos are not shown on the client page

/* ---------- DRIVERS ---------- */
function renderDrivers(main){
  main.innerHTML = `
    <div class="admin-header"><h2>Drivers</h2></div>
    <div class="driver-grid">
      ${DATA.drivers.map(d=>{
        const shipment = d.assignedShipmentId ? DATA.shipments.find(s=>s.trackingNumber===d.assignedShipmentId) : null;
        return `<div class="driver-card">
          <div class="driver-card-top">
            <div class="driver-avatar">${initials(d.name)}</div>
            <span class="driver-status-badge ds-${d.status.replace(/\s+/g,'-')}">${d.status}</span>
          </div>
          <div class="driver-name">${d.name}</div>
          <div class="driver-sub">${d.vehicle}</div>
          <div class="driver-sub">${d.phone}</div>
          <select onchange="setDriverStatus('${d.id}', this.value)">
            ${["Available","On Delivery","Break","Off Duty"].map(st=>`<option value="${st}" ${st===d.status?'selected':''}>${st}</option>`).join('')}
          </select>
          <div class="driver-assign">${shipment? `Assigned to <span class="mono">${shipment.trackingNumber}</span> — ${shipment.origin.city.split(',')[0]} → ${shipment.destination.city.split(',')[0]}` : 'No active assignment'}</div>
        </div>`;
      }).join('')}
    </div>
  `;
}

function setDriverStatus(driverId, status){
  const d = DATA.drivers.find(x=>x.id===driverId);
  if(!d) return;
  d.status = status;
  if(status==='Off Duty' || status==='Break'){
    // keep assignment but stop movement implicitly (movement loop checks status)
  }
  if(status==='Available' && d.assignedShipmentId){
    const s = DATA.shipments.find(x=>x.trackingNumber===d.assignedShipmentId);
    if(s) s.driverId = null;
    d.assignedShipmentId = null;
  }
  persist();
  renderAdminSub(currentAdminSub);
}

/* ---------- MAP ---------- */
function renderAdminMap(main){
  main.innerHTML = `
    <div class="admin-header"><h2>Live map</h2></div>
    <div id="admin-map"></div>
    <div class="map-legend">
      <span><span class="legend-dot" style="background:#1D6FE0;"></span> In transit</span>
      <span><span class="legend-dot" style="background:#C98A1D;"></span> Out for delivery</span>
      <span><span class="legend-dot" style="background:#1B8A5A;"></span> Available driver</span>
      <span><span class="legend-dot" style="background:#98A2B3;"></span> Off duty</span>
    </div>
  `;
  if(!window.L){
    loadLeaflet(() => initAdminMap());
    return;
  }
  initAdminMap();
}

function initAdminMap(){
  const container = document.getElementById('admin-map');
  if(!container) return;
  if(!window.L){
    loadLeaflet(() => initAdminMap());
    return;
  }
  if(adminMapInstance){ adminMapInstance.remove(); adminMapInstance=null; }
  adminMapInstance = L.map(container,{attributionControl:false}).setView([39.5,-98.35],4);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(adminMapInstance);
  adminMapLayer = L.layerGroup().addTo(adminMapInstance);
  drawAdminMapMarkers();
  setTimeout(()=>adminMapInstance && adminMapInstance.invalidateSize(),150);
}

function drawAdminMapMarkers(){
  if(!adminMapLayer) return;
  adminMapLayer.clearLayers();
  // build bounds to fit all markers and shipment routes
  const bounds = L.latLngBounds([]);
  DATA.drivers.forEach(d=>{
    const color = d.status==='Available' ? '#1B8A5A' : d.status==='Off Duty' ? '#98A2B3' : d.status==='Break' ? '#C98A1D' : '#1D6FE0';
    const shipment = d.assignedShipmentId ? DATA.shipments.find(s=>s.trackingNumber===d.assignedShipmentId) : null;
    const marker = L.marker([d.pos.lat, d.pos.lng], {icon: pulseIcon(color)}).addTo(adminMapLayer);
    marker.bindTooltip(`${d.name} — ${d.status}${shipment? ' · '+shipment.trackingNumber : ''}`);
    bounds.extend([d.pos.lat, d.pos.lng]);
    if(shipment && shipment.status!=='Delivered'){
      L.polyline([[shipment.origin.lat,shipment.origin.lng],[shipment.destination.lat,shipment.destination.lng]],{color:color,weight:1.5,dashArray:'5,6',opacity:.5}).addTo(adminMapLayer);
      bounds.extend([shipment.origin.lat, shipment.origin.lng]);
      bounds.extend([shipment.destination.lat, shipment.destination.lng]);
    }
  });
  // also include all shipment origins/destinations in bounds so free-floating shipments are visible
  DATA.shipments.forEach(s=>{
    if(s.origin) bounds.extend([s.origin.lat, s.origin.lng]);
    if(s.destination) bounds.extend([s.destination.lat, s.destination.lng]);
  });
  if(bounds.isValid && bounds.isValid()){
    adminMapInstance.fitBounds(bounds, {padding:[40,40]});
  }
}

/* ---------- NOTIFICATIONS ---------- */
const EMAIL_TEMPLATES = {
  "Order Placed":{subject:"We've received your shipment", body:"Your package has been registered in our network and is being prepared for pickup."},
  "Picked Up":{subject:"Your package has been picked up", body:"A driver has collected your package and it's now heading to our sorting facility."},
  "In Transit":{subject:"Your package is on its way", body:"Your shipment is currently in transit toward its destination. You can follow its live location anytime."},
  "Out for Delivery":{subject:"Out for delivery today", body:"Your package is out for delivery and should arrive today. A driver is en route to the destination address."},
  "Delivered":{subject:"Your package has been delivered", body:"Your package has arrived at its destination. Thanks for shipping with swiftcargosolutions."},
  "Exception":{subject:"An update on your shipment", body:"We've flagged an issue with your shipment that our team is working to resolve. We'll follow up shortly with more information."}
};
let selectedTemplate = "In Transit";

function renderNotifications(main){
  main.innerHTML = `
    <div class="admin-header"><h2>Notifications</h2></div>
    <div class="tpl-grid">
      <div class="tpl-list" id="tpl-list">
        ${Object.keys(EMAIL_TEMPLATES).map(k=>`<button data-tpl="${k}" class="${k===selectedTemplate?'active':''}">${k}</button>`).join('')}
      </div>
      <div>
        <div class="email-preview" id="email-preview-wrap"></div>
        <div class="card" style="margin-top:20px;">
          <h3>Delivery log</h3>
          <div id="notif-log"></div>
        </div>
      </div>
    </div>
  `;
  document.getElementById('tpl-list').addEventListener('click',e=>{
    const b = e.target.closest('button[data-tpl]');
    if(!b) return;
    selectedTemplate = b.dataset.tpl;
    renderNotifications(main);
  });
  renderEmailPreview();
  renderNotifLog();
}

function renderEmailPreview(){
  const tpl = EMAIL_TEMPLATES[selectedTemplate];
  document.getElementById('email-preview-wrap').innerHTML = `
    <div class="email-card">
      <div class="email-card-head">
        <div style="font-family:var(--font-display);font-weight:700;font-size:16px;">swiftcargosolutions</div>
      </div>
      <div class="email-card-body">
        <h4>${tpl.subject}</h4>
        <p>${tpl.body}</p>
        <a href="#" class="email-btn" onclick="return false;">Track shipment</a>
        <div class="send-row">
          <input type="text" id="send-tracking" placeholder="Tracking number, e.g. SC100234567" class="mono"/>
          <button class="btn-primary" onclick="sendManualNotification()">Send</button>
        </div>
      </div>
    </div>
  `;
}

function sendManualNotification(){
  const tn = document.getElementById('send-tracking').value.trim().toUpperCase();
  const s = DATA.shipments.find(x=>x.trackingNumber===tn);
  if(!s){ alert('No shipment found with that tracking number.'); return; }
  if(!s.receiver.email){ alert('This shipment has no receiver email on file yet.'); return; }
  sendNotification(s, selectedTemplate, true);
  renderNotifLog();
}

function sendNotification(shipment, statusKey, manual){
  if(!shipment.receiver.email) return;
  const tpl = EMAIL_TEMPLATES[statusKey] || EMAIL_TEMPLATES["In Transit"];
  DATA.notifications.unshift({
    id:cryptoId(), trackingNumber:shipment.trackingNumber, type:statusKey,
    recipientEmail:shipment.receiver.email, subject:tpl.subject, timestamp:Date.now()
  });
  persist();
}

function renderNotifLog(){
  const el = document.getElementById('notif-log');
  if(!el) return;
  if(DATA.notifications.length===0){
    el.innerHTML = `<div class="log-empty">No notifications sent yet.</div>`;
    return;
  }
  el.innerHTML = `<table>
    <thead><tr><th>Tracking #</th><th>Type</th><th>Recipient</th><th>Sent</th></tr></thead>
    <tbody>
      ${DATA.notifications.slice(0,20).map(n=>`
        <tr><td class="mono">${n.trackingNumber}</td><td>${n.type}</td><td>${escapeHtml(n.recipientEmail)}</td><td>${fmtTime(n.timestamp)}</td></tr>
      `).join('')}
    </tbody>
  </table>`;
}

/* ---------- RESET ---------- */
async function resetLocalData(){
  if(!confirm('This will reset all local shipment, driver, and notification data in this browser. Continue?')) return;
  DATA = seedData();
  await persist(true);
  renderAdminSub(currentAdminSub);
}

/* ============================================================
   LIVE MOVEMENT SIMULATION
============================================================ */
function tickMovement(){
  let moved = false;
  DATA.shipments.forEach(s=>{
    if(s.status!=='In Transit' && s.status!=='Out for Delivery') return;
    const d = s.driverId ? DATA.drivers.find(x=>x.id===s.driverId) : null;
    if(d && d.status!=='On Delivery') return;
    const target = s.destination;
    const remaining = dist(s.currentPos, target);
    if(remaining < 0.01) return;
    const step = 0.015; // fraction of remaining distance per tick
    s.currentPos = {
      lat: lerp(s.currentPos.lat, target.lat, step),
      lng: lerp(s.currentPos.lng, target.lng, step)
    };
    if(d) d.pos = {...s.currentPos};
    moved = true;
  });
  if(moved){
    persist();
    const viewTrackEl = document.getElementById('view-track');
    if(viewTrackEl && !viewTrackEl.hidden && currentTrackingNumber){
      const s = DATA.shipments.find(x=>x.trackingNumber===currentTrackingNumber);
      if(s && trackMapMarker){
        try{ trackMapMarker.setLatLng([s.currentPos.lat, s.currentPos.lng]); }catch(e){}
      }
    }
    if(adminMapInstance && currentAdminSub==='map' && adminMapLayer){
      try{ drawAdminMapMarkers(); }catch(e){}
    }
  }
}
setInterval(tickMovement, 3000);

/* ============================================================
   UTIL
============================================================ */
function escapeHtml(str){
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function notifyTrackViewUpdate(trackingNumber){
  // if the client track view is open and matches, re-render to pick up status/driver changes
  try{
    if(!document.getElementById('view-track') || document.getElementById('view-track').hidden) return;
    if(currentTrackingNumber && trackingNumber && currentTrackingNumber===trackingNumber){
      // preserve map center/zoom if possible
      const lastZoom = trackMapInstance ? trackMapInstance.getZoom() : null;
      renderTrackView(trackingNumber);
      if(trackMapInstance && lastZoom!=null){ try{ trackMapInstance.setZoom(lastZoom); }catch(e){} }
    }
  }catch(e){}
}

/* ============================================================
   INIT
============================================================ */
(async function init(){
  await loadData();
  await window.SwiftBackend?.init();
  subscribeToCloudShipments();
  document.querySelectorAll('.feature-card, .reason-card, .policy-card, .quote-card, .track-order-card, .stat-card').forEach((node, index) => {
    node.classList.add('reveal-up');
    node.style.transitionDelay = (index * 60) + 'ms';
    requestAnimationFrame(() => node.classList.add('visible'));
  });
  document.body.classList.add('page-ready');
  const trackParam = normalizeTrackingNumber(new URLSearchParams(window.location.search).get('track'));
  if(trackParam){
    currentTrackingNumber = trackParam;
    showView('track');
    renderTrackView(trackParam);
  }
})();

const chatForm = document.querySelector('.chat-form');
if(chatForm){
  chatForm.addEventListener('submit', (event)=>{
    event.preventDefault();
    const input = chatForm.querySelector('input');
    const val = input.value.trim();
    if(!val) return;
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble outbound';
    bubble.textContent = val;
    chatForm.closest('.chat-panel').querySelector('.chat-body').appendChild(bubble);
    input.value = '';
    setTimeout(()=>{
      const body = chatForm.closest('.chat-panel').querySelector('.chat-body');
      const system = document.createElement('div');
      system.className = 'chat-bubble system';
      system.textContent = 'Thank you. Our logistics team will review your message and respond shortly.';
      body.appendChild(system);
      body.scrollTop = body.scrollHeight;
    }, 500);
  });
}
// removed stray closing sequence

// If this script is loaded on the standalone admin page, render admin immediately
if(document.getElementById('admin-root')){
  // ensure data loaded and admin UI rendered
  (async ()=>{ await loadData(); renderAdmin(); })();
}

document.addEventListener('click', (e)=>{
  const navToggle = e.target.closest('.nav-toggle');
  if(navToggle){
    const wrap = navToggle.closest('.topnav-wrap');
    if(!wrap) return;
    const isOpen = wrap.classList.toggle('menu-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    return;
  }

  const chatToggle = e.target.closest('.chat-toggle');
  if(chatToggle){
    const panel = document.getElementById('chat-panel');
    if(!panel) return;
    const isOpen = panel.hidden;
    panel.hidden = !isOpen;
    chatToggle.setAttribute('aria-expanded', String(isOpen));
    return;
  }

  const chatClose = e.target.closest('.chat-close');
  if(chatClose){
    const panel = document.getElementById('chat-panel');
    if(panel){ panel.hidden = true; }
    const trigger = document.querySelector('.chat-toggle');
    if(trigger){ trigger.setAttribute('aria-expanded', 'false'); }
    return;
  }

  const navButton = e.target.closest('.topnav button');
  if(navButton) {
    const wrap = navButton.closest('.topnav-wrap');
    if(wrap) wrap.classList.remove('menu-open');
    const toggle = document.querySelector('.nav-toggle');
    if(toggle) toggle.setAttribute('aria-expanded', 'false');
  }

  const t = e.target.closest('.top-thumbs .thumb');
  if(!t) return;
  const src = t.getAttribute('src');
  const modal = document.createElement('div');
  modal.className = 'img-modal';
  modal.innerHTML = `<div class="img-wrap"><img src="${src}" alt="Preview" loading="lazy"><button class="close-btn" onclick="this.closest('.img-modal').remove();">Close</button></div>`;
  document.body.appendChild(modal);
});
