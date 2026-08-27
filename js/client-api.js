window.SwiftClientApi={
  async track(trackingNumber){
    if(!window.SWIFT_BACKEND_API)return null;
    const response=await fetch(`${window.SWIFT_BACKEND_API}/api/tracking/${encodeURIComponent(trackingNumber)}`,{cache:"no-store"});
    if(response.status===404)return null;
    if(!response.ok)throw Error("Tracking service is unavailable.");
    return response.json();
  }
};
