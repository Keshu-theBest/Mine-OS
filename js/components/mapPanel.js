/* Components.Map — renders a schematic site map (SVG, viewBox 800x500) with
   zone markers, drill points, or truck positions. This is a deliberate
   placeholder: real geo-tiles (Leaflet/Mapbox) can replace the <svg> root
   with a tile container without touching how callers invoke this file,
   since the container + tooltip + layer-toggle chrome stays the same. */
window.Components = window.Components || {};

Components.Map = (() => {
  function statusColor(status) {
    if (status === "confirmed" || status === "good") return "var(--good)";
    if (status === "low-confidence" || status === "watch") return "var(--watch)";
    if (status === "critical") return "var(--critical)";
    return "var(--accent)";
  }

  function baseTerrainSvg() {
    return `
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E5E4DF" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="800" height="500" fill="#EAEAE6" />
      <rect width="800" height="500" fill="url(#grid)" />
      <path d="M0,120 C150,60 300,180 460,110 C600,60 700,140 800,90 L800,0 L0,0 Z" fill="#E2E1DB" opacity="0.7"/>
      <path d="M0,500 C180,420 320,470 480,400 C620,350 720,420 800,380 L800,500 Z" fill="#E2E1DB" opacity="0.7"/>
    `;
  }

  function renderZoneMap(el, zones, drillPoints, onZoneClick) {
    const tooltip = ensureTooltip(el);
    el.innerHTML = `<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
      ${baseTerrainSvg()}
      ${(drillPoints || []).map(p => `<circle cx="${p.x}" cy="${p.y}" r="2.5" fill="#B3B2AA"/>`).join("")}
      ${zones.map(z => `
        <g class="map-panel__zone" data-id="${z.id}">
          <circle cx="${z.cx}" cy="${z.cy}" r="${z.r}" fill="${statusColor(z.status)}" opacity="0.16" stroke="${statusColor(z.status)}" stroke-width="1.5" />
          <circle cx="${z.cx}" cy="${z.cy}" r="3" fill="${statusColor(z.status)}" />
          <text x="${z.cx}" y="${z.cy - z.r - 8}" fill="#6B6A63" font-size="11" font-family="IBM Plex Mono, monospace" text-anchor="middle">${z.id}</text>
        </g>`).join("")}
    </svg>`;
    el.appendChild(tooltip);

    el.querySelectorAll(".map-panel__zone").forEach((g) => {
      const zone = zones.find((z) => z.id === g.getAttribute("data-id"));
      g.addEventListener("mouseenter", (e) => showTooltip(tooltip, el, e, `${zone.name} — ${(zone.confidence * 100).toFixed(0)}% confidence`));
      g.addEventListener("mousemove", (e) => positionTooltip(tooltip, el, e));
      g.addEventListener("mouseleave", () => hideTooltip(tooltip));
      g.addEventListener("click", () => onZoneClick && onZoneClick(zone));
    });
  }

  function renderIndiaMap(el, zones, onZoneClick) {
    const tooltip = ensureTooltip(el);
    const geometry = geojsonToSvgPaths(window.IndiaGeoJSON);
    const stateGeometry = geojsonToSvgPaths(window.IndianStatesGeoJSON, geometry.project);
    const projectedZones = zones.map((zone) => ({ zone, point: geometry.project(zone.longitude, zone.latitude) }));
    const heatSpots = projectedZones.map(({ zone, point }) => {
      const density = projectedZones.reduce((total, candidate) => {
        const distance = Math.hypot(point.x - candidate.point.x, point.y - candidate.point.y);
        return total + (distance < 32 ? 1 : 0);
      }, 0);
      return { ...point, radius: 10, opacity: Math.min(0.5, 0.16 + density * 0.03) };
    });
    const markerLabel = (zone) => `${zone.name} - ${zone.location || "India"}`;

    el.innerHTML = `<svg class="india-map" viewBox="0 0 800 430" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Interactive map of India showing predicted reserve zones">
      <defs>
        <pattern id="india-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E5E4DF" stroke-width="1"/>
        </pattern>
        <filter id="marker-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#232320" flood-opacity="0.18"/>
        </filter>
        <radialGradient id="reserve-heat" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#991B1B" stop-opacity="0.78" />
          <stop offset="34%" stop-color="#DC2626" stop-opacity="0.56" />
          <stop offset="68%" stop-color="#FCA5A5" stop-opacity="0.28" />
          <stop offset="100%" stop-color="#FEE2E2" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="430" fill="#EAEAE6" />
      <rect width="800" height="430" fill="url(#india-grid)" />
      ${geometry.paths.map((path) => `<path d="${path}" fill="#D8D7D0" stroke="#AFAEA6" stroke-width="1.5" stroke-linejoin="round" fill-rule="evenodd" />`).join("")}
      <g class="india-map__heatmap" aria-label="Reserve density heat map">
        ${heatSpots.map((spot) => `<circle cx="${spot.x}" cy="${spot.y}" r="${spot.radius}" fill="url(#reserve-heat)" opacity="${spot.opacity}" />`).join("")}
      </g>
      <g class="india-map__state-boundaries" aria-label="Indian state boundaries">
        ${stateGeometry.paths.map((path) => `<path d="${path}" />`).join("")}
      </g>
      <text x="402" y="414" fill="#9B9A92" font-size="11" font-family="IBM Plex Mono, monospace" text-anchor="middle" letter-spacing="1">INDIA / RESERVE INTELLIGENCE</text>
      <g class="india-map__markers is-hidden">
        ${zones.map((z) => `
          <g class="map-panel__zone india-map__marker" data-id="${z.id}" tabindex="0" role="button" aria-label="${markerLabel(z)}">
            <circle class="india-map__dot" cx="${geometry.project(z.longitude, z.latitude).x}" cy="${geometry.project(z.longitude, z.latitude).y}" r="0.1" fill="#000000" stroke="none" filter="none" />
            <text class="india-map__marker-label" x="${geometry.project(z.longitude, z.latitude).x}" y="${geometry.project(z.longitude, z.latitude).y - 10}" fill="#6B6A63" font-size="10" font-family="IBM Plex Mono, monospace" text-anchor="middle">${z.id}</text>
          </g>`).join("")}
      </g>
    </svg>
    <button class="india-map__show-points" type="button" data-map-control="toggle-points" aria-pressed="false">Show</button>
    `;
    el.appendChild(tooltip);
    tooltip.classList.add("map-panel__tooltip--india");

    const svg = el.querySelector(".india-map");
    const markers = el.querySelector(".india-map__markers");
    const showPointsButton = el.querySelector('[data-map-control="toggle-points"]');
    const focus = { x: 400, y: 215 };
    const defaultView = { x: focus.x - 200, y: focus.y - 107.5, width: 400, height: 215 };
    let view = { ...defaultView };
    let viewFrame = null;
    const updateView = () => svg.setAttribute("viewBox", `${view.x} ${view.y} ${view.width} ${view.height}`);
    const scheduleViewUpdate = () => {
      if (viewFrame) return;
      viewFrame = requestAnimationFrame(() => {
        viewFrame = null;
        updateView();
      });
    };
    const zoomAtPoint = (scale, clientX, clientY) => {
      const rect = svg.getBoundingClientRect();
      const pointerX = view.x + ((clientX - rect.left) / rect.width) * view.width;
      const pointerY = view.y + ((clientY - rect.top) / rect.height) * view.height;
      const width = Math.max(20, Math.min(800, view.width * scale));
      const height = Math.max(10.75, Math.min(430, view.height * scale));
      view = {
        x: pointerX - ((clientX - rect.left) / rect.width) * width,
        y: pointerY - ((clientY - rect.top) / rect.height) * height,
        width,
        height
      };
      scheduleViewUpdate();
    };
    updateView();
    showPointsButton.addEventListener("click", () => {
      const visible = markers.classList.toggle("is-hidden") === false;
      showPointsButton.textContent = visible ? "Hide" : "Show";
      showPointsButton.setAttribute("aria-pressed", String(visible));
    });
    el.addEventListener("wheel", (event) => {
      event.preventDefault();
      const scale = Math.exp(Math.max(-0.12, Math.min(0.12, event.deltaY * 0.002)));
      zoomAtPoint(scale, event.clientX, event.clientY);
    }, { passive: false });

    let drag = null;
    let panFrame = null;
    let pendingPointer = null;
    const updatePan = () => {
      panFrame = null;
      if (!drag || !pendingPointer) return;
      const rect = svg.getBoundingClientRect();
      view.x = drag.viewX - ((pendingPointer.clientX - drag.clientX) / rect.width) * view.width;
      view.y = drag.viewY - ((pendingPointer.clientY - drag.clientY) / rect.height) * view.height;
      pendingPointer = null;
      updateView();
    };
    el.addEventListener("contextmenu", (event) => event.preventDefault());
    el.addEventListener("pointerdown", (event) => {
      if (event.button !== 2) return;
      drag = { clientX: event.clientX, clientY: event.clientY, viewX: view.x, viewY: view.y };
      el.classList.add("is-panning");
      el.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    el.addEventListener("pointermove", (event) => {
      if (!drag) return;
      pendingPointer = event;
      if (!panFrame) panFrame = requestAnimationFrame(updatePan);
    });
    el.addEventListener("pointerup", (event) => {
      if (!drag) return;
      const rect = svg.getBoundingClientRect();
      view.x = drag.viewX - ((event.clientX - drag.clientX) / rect.width) * view.width;
      view.y = drag.viewY - ((event.clientY - drag.clientY) / rect.height) * view.height;
      pendingPointer = null;
      if (panFrame) cancelAnimationFrame(panFrame);
      panFrame = null;
      updateView();
      drag = null;
      el.classList.remove("is-panning");
      el.releasePointerCapture(event.pointerId);
    });

    el.querySelectorAll(".india-map__marker").forEach((marker) => {
      const zone = zones.find((z) => z.id === marker.getAttribute("data-id"));
      const details = `<strong>${zone.name}</strong>${zone.details || `<span>${zone.location || "India"}</span><span>${zone.commodity || "Reserve zone"} · ${(zone.confidence * 100).toFixed(0)}% confidence</span>`}`;
      marker.addEventListener("mouseenter", (event) => showTooltip(tooltip, el, event, details, true));
      marker.addEventListener("mousemove", (event) => positionTooltip(tooltip, el, event));
      marker.addEventListener("mouseleave", () => hideTooltip(tooltip));
      marker.addEventListener("focus", (event) => showTooltip(tooltip, el, event, details, true));
      marker.addEventListener("blur", () => hideTooltip(tooltip));
      marker.addEventListener("click", () => onZoneClick && onZoneClick(zone));
      marker.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onZoneClick && onZoneClick(zone);
        }
      });
    });
  }

  function geojsonToSvgPaths(geojson, existingProject) {
    const rings = [];
    (geojson?.features || []).forEach((feature) => {
      const polygons = feature.geometry?.type === "Polygon"
        ? [feature.geometry.coordinates]
        : feature.geometry?.type === "MultiPolygon" ? feature.geometry.coordinates : [];
      polygons.forEach((polygon) => polygon.forEach((ring) => rings.push(ring)));
    });
    const coordinates = rings.flat();
    if (existingProject) {
      return {
        paths: rings.map((ring) => ring.map(([longitude, latitude], index) => {
          const point = existingProject(longitude, latitude);
          return `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
        }).join(" ") + " Z"),
        project: existingProject
      };
    }
    const bounds = coordinates.reduce((current, [longitude, latitude]) => ({
      minLongitude: Math.min(current.minLongitude, longitude),
      maxLongitude: Math.max(current.maxLongitude, longitude),
      minLatitude: Math.min(current.minLatitude, latitude),
      maxLatitude: Math.max(current.maxLatitude, latitude)
    }), { minLongitude: Infinity, maxLongitude: -Infinity, minLatitude: Infinity, maxLatitude: -Infinity });
    const { minLongitude, maxLongitude, minLatitude, maxLatitude } = bounds;
    const scale = Math.min(728 / (maxLongitude - minLongitude), 358 / (maxLatitude - minLatitude));
    const mapWidth = (maxLongitude - minLongitude) * scale;
    const mapHeight = (maxLatitude - minLatitude) * scale;
    const offsetX = (800 - mapWidth) / 2;
    const offsetY = (430 - mapHeight) / 2;
    const project = (longitude, latitude) => ({
      x: offsetX + (longitude - minLongitude) * scale,
      y: offsetY + (maxLatitude - latitude) * scale
    });
    const paths = rings.map((ring) => ring.map(([longitude, latitude], index) => {
      const point = project(longitude, latitude);
      return `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
    }).join(" ") + " Z");
    return { paths, project };
  }

  function renderFleetMap(el, trucks) {
    const statusColorMap = { hauling: "var(--accent)", idle: "var(--text-faint)", maintenance: "var(--critical)", returning: "var(--info)" };
    const tooltip = ensureTooltip(el);
    el.innerHTML = `<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
      ${baseTerrainSvg()}
      <path d="M100,400 L300,250 L500,280 L700,150" stroke="#D6D5CD" stroke-width="10" fill="none" stroke-linecap="round"/>
      ${trucks.map(t => `
        <g class="map-panel__zone" data-id="${t.id}">
          <rect x="${t.x - 8}" y="${t.y - 6}" width="16" height="12" rx="3" fill="${statusColorMap[t.status]}" />
          <text x="${t.x}" y="${t.y - 12}" fill="#6B6A63" font-size="10" font-family="IBM Plex Mono, monospace" text-anchor="middle">${t.id}</text>
        </g>`).join("")}
    </svg>`;
    el.appendChild(tooltip);
    el.querySelectorAll(".map-panel__zone").forEach((g) => {
      const truck = trucks.find((t) => t.id === g.getAttribute("data-id"));
      g.addEventListener("mouseenter", (e) => showTooltip(tooltip, el, e, `${truck.id} — ${truck.status}`));
      g.addEventListener("mousemove", (e) => positionTooltip(tooltip, el, e));
      g.addEventListener("mouseleave", () => hideTooltip(tooltip));
    });
  }

  function renderSpaceMap(el, activeLayer, layerDef) {
    el.innerHTML = `<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
      ${baseTerrainSvg()}
      <g opacity="0.55">
        ${Array.from({ length: 26 }).map(() => {
          const cx = 40 + Math.random() * 720, cy = 40 + Math.random() * 420, r = 20 + Math.random() * 46;
          return `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(0)}" fill="${layerDef.color}" opacity="${(0.06 + Math.random() * 0.14).toFixed(2)}" />`;
        }).join("")}
      </g>
    </svg>`;
  }

  function ensureTooltip(el) {
    let t = el.querySelector(".map-panel__tooltip");
    if (!t) {
      t = document.createElement("div");
      t.className = "map-panel__tooltip";
    }
    return t;
  }
  function showTooltip(t, el, e, text, html = false) { html ? t.innerHTML = text : t.textContent = text; t.style.display = "block"; positionTooltip(t, el, e); }
  function positionTooltip(t, el, e) {
    const rect = el.getBoundingClientRect();
    t.style.left = (e.clientX - rect.left + 14) + "px";
    t.style.top = (e.clientY - rect.top + 10) + "px";
  }
  function hideTooltip(t) { t.style.display = "none"; }

  return { renderZoneMap, renderIndiaMap, renderFleetMap, renderSpaceMap };
})();
