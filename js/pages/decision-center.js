document.addEventListener("DOMContentLoaded", () => {
  let all = [];
  let activeTab = "pending";
  let activeModule = "all";

  function moduleFilterUI() {
    const modules = ["all", ...new Set(all.map((r) => r.module))];
    document.getElementById("module-filter").innerHTML = modules.map((m) => `
      <button class="btn btn--sm ${m === activeModule ? "btn--primary" : "btn--ghost"}" data-module="${m}">${m === "all" ? "All modules" : m}</button>`).join("");
    document.querySelectorAll("[data-module]").forEach((btn) => {
      btn.addEventListener("click", () => { activeModule = btn.getAttribute("data-module"); render(); });
    });
  }

  function render() {
    let items = all.filter((r) => activeTab === "pending" ? r.status === "pending" : r.status !== "pending");
    if (activeModule !== "all") items = items.filter((r) => r.module === activeModule);
    Components.Recommendation.renderList(document.getElementById("rec-feed"), items, { onAction: load });
  }

  function load() {
    Api.getRecommendations().then(({ data }) => {
      all = data;
      moduleFilterUI();
      render();
    });
  }
  load();

  document.querySelectorAll("#tabs .tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll("#tabs .tab").forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      activeTab = tab.getAttribute("data-tab");
      render();
    });
  });
});
