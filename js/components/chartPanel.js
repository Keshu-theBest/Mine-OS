/* Components.Chart — minimal canvas line/bar renderer, zero dependencies so
   the prototype runs from file:// with no CDN. Swap for Chart.js later by
   replacing the body of `render()`; callers just pass { labels, series }. */
window.Components = window.Components || {};

Components.Chart = (() => {
  function render(canvas, { labels, series, type = "line", yFormat = (v) => v }) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width || canvas.parentElement.clientWidth;
    const h = canvas.height ? canvas.height : 220;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.height = h + "px";
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const pad = { top: 14, right: 14, bottom: 26, left: 46 };
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;

    const allVals = series.flatMap((s) => s.data.filter((v) => v !== null && v !== undefined));
    const max = Math.max(...allVals) * 1.08;
    const min = Math.min(0, Math.min(...allVals) * 0.95);

    const xFor = (i) => pad.left + (i / (labels.length - 1)) * plotW;
    const yFor = (v) => pad.top + plotH - ((v - min) / (max - min)) * plotH;

    // gridlines
    ctx.strokeStyle = "#E7E6E1";
    ctx.lineWidth = 1;
    ctx.font = "10.5px 'IBM Plex Mono', monospace";
    ctx.fillStyle = "#9B9A92";
    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const v = min + ((max - min) / steps) * i;
      const y = yFor(v);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();
      ctx.fillText(yFormat(Math.round(v)), 4, y + 3);
    }

    // x labels (sparse if many)
    const labelStep = Math.ceil(labels.length / 8);
    labels.forEach((lab, i) => {
      if (i % labelStep !== 0) return;
      ctx.fillText(lab, xFor(i) - 10, h - 8);
    });

    if (type === "bar") {
      const barW = (plotW / labels.length) * 0.5;
      series.forEach((s) => {
        ctx.fillStyle = s.color;
        s.data.forEach((v, i) => {
          if (v === null || v === undefined) return;
          const x = xFor(i) - barW / 2;
          const y = yFor(v);
          ctx.fillRect(x, y, barW, plotH + pad.top - y);
        });
      });
      return;
    }

    // line series
    series.forEach((s) => {
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      let started = false;
      s.data.forEach((v, i) => {
        if (v === null || v === undefined) { started = false; return; }
        const x = xFor(i), y = yFor(v);
        if (!started) { ctx.moveTo(x, y); started = true; }
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      if (s.dashedForecastFrom !== undefined) {
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = s.color;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        let st = false;
        s.data.forEach((v, i) => {
          if (i < s.dashedForecastFrom || v === null || v === undefined) return;
          const x = xFor(i), y = yFor(v);
          if (!st) { ctx.moveTo(x, y); st = true; } else ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      }

      // dots
      ctx.fillStyle = s.color;
      s.data.forEach((v, i) => {
        if (v === null || v === undefined) return;
        ctx.beginPath();
        ctx.arc(xFor(i), yFor(v), 2.4, 0, Math.PI * 2);
        ctx.fill();
      });
    });
  }

  function renderLegend(container, series) {
    container.innerHTML = series.map((s) => `
      <div class="chart-legend__item">
        <span class="chart-legend__swatch" style="background:${s.color}"></span>${s.label}
      </div>`).join("");
  }

  return { render, renderLegend };
})();
