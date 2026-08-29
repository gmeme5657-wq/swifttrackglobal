(function(){
const c=window.SWIFT_CONFIG||{};
window.SwiftBackend={
ready:Boolean(window.SWIFT_BACKEND_READY&&window.supabase),
client:null,
ensureClient(){
  if(!window.SWIFT_BACKEND_READY){
    this.ready=false;
    return null;
  }
  if(!window.supabase){
    this.ready=false;
    return null;
  }
  if(!this.client){
    this.client=window.supabase.createClient(c.supabaseUrl,c.supabaseAnonKey);
  }
  this.ready=true;
  return this.client;
},
async init(){return this.ensureClient();},
subscribeShipments(callback){
  const client=this.ensureClient();
  if(!client)return null;
  return client.channel("public-shipment-updates")
    .on("postgres_changes",{event:"*",schema:"public",table:"shipments"},payload=>callback(payload))
    .subscribe();
},
async getShipmentByTracking(trackingNumber){
  const client=this.ensureClient();
  if(!client)return null;
  const result=await client.from("shipments").select("*").eq("tracking_number",trackingNumber).maybeSingle();
  if(result.error)throw result.error;
  return result.data;
},
async upsertShipment(shipment){
  const client=this.ensureClient();
  if(!client) return null;
  const row={
    ...(shipment.id?{id:shipment.id}:{}),
    tracking_number:shipment.trackingNumber,
    sender_name:shipment.sender?.name||"Warehouse",
    sender_address:shipment.sender?.address||"",
    receiver_name:shipment.receiver?.name||"Recipient",
    receiver_email:shipment.receiver?.email||"",
    receiver_phone:shipment.receiver?.phone||"",
    receiver_address:shipment.receiver?.address||"",
    origin_city:shipment.origin?.city||"",
    origin_lat:shipment.origin?.lat,
    origin_lng:shipment.origin?.lng,
    destination_city:shipment.destination?.city||"",
    destination_lat:shipment.destination?.lat,
    destination_lng:shipment.destination?.lng,
    current_lat:shipment.currentPos?.lat,
    current_lng:shipment.currentPos?.lng,
    status:shipment.status||"Order Placed",
    driver_id:/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(shipment.driverId||"")?shipment.driverId:null,
    updated_at:new Date().toISOString()
  };
  const result=await client.from("shipments").upsert(row,{onConflict:"tracking_number"}).select().single();
  if(result.error)throw result.error;
  return result.data;
},
async deleteShipment(id){
  const client=this.ensureClient();
  if(!client) return;
  const result=await client.from("shipments").delete().eq("id",id);
  if(result.error)throw result.error;
},
async signIn(email,password){const client=this.ensureClient();if(!client)throw Error("Supabase is not configured yet.");return client.auth.signInWithPassword({email,password})},
async signOut(){const client=this.ensureClient();if(client)return client.auth.signOut()},
async recordLocation(driverId,shipmentId,p){const client=this.ensureClient();if(!client)throw Error("Supabase is not configured yet.");const row={driver_id:driverId,shipment_id:shipmentId,latitude:p.coords.latitude,longitude:p.coords.longitude,accuracy_m:p.coords.accuracy};const result=await client.from("driver_locations").insert(row);if(result.error)throw result.error;if(shipmentId){const update=await client.from("shipments").update({current_lat:row.latitude,current_lng:row.longitude,updated_at:new Date().toISOString()}).eq("id",shipmentId);if(update.error)throw update.error}},
async uploadProof(shipmentId,file,signatureName,notes,userId){const client=this.ensureClient();if(!client)throw Error("Supabase is not configured yet.");let photo_path=null;if(file){photo_path=shipmentId+"/"+Date.now()+"-"+file.name;const result=await client.storage.from("delivery-proofs").upload(photo_path,file,{upsert:true});if(result.error)throw result.error}const result=await client.from("delivery_proofs").upsert({shipment_id:shipmentId,signature_name:signatureName,notes,photo_path,delivered_at:new Date().toISOString(),created_by:userId});if(result.error)throw result.error}
,
async testShipments(){const client=this.ensureClient();if(!client)throw Error("Supabase is not configured yet.");const {data,error}=await client.from("shipments").select("*").limit(1);console.log(data,error);return {data,error}}
};
if(document.readyState === 'loading'){document.addEventListener('DOMContentLoaded',()=>window.SwiftBackend.init(),{once:true});}else{window.SwiftBackend.init();}
})();
