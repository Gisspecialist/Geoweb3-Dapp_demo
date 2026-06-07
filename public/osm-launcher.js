(function(){
  function add(){
    if(document.getElementById('geo-osm-launcher')) return;
    var a=document.createElement('a');
    a.id='geo-osm-launcher';
    a.href='/osm-rewards.html';
    a.textContent='🌍 OSM Rewards';
    a.style.cssText='position:fixed;right:18px;bottom:82px;z-index:9998;text-decoration:none;background:var(--geo-panel,#0d1b20);color:var(--geo-accent,#00d4aa);border:1px solid var(--geo-border,rgba(255,255,255,.14));border-radius:999px;padding:10px 14px;font:700 13px Arial;box-shadow:0 10px 30px rgba(0,0,0,.25)';
    document.body.appendChild(a);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',add); else add();
})();
