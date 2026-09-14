document.addEventListener("DOMContentLoaded", () => {
  let all = [];
  let active = "all";

  function render() {
    const items = active === "all" ? all : all.filter((a) => a.severity === active);
    const list = document.getElementById("alert-list");
    if (!items.length) {
      list.innerHTML = `<div class="empty-state"><h3>No alerts in this view</h3><p>Try a different severity filter.</p></div>`;
      return;
    }
    list.innerHTML = items.map((a) => `
      <div class="ticker-row">
        <span class="ticker-row__time">${a.time}</span>
        <span class="badge badge--${a.severity}">${a.severity}</span>
        <span class="badge badge--neutral">${a.module}</span>
        <span>${a.text}</span>
      </div>`).join("");
  }

  Api.getAlerts().then(({ data }) => {
    all = data;
    const severities = ["all", "critical", "watch", "info"];
    document.getElementById("severity-filter").innerHTML = severities.map((s) => `
      <button class="btn btn--sm ${s === active ? "btn--primary" : "btn--ghost"}" data-sev="${s}">${s === "all" ? "All" : s}</button>`).join("");
    document.querySelectorAll("[data-sev]").forEach((btn) => {
      btn.addEventListener("click", () => { active = btn.getAttribute("data-sev"); document.querySelectorAll("[data-sev]").forEach(b=>b.classList.remove("btn--primary")); document.querySelectorAll("[data-sev]").forEach(b=>b.classList.add("btn--ghost")); btn.classList.remove("btn--ghost"); btn.classList.add("btn--primary"); render(); });
    });
    render();
  });
});
