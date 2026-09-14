document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("prod-chart");

  function loadChart(range) {
    Api.getProductionForecast(range).then(({ data }) => {
      const actualCount = data.actual.filter((v) => v !== null).length;
      const series = [
        { label: "Actual", color: "#3D6E8F", data: data.actual },
        { label: "Forecast", color: "#A8672B", data: data.forecast, dashedForecastFrom: actualCount - 1 }
      ];
      Components.Chart.render(canvas, { labels: data.labels, series });
      Components.Chart.renderLegend(document.getElementById("prod-legend"), series);
    });
  }
  loadChart("monthly");

  document.querySelectorAll("#range-tabs .tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll("#range-tabs .tab").forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      loadChart(tab.getAttribute("data-range"));
    });
  });

  Api.getShortfallExplanation().then(({ data }) => {
    const banner = document.getElementById("shortfall-banner");
    banner.style.display = "flex";
    banner.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a5 5 0 0 0-5 5v4l-2 4h14l-2-4V8a5 5 0 0 0-5-5z"/></svg>
      ${data.headline}`;

    document.getElementById("factor-list").innerHTML = data.factors.map((f) => `
      <div class="ticker-row">
        <div class="confidence" style="width:90px;">
          <div class="confidence__track" style="width:56px;"><div class="confidence__fill" style="width:${f.weight * 100}%"></div></div>
          <div class="confidence__val">${(f.weight * 100).toFixed(0)}%</div>
        </div>
        <span>${f.label}</span>
      </div>`).join("");
  });
});
