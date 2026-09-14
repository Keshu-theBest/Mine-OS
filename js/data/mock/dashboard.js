/* Mock stand-in for GET /dashboard/summary */
window.MockData = window.MockData || {};

window.MockData.dashboardSummary = {
  meta: { generated_at: "2026-09-08T06:20:00Z" },
  kpis: [
    { label: "Reserve confidence", value: 82, unit: "%", trend: "up", delta: "+3 pts vs last week" },
    { label: "Production forecast accuracy", value: 91, unit: "%", trend: "flat", delta: "steady vs last week" },
    { label: "Equipment health index", value: 76, unit: "/100", trend: "down", delta: "-4 pts vs last week" },
    { label: "Fleet utilization", value: 68, unit: "%", trend: "up", delta: "+2 pts vs last week" }
  ]
};
