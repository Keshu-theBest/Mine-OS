/* Mock stand-in for GET /fleet/trucks and /fleet/dispatch-queue */
window.MockData = window.MockData || {};

window.MockData.fleet = {
  meta: { generated_at: "2026-09-08T06:10:00Z" },
  trucks: [
    { id: "TRK-01", x: 180, y: 220, status: "hauling" },
    { id: "TRK-03", x: 340, y: 160, status: "hauling" },
    { id: "TRK-05", x: 420, y: 300, status: "idle" },
    { id: "TRK-07", x: 560, y: 240, status: "maintenance" },
    { id: "TRK-09", x: 260, y: 360, status: "hauling" },
    { id: "TRK-11", x: 610, y: 130, status: "returning" }
  ],
  dispatchQueue: [
    { truck: "TRK-01", route: "Block A-1 → Crusher 2", eta: "8 min" },
    { truck: "TRK-03", route: "Block C-3 → Crusher 1", eta: "14 min" },
    { truck: "TRK-05", route: "Idle — awaiting assignment", eta: "—" },
    { truck: "TRK-09", route: "Block A-2 → Stockpile B", eta: "6 min" },
    { truck: "TRK-11", route: "Crusher 1 → Block N-1", eta: "11 min" }
  ],
  utilization: 0.68
};
