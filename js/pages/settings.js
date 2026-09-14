document.addEventListener("DOMContentLoaded", () => {
  Api.getDataSources().then(({ data }) => {
    document.getElementById("conn-list").innerHTML = data.map((d) => `
      <div class="conn-row">
        <div>
          <div class="conn-row__name">${d.name}</div>
          <div class="conn-row__meta">${d.meta}</div>
        </div>
        <span class="badge badge--${d.status === "connected" ? "good" : "watch"}">${d.status}</span>
      </div>`).join("");
  });

  const panes = { "data-sources": "pane-data-sources", "sites": "pane-sites", "users": "pane-users" };
  document.querySelectorAll("#settings-tabs .tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll("#settings-tabs .tab").forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      Object.values(panes).forEach((id) => document.getElementById(id).style.display = "none");
      document.getElementById(panes[tab.getAttribute("data-tab")]).style.display = "block";
    });
  });
});
