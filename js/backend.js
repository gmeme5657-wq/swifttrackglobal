(function(){
const c=window.SWIFT_CONFIG||{};
window.SwiftBackend={
ready:Boolean(window.SWIFT_BACKEND_READY&&window.supabase),
client:null,
async init(){if(!this.ready)return null;this.client=window.supabase.createClient(c.supabaseUrl,c.supabaseAnonKey);return this.client},
async signIn(email,password){if(!this.ready)throw Error("Supabase is not configured yet.");return this.client.auth.signInWithPassword({email,password})},
async signOut(){if(this.client)return this.client.auth.signOut()},
async recordLocation(driverId,shipmentId,p){if(!this.ready)throw Error("Supabase is not configured yet.");const row={driver_id:driverId,shipment_id:shipmentId,latitude:p.coords.latitude,longitude:p.coords.longitude,accuracy_m:p.coords.accuracy};const result=await this.client.from("driver_locations").insert(row);if(result.error)throw result.error;if(shipmentId)await this.client.from("shipments").update({current_lat:row.latitude,current_lng:row.longitude,updated_at:new Date().toISOString()}).eq("id",shipmentId)},
async uploadProof(shipmentId,file,signatureName,notes,userId){if(!this.ready)throw Error("Supabase is not configured yet.");let photo_path=null;if(file){photo_path=shipmentId+"/"+Date.now()+"-"+file.name;const result=await this.client.storage.from("delivery-proofs").upload(photo_path,file,{upsert:true});if(result.error)throw result.error}const result=await this.client.from("delivery_proofs").upsert({shipment_id:shipmentId,signature_name:signatureName,notes,photo_path,delivered_at:new Date().toISOString(),created_by:userId});if(result.error)throw result.error}
};
window.SwiftBackend.init();
})();
