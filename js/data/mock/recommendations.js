/* Mock stand-in for GET /decisions and POST /decisions/{id}/accept|reject|snooze */
window.MockData = window.MockData || {};

window.MockData.recommendations = {
  meta: { generated_at: "2026-09-08T06:00:00Z", model_version: "decision-fusion-v0.1" },
  items: [
    {
      id: "REC-101", module: "Production + Fleet", confidence: 0.84, status: "pending",
      title: "Reroute two trucks from Block E-4 to Block C-3 for the next 3 shifts",
      why: "Block C-3 ore grade is 8% higher and two haul trucks are already idled near that block, which would offset the forecast shortfall by an estimated 4%.",
      sourceModules: ["Production Intelligence", "Fleet Intelligence"]
    },
    {
      id: "REC-102", module: "Predictive Maintenance", confidence: 0.91, status: "pending",
      title: "Schedule Haul Truck 07 for maintenance within 48 hours",
      why: "Sensor drift over the last 7 readings puts failure probability at 71% within 6 days; a planned stop now costs less downtime than an unplanned one.",
      sourceModules: ["Predictive Maintenance"]
    },
    {
      id: "REC-103", module: "Exploration", confidence: 0.64, status: "pending",
      title: "Prioritize drilling at Eastern Slope (Z-22) over Ridge Extension (Z-31)",
      why: "Z-22's confidence score is 9 points higher and sits closer to existing haul infrastructure, reducing the cost of a confirmed find.",
      sourceModules: ["Exploration Intelligence"]
    },
    {
      id: "REC-104", module: "Space + Production", confidence: 0.58, status: "accepted",
      title: "Delay North Ridge haul-road grading by one week",
      why: "Rainfall forecast shows a dry window opening next week; grading now risks rework if rain returns as satellite trends suggest.",
      sourceModules: ["Space Intelligence", "Production Intelligence"]
    },
    {
      id: "REC-097", module: "Fleet Intelligence", confidence: 0.77, status: "rejected",
      title: "Reduce night-shift dispatch by one truck",
      why: "Utilization data showed a dip, but this was overridden — mine manager noted a temporary shift-count anomaly, not a real trend.",
      sourceModules: ["Fleet Intelligence"]
    }
  ]
};
