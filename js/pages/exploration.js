document.addEventListener("DOMContentLoaded", () => {
  const mapEl = document.getElementById("exp-map");
  const listEl = document.getElementById("zone-list");
  const listToggle = document.getElementById("zone-list-toggle");

  function renderList(zones) {
    document.getElementById("zone-count").textContent = zones.length;
    listEl.innerHTML = zones.map((z) => `
      <details class="zone-item" data-id="${z.id}">
        <summary>
          <div>
            <div class="zone-item__name">${escapeHtml(z.name)}</div>
            <div class="zone-item__id">${z.id} · ${escapeHtml(z.location)}</div>
          </div>
        </summary>
        <div class="zone-item__details">${z.details}</div>
      </details>`).join("");
  }

  function load() {
    Promise.all([
      fetch("manganese_mineral_data.csv", { cache: "no-store" }).then((response) => response.text()),
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

  listToggle.addEventListener("click", () => {
    const expanded = !listEl.hidden;
    listEl.hidden = expanded;
    listToggle.textContent = expanded ? "Show" : "Hide";
    listToggle.setAttribute("aria-expanded", String(!expanded));
  });

  listEl.addEventListener("click", (event) => {
    const summary = event.target.closest("summary");
    if (!summary) return;
    const item = summary.closest(".zone-item");
    if (item) item.scrollIntoView({ block: "nearest" });
  });

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
    const rows = parseCsv(csv);
    const headers = rows.shift().map((header) => header.toUpperCase());
    const value = (row, header) => row[headers.indexOf(header)] || "";
    const detailLabels = {
      GID: "GID",
      OBJECTID: "Object ID",
      LOCALITY: "Locality",
      REGION: "Region",
      STATE: "State",
      TOPOSHEET: "Toposheet",
      COMMODITY: "Commodity",
      RESOURCE: "Reserve / resource",
      GRADE: "Grade",
      REMARKS: "Remarks",
      AGE: "Age",
      HOST_ROCK: "Host rock",
      LONGITUDE: "Longitude",
      LATITUDE: "Latitude",
      GEOLOGY: "Geology",
      MORPHOMETR: "Morphometry",
      OCCURRENCE: "Occurrence",
      STATE_RESO: "State resource share",
      STNAME: "State name",
      STCODE11: "State code"
    };

    return rows.map((row, index) => {
      const id = value(row, "GID") || String(index + 1);
      const locality = value(row, "LOCALITY") || "Unnamed occurrence";
      const state = value(row, "STATE") || value(row, "STNAME") || "India";
      const reserve = value(row, "RESOURCE");
      const grade = value(row, "GRADE");
      const detailRows = [["Location", `${locality}, ${state}`]];
      headers.forEach((header, headerIndex) => {
        const detail = row[headerIndex];
        if (detail && detailLabels[header] && !(header === "LOCALITY" || header === "STATE")) {
          detailRows.push([detailLabels[header], detail]);
        }
      });
      return {
        id: `MN-${id.padStart(4, "0")}`,
        name: locality,
        location: state,
        commodity: value(row, "COMMODITY") || "Manganese",
        longitude: Number(value(row, "LONGITUDE")),
        latitude: Number(value(row, "LATITUDE")),
        reserve,
        grade,
        confidence: 0.9,
        status: "confirmed",
        r: 24,
        details: detailRows.map(([label, detail]) => `<span><b>${escapeHtml(label)}:</b> ${escapeHtml(detail)}</span>`).join("")
      };
    });
  }
  load();

});
