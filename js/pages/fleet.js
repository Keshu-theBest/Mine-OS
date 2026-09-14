document.addEventListener("DOMContentLoaded", () => {
  function renderQueue(rows) {
    document.getElementById("dispatch-rows").innerHTML = rows.map((r) => `
      <tr><td>${r.truck}</td><td>${r.route}</td><td class="num">${r.eta}</td></tr>`).join("");
  }

  function load() {
    Api.getFleetTrucks().then(({ data }) => Components.Map.renderFleetMap(document.getElementById("fleet-map"), data));
    Api.getDispatchQueue().then(({ data }) => renderQueue(data));
  }
  load();

  document.getElementById("optimize-btn").addEventListener("click", (e) => {
    e.target.disabled = true;
    e.target.textContent = "Optimizing…";
    Api.optimizeDispatch().then(({ data }) => {
      renderQueue(data);
      e.target.disabled = false;
      e.target.textContent = "Optimize dispatch";
    });
  });
});
