window.SWIFT_CONFIG={
  // Set these values in the deployed site (never commit a service-role key).
  supabaseUrl:"",
  supabaseAnonKey:"",
  backendApiUrl:"",
  emailFunctionName:"send-shipment-email"
};
window.SWIFT_BACKEND_READY=Boolean(window.SWIFT_CONFIG.supabaseUrl&&window.SWIFT_CONFIG.supabaseAnonKey);
window.SWIFT_BACKEND_API=window.SWIFT_CONFIG.backendApiUrl||"";
