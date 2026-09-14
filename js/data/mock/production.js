/* Mock stand-in for GET /production/forecast and /production/shortfall-explanation.
   Swap in services/api.js once the real endpoint exists — shape should stay identical. */
window.MockData = window.MockData || {};

window.MockData.production = {
  meta: { generated_at: "2026-09-08T06:00:00Z", model_version: "prod-forecast-v0.3" },
  daily: {
    labels: ["Sep 1","Sep 2","Sep 3","Sep 4","Sep 5","Sep 6","Sep 7","Sep 8","Sep 9","Sep 10"],
    actual:   [412, 398, 405, 388, 410, 401, 395, 380, 372, null],
    forecast: [410, 405, 400, 396, 402, 399, 390, 384, 375, 361]
  },
  weekly: {
    labels: ["Wk 27","Wk 28","Wk 29","Wk 30","Wk 31","Wk 32","Wk 33","Wk 34"],
    actual:   [2840, 2790, 2910, 2760, 2680, 2705, 2610, null],
    forecast: [2820, 2800, 2880, 2790, 2700, 2690, 2590, 2480]
  },
  monthly: {
    labels: ["Mar","Apr","May","Jun","Jul","Aug","Sep"],
    actual:   [11800, 12100, 11650, 11200, 10890, 10510, null],
    forecast: [11750, 12050, 11700, 11150, 10800, 10480, 9920]
  },
  unit: "tonnes",
  threshold: 10000,
  shortfallExplanation: {
    headline: "Forecast dips below the 10,000t monthly threshold in the next cycle.",
    factors: [
      { label: "Below-average rainfall reducing haul-road usability", weight: 0.38 },
      { label: "Two haul trucks flagged for maintenance (Fleet Bay 3, 7)", weight: 0.31 },
      { label: "Ore grade in active Block C running lower than planned", weight: 0.19 },
      { label: "Planned shift reduction during equipment servicing window", weight: 0.12 }
    ]
  }
};
