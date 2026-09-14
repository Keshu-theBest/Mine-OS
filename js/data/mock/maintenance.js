/* Mock stand-in for GET /maintenance/equipment and /maintenance/equipment/{id} */
window.MockData = window.MockData || {};

window.MockData.maintenance = {
  meta: { generated_at: "2026-09-08T05:30:00Z", model_version: "rul-predict-v0.2" },
  equipment: [
    { id: "TRK-07", name: "Haul Truck 07", type: "Haul Truck", status: "critical",
      rulDays: 6, failureProb: 0.71,
      sensor: [78, 81, 84, 88, 91, 94, 97] },
    { id: "TRK-03", name: "Haul Truck 03", type: "Haul Truck", status: "watch",
      rulDays: 24, failureProb: 0.34,
      sensor: [60, 62, 61, 64, 66, 68, 70] },
    { id: "DRL-02", name: "Rotary Drill 02", type: "Drill", status: "good",
      rulDays: 96, failureProb: 0.08,
      sensor: [40, 41, 39, 42, 41, 40, 42] },
    { id: "CNV-01", name: "Conveyor Line 1", type: "Conveyor", status: "watch",
      rulDays: 31, failureProb: 0.29,
      sensor: [55, 57, 58, 60, 59, 63, 65] },
    { id: "TRK-11", name: "Haul Truck 11", type: "Haul Truck", status: "good",
      rulDays: 140, failureProb: 0.05,
      sensor: [38, 37, 39, 38, 40, 39, 41] },
    { id: "EXC-04", name: "Excavator 04", type: "Excavator", status: "good",
      rulDays: 112, failureProb: 0.11,
      sensor: [44, 45, 43, 46, 45, 47, 46] }
  ]
};
