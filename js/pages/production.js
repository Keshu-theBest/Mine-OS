document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("prod-chart");
  const forecastForm = document.getElementById("production-forecast");

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

  if (forecastForm) {
    const weatherFactors = { clear: 1, cloudy: 0.97, rain: 0.88, storm: 0.72 };
    const shiftFactors = { morning: 1.02, afternoon: 1, night: 0.91 };
    const getNumber = (id) => Math.max(0, Number.parseFloat(document.getElementById(id).value) || 0);
    const formatTons = (value) => Math.round(value).toLocaleString("en-IN");

    function calculateForecast() {
      const weightedAverage = getNumber("forecast-average-7") * 0.5
        + getNumber("forecast-average-14") * 0.3
        + getNumber("forecast-average-30") * 0.2;
      const gradeFactor = Math.max(0.75, Math.min(1.12, getNumber("forecast-grade") / 32));
      const uptimeFactor = Math.max(0.65, getNumber("forecast-uptime") / 100);
      const weatherFactor = weatherFactors[document.getElementById("forecast-weather").value] || 1;
      const shiftFactor = shiftFactors[document.getElementById("forecast-shift").value] || 1;
      const dailyProduction = weightedAverage * gradeFactor * uptimeFactor * weatherFactor * shiftFactor;
      const forecasts = {
        daily: { target: getNumber("forecast-target-daily"), predicted: dailyProduction },
        weekly: { target: getNumber("forecast-target-weekly"), predicted: dailyProduction * 7 },
        monthly: { target: getNumber("forecast-target-monthly"), predicted: dailyProduction * 30 }
      };

      Object.entries(forecasts).forEach(([horizon, result], index) => {
        const shortfall = result.target - result.predicted;
        const card = document.querySelectorAll(".forecast-result")[index];
        const badge = document.querySelector(`[data-status="${horizon}"]`);
        const setValue = (name, value) => {
          document.querySelector(`[data-value="${name}"]`).textContent = formatTons(value);
        };

        setValue(`${horizon}-target`, result.target);
        setValue(`${horizon}-predicted`, result.predicted);
        setValue(`${horizon}-shortfall`, Math.max(0, shortfall));
        card.classList.remove("is-shortfall", "is-surplus");
        badge.classList.remove("badge--neutral", "badge--shortfall", "badge--surplus", "badge--watching");

        if (shortfall > 0) {
          card.classList.add("is-shortfall");
          badge.classList.add(shortfall > result.target * 0.1 ? "badge--shortfall" : "badge--watching");
          badge.textContent = shortfall > result.target * 0.1 ? "Shortfall" : "Watch";
        } else {
          card.classList.add("is-surplus");
          badge.classList.add("badge--surplus");
          badge.textContent = "On track";
        }
      });
    }

    document.getElementById("forecast-uptime").addEventListener("input", (event) => {
      document.getElementById("forecast-uptime-value").textContent = `${event.target.value}%`;
    });
    document.getElementById("generate-production-forecast").addEventListener("click", calculateForecast);
    calculateForecast();
  }
});
