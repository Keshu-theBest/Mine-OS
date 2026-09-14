/* ==========================================================================
   MineOS AI — nav.js
   Single source of truth for the topbar + sidebar shell. Every page has an
   empty <div id="app-shell-sidebar"></div> and <div id="app-shell-topbar">
   placeholder; this script fills them in and wires interactions. Keeping
   this in JS (rather than 15 copies of the same markup, or a fetch()-based
   include that breaks under file://) means one edit here updates every page.
   ========================================================================== */

const NAV_ITEMS = [
  { group: "Overview", items: [
    { href: "dashboard.html", label: "Executive Dashboard", status: "watch",
      icon: `<path d="M3 13h4v7H3zM10 8h4v12h-4zM17 4h4v16h-4z"/>` }
  ]},
  { group: "Intelligence modules", items: [
    { href: "exploration.html", label: "Exploration", status: "good",
      icon: `<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5"/>` },
    { href: "production.html", label: "Production", status: "watch",
      icon: `<path d="M3 17 L9 10 L13 14 L21 5" fill="none"/>` },
    { href: "maintenance.html", label: "Predictive Maintenance", status: "critical",
      icon: `<path d="M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 1 5.4-5.4l-2.6 2.6-2-2z"/>` },
    { href: "fleet.html", label: "Fleet Intelligence", status: "good",
      icon: `<rect x="3" y="10" width="12" height="7" rx="1"/><path d="M15 12h3l3 3v2h-6z"/><circle cx="7" cy="19" r="1.6"/><circle cx="17" cy="19" r="1.6"/>` },
    { href: "space-intelligence.html", label: "Space Intelligence", status: "good",
      icon: `<circle cx="12" cy="12" r="4"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none"/>` },
    { href: "decision-center.html", label: "Decision Intelligence", status: "watch",
      icon: `<path d="M12 3v18M3 12h18" fill="none"/><circle cx="12" cy="12" r="9" fill="none"/>` }
  ]},
  { group: "Records", items: [
    { href: "reports.html", label: "Reports", status: null,
      icon: `<path d="M6 2h9l3 3v17H6z"/><path d="M9 12h6M9 16h6M9 8h3"/>` },
    { href: "alerts.html", label: "Alerts", status: null,
      icon: `<path d="M12 3a5 5 0 0 0-5 5v4l-2 4h14l-2-4V8a5 5 0 0 0-5-5z"/><path d="M10 20a2 2 0 0 0 4 0"/>` },
    { href: "settings.html", label: "Settings", status: null,
      icon: `<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 5 12a7 7 0 0 0 .1 1.2l-2 1.6 2 3.4 2.4-1c.6.5 1.3.9 2 1.2L10 21h4l.5-2.6c.7-.3 1.4-.7 2-1.2l2.4 1 2-3.4-2-1.6c.07-.4.1-.8.1-1.2z"/>` },
    { href: "about.html", label: "About this project", status: null,
      icon: `<circle cx="12" cy="12" r="9" fill="none"/><path d="M12 8h.01M11 12h1v5h1"/>` }
  ]}
];

function currentPage() {
  const p = window.location.pathname.split("/").pop();
  return p || "index.html";
}

function icon(svgInner) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${svgInner}</svg>`;
}

function buildSidebar() {
  const current = currentPage();
  const groups = NAV_ITEMS.map((g) => `
    <div class="nav-group__label">${g.group}</div>
    ${g.items.map((item) => `
      <a class="nav-link${item.href === current ? " is-active" : ""}" href="${item.href}">
        ${icon(item.icon)}
        <span class="nav-link__label">${item.label}</span>
        ${item.status ? `<span class="nav-link__tick" data-status="${item.status}"></span>` : ""}
      </a>`).join("")}
  `).join("");

  return `
    <div class="sidebar__brand">
      <svg class="sidebar__brand-mark" viewBox="0 0 24 24" fill="none">
        <path d="M3 20 L8 6 L12 14 L16 4 L21 20 Z" fill="none" stroke="#A8672B" stroke-width="1.6" stroke-linejoin="round"/>
      </svg>
      <span class="sidebar__brand-name">MineOS AI</span>
    </div>
    <nav>${groups}</nav>
    <div class="sidebar__footer">
      <button class="sidebar__collapse-btn" id="collapse-toggle">« Collapse</button>
    </div>
  `;
}

function buildTopbar(siteName) {
  return `
    <button class="topbar__icon-btn topbar__menu-btn" id="menu-toggle" aria-label="Toggle navigation">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
    </button>
    <div class="topbar__site-select">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2 21 7v10l-9 5-9-5V7z"/></svg>
      <select aria-label="Mine site">
        <option>${siteName || "Balaghat Mine Complex"}</option>
        <option>Gumgaon Mine</option>
        <option>Ukwa Mine</option>
      </select>
    </div>
    <div class="topbar__demo-flag">Demo data</div>
    <div class="topbar__spacer"></div>
    <a class="topbar__icon-btn" href="alerts.html" aria-label="Alerts">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3a5 5 0 0 0-5 5v4l-2 4h14l-2-4V8a5 5 0 0 0-5-5z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>
      <span class="topbar__badge"></span>
    </a>
    <div class="topbar__user">
      <div class="topbar__avatar">MK</div>
      <span>Mine Manager</span>
    </div>
  `;
}

function mountShell(opts = {}) {
  const sidebarEl = document.getElementById("app-shell-sidebar");
  const topbarEl = document.getElementById("app-shell-topbar");
  if (sidebarEl) sidebarEl.innerHTML = buildSidebar();
  if (topbarEl) topbarEl.innerHTML = buildTopbar(opts.siteName);

  const collapseBtn = document.getElementById("collapse-toggle");
  const shell = document.querySelector(".shell");
  if (collapseBtn && shell) {
    collapseBtn.addEventListener("click", () => {
      shell.classList.toggle("is-collapsed");
      collapseBtn.textContent = shell.classList.contains("is-collapsed") ? "»" : "« Collapse";
    });
  }

  // Mobile nav: the sidebar goes off-canvas below 860px (see layout.css),
  // so it needs an explicit way back in — a menu button plus a scrim to
  // dismiss it, same pattern as any off-canvas nav.
  const menuBtn = document.getElementById("menu-toggle");
  let scrim = document.querySelector(".sidebar-scrim");
  if (!scrim) {
    scrim = document.createElement("div");
    scrim.className = "sidebar-scrim";
    document.body.appendChild(scrim);
  }
  function closeMobileNav() {
    sidebarEl.classList.remove("is-open");
    scrim.classList.remove("is-visible");
  }
  if (menuBtn && sidebarEl) {
    menuBtn.addEventListener("click", () => {
      sidebarEl.classList.toggle("is-open");
      scrim.classList.toggle("is-visible");
    });
    scrim.addEventListener("click", closeMobileNav);
    sidebarEl.querySelectorAll(".nav-link").forEach((link) => link.addEventListener("click", closeMobileNav));
  }
}

document.addEventListener("DOMContentLoaded", () => mountShell());
