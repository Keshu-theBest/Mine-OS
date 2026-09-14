document.addEventListener("DOMContentLoaded", () => {
  const mapEl = document.getElementById("exp-map");
  const listEl = document.getElementById("zone-list");
  const predictBtn = document.getElementById("predict-btn");

  function statusBadge(status) {
    if (status === "confirmed") return `<span class="badge badge--good">confirmed</span>`;
    if (status === "low-confidence") return `<span class="badge badge--watch">low confidence</span>`;
    return `<span class="badge badge--info">predicted</span>`;
  }

  function renderList(zones) {
    document.getElementById("zone-count").textContent = zones.length;
    listEl.innerHTML = zones.map((z) => `
      <div class="zone-item" data-id="${z.id}">
        <div>
          <div class="zone-item__name">${z.name}</div>
          <div class="zone-item__id">${z.id} · ${z.location}</div>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          ${statusBadge(z.status)}
          <div class="confidence">
            <div class="confidence__track"><div class="confidence__fill" style="width:${z.confidence * 100}%"></div></div>
            <div class="confidence__val">${(z.confidence * 100).toFixed(0)}%</div>
          </div>
        </div>
      </div>`).join("");
  }

  function load() {
    Promise.all([
      fetch("only positive india.csv", { cache: "no-store" }).then((response) => response.text()),
      fetch("india-osm.geojson").then((response) => response.json()),
      fetch("Indian_States.txt").then((response) => response.json())
    ]).then(([csv, geojson, statesGeoJSON]) => {
      const data = toMineZones(csv);
      window.IndiaGeoJSON = geojson;
      window.IndianStatesGeoJSON = statesGeoJSON;
      window.MockData.reserves.zones = data;
      Components.Map.renderIndiaMap(mapEl, data, (zone) => {
        listEl.querySelector(`[data-id="${zone.id}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      renderList(data);
    });
  }

  function parseCsv(text) {
    const rows = [];
    let row = [];
    let value = "";
    let quoted = false;
    for (let index = 0; index < text.length; index += 1) {
      const character = text[index];
      const next = text[index + 1];
      if (character === '"' && quoted && next === '"') { value += '"'; index += 1; }
      else if (character === '"') quoted = !quoted;
      else if (character === "," && !quoted) { row.push(value.trim()); value = ""; }
      else if ((character === "\n" || character === "\r") && !quoted) {
        if (character === "\r" && next === "\n") index += 1;
        row.push(value.trim());
        if (row.some((cell) => cell)) rows.push(row);
        row = []; value = "";
      } else value += character;
    }
    if (value || row.length) { row.push(value.trim()); if (row.some((cell) => cell)) rows.push(row); }
    return rows;
  }

  function escapeHtml(value) {
    return String(value || "—").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character]));
  }

  function toMineZones(csv) {
    return parseCsv(csv).map((row, index) => {
      const [rawName, longitude, latitude, belt, reserve, grade, lithology, formation, , source, depth, thickness, consistency, hostRock] = row;
      const fid = rawName.match(/FID:\s*(\d+)/)?.[1] || String(index + 1);
      const location = "Madhya Pradesh, India";
      const name = rawName.replace(/\s*\(FID:.*\)/, "");
      const detailRows = [["Location", location], ["Belt", belt], ["Reserve", reserve], ["Grade", grade], ["Lithology", lithology], ["Formation", formation], ["Source", source], ["Depth", depth], ["Thickness", thickness], ["Consistency", consistency], ["Host rock", hostRock]];
      return { id: `MP-${fid.padStart(2, "0")}`, name: `${name} ${fid}`, location, commodity: "Manganese", longitude: Number(longitude), latitude: Number(latitude), reserve, grade, confidence: 0.9, status: "confirmed", r: 24, details: detailRows.map(([label, detail]) => `<span><b>${escapeHtml(label)}:</b> ${escapeHtml(detail)}</span>`).join("") };
    });
  }
  load();

  predictBtn.addEventListener("click", () => {
    predictBtn.disabled = true;
    predictBtn.textContent = "Running prediction…";
    Api.runReservePrediction().then(() => {
      predictBtn.disabled = false;
      predictBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v18M3 12h18"/></svg> Predict new reserve`;
      load();
    });
  });
});
