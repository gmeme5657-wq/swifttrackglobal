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
    const showOverlay = isOurErrorObj(reason) || window.location.search.indexOf('showErrors=true')!==-1 || localStorage.getItem('swift.debugErrors')==='1';
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
    const showOverlay = isOurErrorObj(reason) || window.location.search.indexOf('showErrors=true')!==-1 || localStorage.getItem('swift.debugErrors')==='1';
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
  "New York, NY":{lat:40.7128,lng:-74.0060},
  "Chicago, IL":{lat:41.8781,lng:-87.6298},
  "Los Angeles, CA":{lat:34.0522,lng:-118.2437},
  "Houston, TX":{lat:29.7604,lng:-95.3698},
  "Phoenix, AZ":{lat:33.4484,lng:-112.0740},
  "Denver, CO":{lat:39.7392,lng:-104.9903},
  "Atlanta, GA":{lat:33.7490,lng:-84.3880},
  "Seattle, WA":{lat:47.6062,lng:-122.3321},
  "Miami, FL":{lat:25.7617,lng:-80.1918},
  "Dallas, TX":{lat:32.7767,lng:-96.7970},
  "Toronto, ON":{lat:43.6532,lng:-79.3832},
  "Vancouver, BC":{lat:49.2827,lng:-123.1207},
  "Montreal, QC":{lat:45.5017,lng:-73.5673},
  "Calgary, AB":{lat:51.0447,lng:-114.0719},
  "Ottawa, ON":{lat:45.4215,lng:-75.6972},
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

function lerp(a,b,t){return a+(b-a)*t;}
function dist(a,b){return Math.hypot(a.lat-b.lat,a.lng-b.lng);}
function fmtTime(ts){const d=new Date(ts);return d.toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});}
function statusClass(s){return 'status-'+s.replace(/\s+/g,'-');}
function initials(name){return name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();}
function genTracking(){return 'SC'+Math.floor(100000000+Math.random()*899999999);}

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
  return {
    trackingNumber:tracking,
    status:"Order Placed",
    sender:{name:"Warehouse — "+originCity, city:originCity},
    receiver:{name:"Recipient", city:destCity, email:email||""},
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

async function loadData(){
  try{
    const raw = localStorage.getItem(DB_KEY);
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
    localStorage.setItem(DB_KEY, JSON.stringify(DATA));
  }catch(e){ console.error('local database save failed', e); }
}

/* ============================================================
   NAV
============================================================ */
document.querySelectorAll('.topnav button').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.topnav button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    showView(btn.dataset.nav);
  });
});

function showView(name){
  const vHome = document.getElementById('view-home'); if(vHome) vHome.hidden = name!=='home';
  const vTrack = document.getElementById('view-track'); if(vTrack) vTrack.hidden = name!=='track';
  const vAdmin = document.getElementById('view-admin'); if(vAdmin) vAdmin.hidden = name!=='admin';
  if(name==='admin') renderAdmin();
}

/* ============================================================
   HOME
============================================================ */
const _homeBtn = document.getElementById('home-track-btn');
const _homeInput = document.getElementById('home-track-input');
if(_homeBtn) _homeBtn.addEventListener('click', doHomeTrack);
if(_homeInput) _homeInput.addEventListener('keydown', e=>{ if(e.key==='Enter') doHomeTrack(); });

function doHomeTrack(){
  const el = document.getElementById('home-track-input');
  if(!el) return;
  let val = el.value.trim().toUpperCase();
  if(!val) return;
  // allow users to paste numbers without SC prefix
  if(!/^SC\d+/.test(val)){
    const maybe = 'SC'+val.replace(/[^0-9]/g,'');
    if(maybe.length>2) val = maybe;
  }
  goToTracking(val);
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
  const s = DATA.shipments.find(x=>x.trackingNumber===trackingNumber);
  const el = document.getElementById('track-container');
  showToast('Searching '+trackingNumber+'...', 'info', 1400);
  if(!s){
    el.innerHTML = `
      <button class="back-link" onclick="backHome()">← Back</button>
      <div class="not-found">
        <h2>No shipment found</h2>
        <p>We couldn't find a shipment matching "${escapeHtml(trackingNumber)}". Double check the tracking number and try again.</p>
      </div>`;
    showToast('No shipment found: '+trackingNumber, 'error', 3000);
    return;
  }
  showToast('Shipment found — opening map', 'success', 1000);
  const driver = s.driverId ? DATA.drivers.find(d=>d.id===s.driverId) : null;
  const pct = progressPct(s.status);
  const history = [...s.statusHistory].reverse();

  el.innerHTML = `
    <button class="back-link" onclick="backHome()">← Track another package</button>
    <div class="ticket">
      <div class="ticket-top">
        <div>
          <div class="ticket-num-label">Tracking number</div>
          <div class="ticket-num">${s.trackingNumber}</div>
        </div>
        <div class="status-pill ${statusClass(s.status)}"><span class="dot"></span>${s.status}</div>
      </div>
      <div class="perforation"></div>
      <div class="ticket-route">
        <div class="route-endpoint"><div class="city">${s.origin.city.split(',')[0]}</div><div class="label">Origin</div></div>
        <div class="ribbon-wrap">
          <div class="ribbon"><div class="ribbon-fill" style="width:${pct}%"></div></div>
          <div class="ribbon-checks">
            ${STATUS_STEPS.map((st,i)=>{
              const stepIdx = STATUS_STEPS.indexOf(s.status);
              let cls='check'; if(i<stepIdx) cls+=' done'; else if(i===stepIdx) cls+=' done'+(i===stepIdx?' current':'');
              if(i===stepIdx) cls='check done current';
              else if(i<stepIdx) cls='check done';
              else cls='check';
              return `<div class="${cls}"></div>`;
            }).join('')}
          </div>
          <div class="ribbon-labels">${STATUS_STEPS.map(st=>`<span>${st}</span>`).join('')}</div>
        </div>
        <div class="route-endpoint dest"><div class="city">${s.destination.city.split(',')[0]}</div><div class="label">Destination</div></div>
      </div>
      <div class="ticket-meta">
        <div class="meta-item"><div class="label">Sender</div><div class="value">${s.sender.name}</div></div>
        <div class="meta-item"><div class="label">Receiver</div><div class="value">${s.receiver.name}, ${s.receiver.city}</div></div>
        <div class="meta-item"><div class="label">Est. delivery</div><div class="value">${estDeliveryText(s)}</div></div>
        ${driver?`<div class="meta-item"><div class="label">Driver</div><div class="value">${driver.name}</div></div>`:''}
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <h3>Live location</h3>
        <div id="track-map"></div>
      </div>
      <div class="card">
        <h3>Status history</h3>
        <div>
          ${history.map(h=>`
            <div class="history-item">
              <div class="history-dot"></div>
              <div>
                <div class="history-text">${h.status}</div>
                <div class="history-sub">${fmtTime(h.timestamp)} · ${h.location}</div>
              </div>
            </div>`).join('')}
        </div>
        <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border);">
          <h3 style="margin-bottom:8px;">Get email updates</h3>
          <div class="email-capture">
            <input type="email" id="track-email-input" placeholder="your@email.com" value="${s.receiver.email||''}"/>
            <button onclick="saveTrackEmail('${s.trackingNumber}')">Save</button>
          </div>
          <div class="small-note" id="track-email-note">${s.receiver.email? "We'll notify "+escapeHtml(s.receiver.email)+" on every status change." : "Add an email to receive delivery notifications."}</div>
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

function initTrackMap(s){
  const container = document.getElementById('track-map');
  if(!container) return;
  if(trackMapInstance){ trackMapInstance.remove(); trackMapInstance=null; }
  const center = s.currentPos;
  trackMapInstance = L.map(container,{zoomControl:true,attributionControl:false}).setView([center.lat,center.lng], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(trackMapInstance);

  const line = L.polyline([[s.origin.lat,s.origin.lng],[s.destination.lat,s.destination.lng]], {color:'#1D6FE0',weight:2,dashArray:'6,7',opacity:.6}).addTo(trackMapInstance);
  L.circleMarker([s.origin.lat,s.origin.lng],{radius:5,color:'#5B6472',fillColor:'#fff',fillOpacity:1,weight:2}).addTo(trackMapInstance).bindTooltip(s.origin.city,{permanent:false});
  L.circleMarker([s.destination.lat,s.destination.lng],{radius:5,color:'#5B6472',fillColor:'#fff',fillOpacity:1,weight:2}).addTo(trackMapInstance).bindTooltip(s.destination.city,{permanent:false});

  const color = s.status==='Delivered' ? '#1B8A5A' : (s.status==='Out for Delivery' ? '#C98A1D' : '#1D6FE0');
  trackMapMarker = L.marker([s.currentPos.lat,s.currentPos.lng],{icon: pulseIcon(color)}).addTo(trackMapInstance);
  trackMapInstance.fitBounds(line.getBounds(),{padding:[40,40]});
  setTimeout(()=>trackMapInstance && trackMapInstance.invalidateSize(),150);
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
      <p style="font-size:13px;color:var(--text-muted);margin-top:6px;">Enter your passcode to access the dispatch dashboard.</p>
      <input type="password" id="admin-pass" placeholder="Passcode" />
      <button class="btn-primary" style="width:100%;" onclick="tryAdminLogin()">Sign in</button>
      
    </div>`;
  document.getElementById('admin-pass').addEventListener('keydown',e=>{if(e.key==='Enter') tryAdminLogin();});
}

function tryAdminLogin(){
  const val = document.getElementById('admin-pass').value;
  if(val==='admin221r'){
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
        <thead><tr><th>Tracking #</th><th>Route</th><th>Status</th><th>Driver</th><th>Actions</th></tr></thead>
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
      <td><span class="status-pill ${statusClass(s.status)}"><span class="dot"></span>${s.status}</span></td>
      <td>
        <select onchange="assignDriver('${s.trackingNumber}', this.value)">
          <option value="">Unassigned</option>
          ${availableDrivers.map(dr=>`<option value="${dr.id}" ${dr.id===s.driverId?'selected':''}>${dr.name}</option>`).join('')}
        </select>
      </td>
      <td class="row-actions">
        ${nextStatus?`<button class="advance" onclick="advanceShipment('${s.trackingNumber}')">Mark ${nextStatus}</button>`:''}
        <button onclick="markException('${s.trackingNumber}')">Flag issue</button>
      </td>
    </tr>`;
  }).join('');
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
    <div class="modal">
      <h3>New shipment</h3>
      <div class="field"><label>Template (optional)</label><select id="ns-template"><option value="">Custom / none</option>${templateOptions}</select></div>
      <div class="field-row">
        <div class="field"><label>Sender name</label><input id="ns-sender" placeholder="Warehouse / company"/></div>
        <div class="field"><label>Origin city</label><select id="ns-origin">${cityOptions}</select></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Receiver name</label><input id="ns-receiver" placeholder="Recipient name"/></div>
        <div class="field"><label>Destination city</label><select id="ns-dest">${cityOptions}</select></div>
      </div>
      <div class="field"><label>Receiver email (optional)</label><input id="ns-email" type="email" placeholder="name@example.com"/></div>
      <div class="modal-actions">
        <button class="btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn-primary" onclick="createShipment()">Create shipment</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  document.getElementById('ns-dest').selectedIndex = 1;
  const tplSel = document.getElementById('ns-template');
  if(tplSel){ tplSel.addEventListener('change', ()=>{ populateNewShipmentFromTemplate(tplSel.value); }); }
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
  const sender = document.getElementById('ns-sender').value.trim() || 'Warehouse';
  const receiver = document.getElementById('ns-receiver').value.trim() || 'Recipient';
  const origin = document.getElementById('ns-origin').value;
  const dest = document.getElementById('ns-dest').value;
  const email = document.getElementById('ns-email').value.trim();
  if(origin===dest){ showToast('Origin and destination must differ.','error'); return; }
  if(email && !/^\S+@\S+\.\S+$/ .test(email)){ showToast("Enter a valid receiver email.", "error"); return; }
  const tn = genTracking();
  const s = {
    trackingNumber:tn, status:'Order Placed',
    sender:{name:sender, city:origin},
    receiver:{name:receiver, city:dest, email},
    origin:{city:origin, ...CITIES[origin]},
    destination:{city:dest, ...CITIES[dest]},
    currentPos:{...CITIES[origin]},
    driverId:null, createdAt:Date.now(),
    statusHistory:[{status:'Order Placed', timestamp:Date.now(), location:origin}]
  };
  DATA.shipments.unshift(s);
  sendNotification(s,'Order Placed');
  closeModal();
  persist();
  renderAdminSub('shipments');
  notifyTrackViewUpdate(s.trackingNumber);
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
  initAdminMap();
}

function initAdminMap(){
  const container = document.getElementById('admin-map');
  if(!container) return;
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
  "Delivered":{subject:"Your package has been delivered", body:"Your package has arrived at its destination. Thanks for shipping with swifttrackglobal."},
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
        <div style="font-family:var(--font-display);font-weight:700;font-size:16px;">swifttrackglobal</div>
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
    if(!d || d.status!=='On Delivery') return;
    const target = s.destination;
    const remaining = dist(s.currentPos, target);
    if(remaining < 0.01) return;
    const step = 0.015; // fraction of remaining distance per tick
    s.currentPos = {
      lat: lerp(s.currentPos.lat, target.lat, step),
      lng: lerp(s.currentPos.lng, target.lng, step)
    };
    d.pos = {...s.currentPos};
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
})();
// removed stray closing sequence

// If this script is loaded on the standalone admin page, render admin immediately
if(document.getElementById('admin-root')){
  // ensure data loaded and admin UI rendered
  (async ()=>{ await loadData(); renderAdmin(); })();
}

// If `track` query param provided (e.g. admin links), open that tracking on the client page
if(!document.getElementById('admin-root')){
  try{
    const params = new URLSearchParams(window.location.search);
    const tn = params.get('track');
    if(tn){
      // defer until DATA loaded and UI ready
      (async ()=>{ await loadData(); goToTracking(tn.toUpperCase()); })();
    }
  }catch(e){}
}

// Thumbnail click -> modal preview
document.addEventListener('click', (e)=>{
  const t = e.target.closest('.top-thumbs .thumb');
  if(!t) return;
  const src = t.getAttribute('src');
  const modal = document.createElement('div');
  modal.className = 'img-modal';
  modal.innerHTML = `<div class="img-wrap"><img src="${src}" alt="Preview"><button class="close-btn" onclick="this.closest('.img-modal').remove();">Close</button></div>`;
  document.body.appendChild(modal);
});
