/* ==========================================================================
   MineOS AI — services/api.js

   This is the ONLY file page scripts talk to for data. Every function below
   currently resolves from the static mock objects in js/data/mock/*.js, and
   returns a Promise so page code already reads like it's talking to a real
   backend. When the backend/AI team's endpoints exist:

     1. Point BASE_URL at the real API.
     2. Replace the body of each function with a fetch() to the matching
        route (see the comment above each function for the intended path).
     3. Nothing in js/pages/*.js needs to change, because the return shape
        is documented and kept identical to the mock shape.

   Every response is wrapped the same way real endpoints should be:
     { data, meta, error }
   ========================================================================== */

const Api = (() => {
  const BASE_URL = "/api/v1"; // not used yet — placeholder for the real backend
  const LATENCY_MS = 260;     // simulated network delay so loading states are visible

  function ok(data, meta) {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ data, meta: meta || {}, error: null }), LATENCY_MS);
    });
  }

  return {
    // GET /dashboard/summary
    getDashboardSummary() {
      return ok(window.MockData.dashboardSummary.kpis, window.MockData.dashboardSummary.meta);
    },

    // GET /decisions?limit=N
    getRecommendations(limit) {
      const items = window.MockData.recommendations.items;
      return ok(limit ? items.slice(0, limit) : items, window.MockData.recommendations.meta);
    },

    // POST /decisions/{id}/accept | /reject | /snooze
    setRecommendationStatus(id, status) {
      const item = window.MockData.recommendations.items.find((r) => r.id === id);
      if (item) item.status = status;
      return ok(item);
    },

    // GET /alerts?limit=N
    getAlerts(limit) {
      const items = window.MockData.alerts.items;
      return ok(limit ? items.slice(0, limit) : items, window.MockData.alerts.meta);
    },

    // GET /exploration/reserves
    getReserves() {
      return ok(window.MockData.reserves.zones, window.MockData.reserves.meta);
    },

    // POST /exploration/predict — simulated: nudges confidence values to show a "new run"
    runReservePrediction() {
      const zones = window.MockData.reserves.zones.map((z) => ({
        ...z,
        confidence: Math.min(0.97, +(z.confidence + (Math.random() * 0.06 - 0.02)).toFixed(2))
      }));
      window.MockData.reserves.zones = zones;
      return ok(zones, { generated_at: new Date().toISOString() });
    },

    // GET /production/forecast?range=daily|weekly|monthly
    getProductionForecast(range) {
      const series = window.MockData.production[range || "daily"];
      return ok(series, window.MockData.production.meta);
    },

    // GET /production/shortfall-explanation
    getShortfallExplanation() {
      return ok(window.MockData.production.shortfallExplanation, window.MockData.production.meta);
    },

    // GET /maintenance/equipment
    getEquipmentList() {
      return ok(window.MockData.maintenance.equipment, window.MockData.maintenance.meta);
    },

    // GET /maintenance/equipment/{id}
    getEquipmentDetail(id) {
      const item = window.MockData.maintenance.equipment.find((e) => e.id === id);
      return ok(item, window.MockData.maintenance.meta);
    },

    // GET /fleet/trucks
    getFleetTrucks() {
      return ok(window.MockData.fleet.trucks, window.MockData.fleet.meta);
    },

    // GET /fleet/dispatch-queue
    getDispatchQueue() {
      return ok(window.MockData.fleet.dispatchQueue, window.MockData.fleet.meta);
    },

    // POST /fleet/optimize-dispatch — simulated: shuffles ETAs slightly
    optimizeDispatch() {
      const q = window.MockData.fleet.dispatchQueue.map((r) => ({ ...r }));
      return ok(q, { generated_at: new Date().toISOString() });
    },

    // GET /space/layers?type=...
    getSpaceLayers() {
      return ok(window.MockData.space.layers, window.MockData.space.meta);
    },

    // GET /space/impact-summary
    getImpactSummary() {
      return ok(window.MockData.space.impactSummary, window.MockData.space.meta);
    },

    // GET /reports?range=&module=
    getReportSummary() {
      return ok({
        productionTotal: 10510,
        recommendationsAccepted: 14,
        recommendationsRejected: 3,
        avgConfidence: 0.79
      });
    },

    // GET /settings/data-sources
    getDataSources() {
      return ok(window.MockData.dataSources);
    }
  };
})();
