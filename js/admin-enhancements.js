/* Admin-only enhancements for the local demo workflow. */
(function(){
  const baseRenderShipments = window.renderShipments;
  if(typeof baseRenderShipments !== "function") return;
  window.renderShipments = function(main){
    baseRenderShipments(main);
    const table = main.querySelector(".table-wrap");
    if(!table || main.querySelector(".shipment-tools")) return;
    const tools = document.createElement("div");
    tools.className = "shipment-tools";
    tools.innerHTML = "<input type=\"search\" id=\"shipment-search\" placeholder=\"Search tracking, route, recipient...\" aria-label=\"Search shipments\"><select id=\"shipment-status-filter\" aria-label=\"Filter shipments by status\"><option value=\"\">All statuses</option>" + STATUS_STEPS.map(status => "<option value=\""+status+"\">"+status+"</option>").join("") + "<option value=\"Exception\">Exception</option></select><span id=\"shipment-count\" class=\"table-count\"></span>";
    table.parentNode.insertBefore(tools, table);
    const apply = function(){
      const query = (tools.querySelector("#shipment-search").value || "").trim().toLowerCase();
      const status = tools.querySelector("#shipment-status-filter").value.toLowerCase();
      const rows = Array.from(main.querySelectorAll("#shipments-tbody tr"));
      let visible = 0;
      rows.forEach(row => { const text = row.textContent.toLowerCase(); const matches = (!query || text.includes(query)) && (!status || text.includes(status)); row.hidden = !matches; if(matches) visible++; });
      tools.querySelector("#shipment-count").textContent = visible + " shipment" + (visible === 1 ? "" : "s");
    };
    tools.querySelector("#shipment-search").addEventListener("input", apply);
    tools.querySelector("#shipment-status-filter").addEventListener("change", apply);
    apply();
  };
})();
