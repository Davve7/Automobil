/* Page: network first, always revalidated past the GitHub Pages 10 min cache, with a 4 s limit.
   Everything else: from the cache, refreshed in the background. Data in IndexedDB is never touched. */
const CACHE="automobil-v2";
const FILES=["./","manifest.webmanifest","icon-192.png","icon-512.png","icon-maskable-512.png","apple-touch-icon.png","favicon-32.png","favicon.ico"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled(FILES.map(x=>c.add(x)))))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE&&x.startsWith("automobil-")).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
async function page(r){
  const c=await caches.open(CACHE);
  const net=fetch(r.url,{cache:"no-cache",credentials:"same-origin"}).then(res=>{if(res.ok)c.put("./",res.clone());return res});
  const limit=new Promise(ok=>setTimeout(()=>ok(null),4000));
  try{const res=await Promise.race([net,limit]);if(res&&res.ok)return res}catch(e){}
  const hit=await c.match("./");if(hit)return hit;
  return net;
}
async function asset(r){
  const c=await caches.open(CACHE),hit=await c.match(r);
  const net=fetch(r).then(res=>{if(res.ok||res.type==="opaque")c.put(r,res.clone());return res});
  if(hit){net.catch(()=>{});return hit}
  return net;
}
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  const u=new URL(r.url);
  if(r.mode==="navigate"&&u.origin===location.origin){e.respondWith(page(r));return}
  if(u.origin===location.origin||/^fonts\.(googleapis|gstatic)\.com$/.test(u.hostname))e.respondWith(asset(r));
});
