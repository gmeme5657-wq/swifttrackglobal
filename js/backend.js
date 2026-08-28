(function(){
const c=window.SWIFT_CONFIG||{};
window.SwiftBackend={
ready:Boolean(window.SWIFT_BACKEND_READY&&window.supabase),
client:null,
async init(){if(!this.ready)return null;this.client=window.supabase.createClient(c.supabaseUrl,c.supabaseAnonKey);return this.client},
subscribeShipments(callback){
  if(!this.client)return null;
  return this.client.channel("public-shipment-updates")
    .on("postgres_changes",{event:"*",schema:"public",table:"shipments"},payload=>callback(payload))
    .subscribe();
},
async getShipmentByTracking(trackingNumber){
  if(!this.client)return null;
  const result=await this.client.from("shipments").select("*").eq("tracking_number",trackingNumber).maybeSingle();
  if(result.error)throw result.error;
  return result.data;
},
async upsertShipment(shipment){
  if(!this.client) return null;
  const row={
    ...(shipment.id?{id:shipment.id}:{}),
    tracking_number:shipment.trackingNumber,
    sender_name:shipment.sender?.name||"Warehouse",
    sender_address:shipment.sender?.address||"",
    receiver_name:shipment.receiver?.name||"Recipient",
    receiver_email:shipment.receiver?.email||"",
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
    driver_id:shipment.driverId||null,
    updated_at:new Date().toISOString()
  };
  const result=await this.client.from("shipments").upsert(row,{onConflict:"tracking_number"}).select().single();
  if(result.error)throw result.error;
  return result.data;
},
async deleteShipment(id){
  if(!this.client) return;
  const result=await this.client.from("shipments").delete().eq("id",id);
  if(result.error)throw result.error;
},
async signIn(email,password){if(!this.ready)throw Error("Supabase is not configured yet.");return this.client.auth.signInWithPassword({email,password})},
async signOut(){if(this.client)return this.client.auth.signOut()},
async recordLocation(driverId,shipmentId,p){if(!this.ready)throw Error("Supabase is not configured yet.");const row={driver_id:driverId,shipment_id:shipmentId,latitude:p.coords.latitude,longitude:p.coords.longitude,accuracy_m:p.coords.accuracy};const result=await this.client.from("driver_locations").insert(row);if(result.error)throw result.error;if(shipmentId){const update=await this.client.from("shipments").update({current_lat:row.latitude,current_lng:row.longitude,updated_at:new Date().toISOString()}).eq("id",shipmentId);if(update.error)throw update.error}},
async uploadProof(shipmentId,file,signatureName,notes,userId){if(!this.ready)throw Error("Supabase is not configured yet.");let photo_path=null;if(file){photo_path=shipmentId+"/"+Date.now()+"-"+file.name;const result=await this.client.storage.from("delivery-proofs").upload(photo_path,file,{upsert:true});if(result.error)throw result.error}const result=await this.client.from("delivery_proofs").upsert({shipment_id:shipmentId,signature_name:signatureName,notes,photo_path,delivered_at:new Date().toISOString(),created_by:userId});if(result.error)throw result.error}
,
async testShipments(){if(!this.ready)throw Error("Supabase is not configured yet.");await this.init();const {data,error}=await this.client.from("shipments").select("*").limit(1);console.log(data,error);return {data,error}}
};
window.SwiftBackend.init();
})();
