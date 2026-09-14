/* Mock stand-in for GET /alerts */
window.MockData = window.MockData || {};

window.MockData.alerts = {
  meta: { generated_at: "2026-09-08T06:20:00Z" },
  items: [
    { id: "A-401", time: "06:12", severity: "critical", module: "Maintenance", text: "Haul Truck 07 vibration sensor exceeded critical threshold" },
    { id: "A-400", time: "05:48", severity: "watch", module: "Production", text: "Weekly forecast trending 6% below plan" },
    { id: "A-399", time: "04:30", severity: "info", module: "Space", text: "New Sentinel-2 pass processed for North Ridge buffer zone" },
    { id: "A-398", time: "02:15", severity: "watch", module: "Fleet", text: "Dispatch queue backlog at Crusher 1 exceeds 15 min" },
    { id: "A-397", time: "Yesterday", severity: "critical", module: "Maintenance", text: "Conveyor Line 1 bearing temperature spike, auto-logged" },
    { id: "A-396", time: "Yesterday", severity: "info", module: "Exploration", text: "Reserve prediction re-run completed for Eastern Slope" }
  ]
};
