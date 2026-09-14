/* Mock stand-in for GET /space/layers and /space/impact-summary */
window.MockData = window.MockData || {};

window.MockData.space = {
  meta: { generated_at: "2026-09-07T00:00:00Z", source: "Sentinel-2 / Landsat composite" },
  layers: {
    ndvi:     { label: "NDVI (vegetation)", color: "#3C7A50" },
    lst:      { label: "Land Surface Temp.", color: "#AE4438" },
    dem:      { label: "Elevation (DEM)", color: "#3D6E8F" },
    rainfall: { label: "Rainfall", color: "#5A7C99" }
  },
  timeline: ["Jun", "Jul", "Aug", "Sep"],
  impactSummary: "Vegetation index over the North Ridge buffer zone has declined 6% since June, tracking with reduced rainfall. Land surface temperature in the same zone is running 2.1°C above the seasonal average, which correlates with the haul-road dust readings logged this month."
};
