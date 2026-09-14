document.addEventListener("DOMContentLoaded", () => {
  const kpiRow = document.getElementById("kpi-row");
  Components.Card.renderSkeletonKpis(kpiRow, 4);

  Api.getDashboardSummary().then(({ data, meta }) => {
    Components.Card.renderKpis(kpiRow, data);
    document.getElementById("updated-at").textContent = new Date(meta.generated_at).toLocaleString();
  });

  Api.getReserves().then(({ data }) => {
    Components.Map.renderZoneMap(document.getElementById("dash-map"), data, [], () => {
      window.location.href = "exploration.html";
    });
  });

  Api.getProductionForecast("monthly").then(({ data }) => {
    const canvas = document.getElementById("dash-chart");
    const series = [
      { label: "Actual", color: "#3D6E8F", data: data.actual },
      { label: "Forecast", color: "#A8672B", data: data.forecast, dashedForecastFrom: data.actual.filter(v=>v!==null).length - 1 }
    ];
    Components.Chart.render(canvas, { labels: data.labels, series });
    Components.Chart.renderLegend(document.getElementById("dash-chart-legend"), series);
  });

  function loadRecs() {
    Api.getRecommendations(3).then(({ data }) => {
      document.getElementById("rec-count").textContent = data.length;
      Components.Recommendation.renderList(document.getElementById("rec-feed"), data, { onAction: loadRecs });
    });
  }
  loadRecs();

  Api.getAlerts(5).then(({ data }) => {
    const el = document.getElementById("alert-ticker");
    el.innerHTML = data.map((a) => `
      <div class="ticker-row">
        <span class="ticker-row__time">${a.time}</span>
        <span class="badge badge--${a.severity}">${a.severity}</span>
        <span>${a.text}</span>
      </div>`).join("");
  });
});
