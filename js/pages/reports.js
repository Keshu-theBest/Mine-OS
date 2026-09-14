document.addEventListener("DOMContentLoaded", () => {
  Api.getReportSummary().then(({ data }) => {
    Components.Card.renderKpis(document.getElementById("report-kpis"), [
      { label: "Production this period", value: data.productionTotal.toLocaleString(), unit: "t", trend: "flat", delta: "vs. plan" },
      { label: "Recommendations accepted", value: data.recommendationsAccepted, unit: "", trend: "up", delta: "of " + (data.recommendationsAccepted + data.recommendationsRejected) },
      { label: "Recommendations rejected", value: data.recommendationsRejected, unit: "", trend: "down", delta: "manager override" },
      { label: "Avg. recommendation confidence", value: Math.round(data.avgConfidence * 100), unit: "%", trend: "flat", delta: "across all modules" }
    ]);
  });

  ["export-btn", "export-pdf-btn"].forEach((id) => {
    document.getElementById(id).addEventListener("click", (e) => {
      const original = e.target.textContent;
      e.target.textContent = "Stubbed for prototype";
      setTimeout(() => e.target.textContent = original, 1400);
    });
  });
});
