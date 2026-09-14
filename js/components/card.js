/* Components.Card — renders metric tiles into a .metrics-row container.
   Usage: Components.Card.renderKpis(containerEl, [{label,value,unit,trend,delta}]) */
window.Components = window.Components || {};

Components.Card = (() => {
  const trendGlyph = { up: "▲", down: "▼", flat: "" };

  function metricTile(kpi) {
    const el = document.createElement("div");
    el.className = "metric";
    el.innerHTML = `
      <div class="metric__label">${kpi.label}</div>
      <div class="metric__value">${kpi.value}<span class="unit">${kpi.unit || ""}</span></div>
      <div class="metric__delta" data-trend="${kpi.trend || "flat"}">
        <span>${trendGlyph[kpi.trend] || ""}</span><span>${kpi.delta || ""}</span>
      </div>`;
    return el;
  }

  function renderKpis(container, kpis) {
    container.innerHTML = "";
    kpis.forEach((k) => container.appendChild(metricTile(k)));
  }

  function renderSkeletonKpis(container, count) {
    container.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.className = "metric";
      el.innerHTML = `
        <div class="skeleton" style="width:60%;height:10px;margin-bottom:12px;"></div>
        <div class="skeleton" style="width:40%;height:24px;"></div>`;
      container.appendChild(el);
    }
  }

  return { renderKpis, renderSkeletonKpis };
})();
