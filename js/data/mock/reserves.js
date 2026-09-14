/* Mock stand-in for GET /exploration/reserves and POST /exploration/predict.
  `zone.path` coordinates are schematic (SVG viewBox 0 0 800 500), not real
  geo-coordinates — swap for a GeoJSON-driven layer when the real map ships. */
window.MockData = window.MockData || {};

window.MockData.reserves = {
  meta: { generated_at: "2026-09-08T04:00:00Z", model_version: "reserve-predict-v0.5" },
  zones: [
    { id: "Z-14", name: "North Ridge Block", confidence: 0.82, status: "predicted",
      location: "Rajasthan", commodity: "Copper", longitude: 75.7873, latitude: 26.9124, cx: 210, cy: 150, r: 46 },
    { id: "Z-09", name: "Central Trough", confidence: 0.91, status: "confirmed",
      location: "Odisha", commodity: "Iron ore", longitude: 85.8245, latitude: 20.2961, cx: 420, cy: 260, r: 58 },
    { id: "Z-22", name: "Eastern Slope", confidence: 0.64, status: "predicted",
      location: "Jharkhand", commodity: "Manganese", longitude: 85.2799, latitude: 23.6102, cx: 590, cy: 190, r: 38 },
    { id: "Z-05", name: "South Basin", confidence: 0.73, status: "predicted",
      location: "Karnataka", commodity: "Lithium", longitude: 76.6394, latitude: 12.2958, cx: 330, cy: 380, r: 42 },
    { id: "Z-31", name: "Ridge Extension", confidence: 0.55, status: "low-confidence",
      location: "Chhattisgarh", commodity: "Bauxite", longitude: 81.6296, latitude: 21.2514, cx: 650, cy: 340, r: 30 }
  ],
  drillPoints: [
    { x: 200, y: 140 }, { x: 240, y: 165 }, { x: 415, y: 250 },
    { x: 430, y: 275 }, { x: 320, y: 370 }, { x: 600, y: 195 }
  ]
};
