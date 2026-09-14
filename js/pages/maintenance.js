document.addEventListener("DOMContentLoaded", () => {
  let equipment = [];

  function statusLabel(status) {
    return status === "good" ? "healthy" : status;
  }

  function renderRows() {
    document.getElementById("equipment-rows").innerHTML = equipment.map((e) => `
      <tr class="is-clickable" data-id="${e.id}">
        <td>${e.name}</td>
        <td class="num">${e.id}</td>
        <td><span class="badge badge--${e.status}">${statusLabel(e.status)}</span></td>
        <td class="num">${e.rulDays} d</td>
        <td class="num">${(e.failureProb * 100).toFixed(0)}%</td>
      </tr>`).join("");

    document.querySelectorAll("#equipment-rows tr").forEach((row) => {
      row.addEventListener("click", () => showDetail(row.getAttribute("data-id")));
    });
  }

  function showDetail(id) {
    document.querySelectorAll("#equipment-rows tr").forEach((r) => r.classList.toggle("is-selected", r.getAttribute("data-id") === id));
    Api.getEquipmentDetail(id).then(({ data }) => {
      const panel = document.getElementById("detail-panel");
      panel.style.display = "block";
      document.getElementById("detail-title").innerHTML = `${data.name} <span class="count">${data.id}</span>`;
      document.getElementById("detail-rul").textContent = data.rulDays + " days";
      document.getElementById("detail-fail-track").innerHTML = `<div class="confidence__fill" style="width:${data.failureProb * 100}%"></div>`;
      document.getElementById("detail-fail-val").textContent = (data.failureProb * 100).toFixed(0) + "%";
      Components.Chart.render(document.getElementById("detail-chart"), {
        labels: data.sensor.map((_, i) => "T-" + (data.sensor.length - i)),
        series: [{ label: "Sensor reading", color: "#A8672B", data: data.sensor }]
      });
    });
  }

  Api.getEquipmentList().then(({ data }) => {
    equipment = data;
    renderRows();
    showDetail(equipment[0].id);
  });
});
