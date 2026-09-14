import http from "node:http";

const port=Number(process.env.PORT||8787);
const supabaseUrl=process.env.SUPABASE_URL||"";
const anonKey=process.env.SUPABASE_ANON_KEY||"";
const corsOrigin=process.env.CORS_ORIGIN||"http://localhost:4173";
const adminEmails=new Set((process.env.ADMIN_EMAILS||"").split(",").map(value=>value.trim().toLowerCase()).filter(Boolean));

function send(res,status,body){
  const headers={"Content-Type":"application/json","Access-Control-Allow-Origin":corsOrigin,"Access-Control-Allow-Headers":"authorization,content-type","Access-Control-Allow-Methods":"GET,POST,PATCH,DELETE,OPTIONS"};
  res.writeHead(status,headers);
  res.end(status===204?"":JSON.stringify(body));
}

function bearer(req){
  const value=req.headers.authorization||"";
  return value.match(/^Bearer\s+(.+)$/i)?.[1]||null;
}

async function db(path,token,options={}){
  const response=await fetch(`${supabaseUrl}/rest/v1/${path}`,{
    ...options,
    headers:{apikey:anonKey,Authorization:`Bearer ${token||anonKey}`,"Content-Type":"application/json",...(options.headers||{})}
  });
  const text=await response.text();
  let data=null;
  try{data=text?JSON.parse(text):null;}catch{}
  if(!response.ok) throw Object.assign(new Error(data?.message||"Supabase request failed"),{status:response.status});
  return data;
}

async function currentUser(token){
  const response=await fetch(`${supabaseUrl}/auth/v1/user`,{headers:{apikey:anonKey,Authorization:`Bearer ${token}`}});
  if(!response.ok) return null;
  return response.json();
}

async function requireAdmin(req){
  const token=bearer(req);
  if(!token) throw Object.assign(new Error("Authentication required"),{status:401});
  const user=await currentUser(token);
  const role=user?.app_metadata?.role;
  const email=String(user?.email||"").toLowerCase();
  if(!user || (role!=="admin" && role!=="dispatcher" && !adminEmails.has(email))){
    throw Object.assign(new Error("Administrator access required"),{status:403});
  }
  return token;
}

async function requireOperator(req){
  const token=bearer(req);
  if(!token) throw Object.assign(new Error("Authentication required"),{status:401});
  const user=await currentUser(token);
  const role=user?.app_metadata?.role;
  if(!user || !["admin","dispatcher","driver"].includes(role)){
    throw Object.assign(new Error("Operator access required"),{status:403});
  }
  return token;
}

async function body(req){
  let value="";
  for await(const chunk of req) value+=chunk;
  try{return value?JSON.parse(value):{};}catch{throw Object.assign(new Error("Invalid JSON body"),{status:400});}
}

const publicShipmentFields="id,tracking_number,origin_city,destination_city,current_lat,current_lng,status,created_at,updated_at";

http.createServer(async(req,res)=>{
  if(req.method==="OPTIONS"){send(res,204,{});return;}
  if(!req.url.startsWith("/api/")){send(res,404,{error:"Not found"});return;}
  if(!supabaseUrl||!anonKey){send(res,503,{error:"Backend is not configured."});return;}

  try{
    const url=new URL(req.url,`http://${req.headers.host}`);
    const tracking=url.pathname.match(/^\/api\/tracking\/([^/]+)$/);
    if(req.method==="GET"&&tracking){
      const trackingNumber=decodeURIComponent(tracking[1]).trim().toUpperCase();
      let rows;
      try{
        rows=await db(`public_tracking_shipments?select=${publicShipmentFields}&tracking_number=eq.${encodeURIComponent(trackingNumber)}&limit=1`,anonKey);
      }catch(error){
        if(error.status!==404) throw error;
        rows=await db(`shipments?select=${publicShipmentFields}&tracking_number=eq.${encodeURIComponent(trackingNumber)}&limit=1`,anonKey);
      }
      if(!rows?.[0]){send(res,404,{error:"Shipment not found"});return;}
      let events;
      try{
        events=await db(`public_tracking_events?select=status,location,created_at&shipment_id=eq.${rows[0].id}&order=created_at.desc`,anonKey);
      }catch(error){
        if(error.status!==404) throw error;
        events=await db(`shipment_events?select=status,location,created_at&shipment_id=eq.${rows[0].id}&order=created_at.desc`,anonKey);
      }
      send(res,200,{shipment:rows[0],events});
      return;
    }

    if(req.method==="GET"&&url.pathname==="/api/admin/shipments"){
      const token=await requireAdmin(req);
      send(res,200,{shipments:await db("shipments?select=*&order=created_at.desc",token)});
      return;
    }

    const shipment=url.pathname.match(/^\/api\/admin\/shipments\/([0-9a-f-]{36})$/i);
    if(shipment&&(req.method==="PATCH"||req.method==="DELETE")){
      const token=await requireAdmin(req);
      if(req.method==="DELETE"){
        await db(`shipments?id=eq.${shipment[1]}`,token,{method:"DELETE"});
        send(res,204,{});
        return;
      }
      const patch=await body(req);
      const allowed={};
      for(const key of ["status","current_lat","current_lng","driver_id"]){if(Object.hasOwn(patch,key)) allowed[key]=patch[key];}
      allowed.updated_at=new Date().toISOString();
      const result=await db(`shipments?id=eq.${shipment[1]}`,token,{method:"PATCH",body:JSON.stringify(allowed),headers:{Prefer:"return=representation"}});
      send(res,200,{shipment:result?.[0]||null});
      return;
    }

    if(req.method==="POST"&&url.pathname==="/api/driver/location"){
      const token=await requireOperator(req);
      const value=await body(req);
      if(!Number.isFinite(Number(value.latitude))||!Number.isFinite(Number(value.longitude))){send(res,400,{error:"Valid latitude and longitude are required."});return;}
      const location=await db("driver_locations",token,{method:"POST",body:JSON.stringify(value),headers:{Prefer:"return=representation"}});
      if(value.shipment_id) await db(`shipments?id=eq.${encodeURIComponent(value.shipment_id)}`,token,{method:"PATCH",body:JSON.stringify({current_lat:value.latitude,current_lng:value.longitude,updated_at:new Date().toISOString()})});
      send(res,201,{location:location?.[0]||null});
      return;
    }

    send(res,404,{error:"Route not found"});
  }catch(error){
    const status=Number(error.status)||500;
    if(status>=500) console.error("API request failed",error);
    send(res,status,{error:status>=500?"Internal server error":error.message});
  }
}).listen(port,()=>console.log(`Swift tracking API listening on port ${port}`));
