/* Mock stand-in for GET /settings/data-sources */
window.MockData = window.MockData || {};

window.MockData.dataSources = [
  { name: "SAP ERP", status: "connected", meta: "Synced 4 min ago · production, inventory" },
  { name: "QR Asset Management", status: "connected", meta: "Synced 11 min ago · equipment tagging" },
  { name: "Underground Activity Digitization", status: "connected", meta: "Synced 1 hr ago · shift logs" },
  { name: "Sentinel-2 / Landsat Feed", status: "connected", meta: "Last pass 18 hrs ago" },
  { name: "Weather Station Network", status: "pending", meta: "Awaiting API credentials" }
];
