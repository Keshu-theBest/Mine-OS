/* Components.Recommendation — renders the recommendation feed as a divided
   list (see .rec-list/.rec-item in components.css), with accept/reject/
   snooze actions wired to Api.setRecommendationStatus. */
window.Components = window.Components || {};

Components.Recommendation = (() => {
  function statusNote(status) {
    if (status === "accepted") return "Accepted — applied to plan";
    if (status === "rejected") return "Rejected by mine manager";
    if (status === "snoozed") return "Snoozed — revisit next shift";
    return "";
  }

  function item(rec, { onAction } = {}) {
    const el = document.createElement("div");
    el.className = "rec-item" + (rec.status === "accepted" ? " is-accepted" : rec.status === "rejected" ? " is-rejected" : "");
    el.setAttribute("data-id", rec.id);

    const actions = rec.status === "pending" ? `
      <div class="rec-item__actions">
        <button class="btn btn--primary btn--sm" data-action="accept">Accept</button>
        <button class="btn btn--danger-outline btn--sm" data-action="reject">Reject</button>
        <button class="btn btn--ghost btn--sm" data-action="snooze">Snooze</button>
      </div>` : `<div class="rec-item__status-note">${statusNote(rec.status)}</div>`;

    el.innerHTML = `
      <div class="rec-item__top">
        <div>
          <div class="rec-item__module">${rec.module}</div>
          <div class="rec-item__title">${rec.title}</div>
          <div class="rec-item__why"><strong>Why:</strong> ${rec.why}</div>
        </div>
        <div class="confidence">
          <div class="confidence__track"><div class="confidence__fill" style="width:${rec.confidence * 100}%"></div></div>
          <div class="confidence__val">${(rec.confidence * 100).toFixed(0)}%</div>
        </div>
      </div>
      ${actions}
    `;

    el.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.getAttribute("data-action");
        const statusMap = { accept: "accepted", reject: "rejected", snooze: "snoozed" };
        Api.setRecommendationStatus(rec.id, statusMap[action]).then(({ data }) => {
          onAction && onAction(data);
        });
      });
    });

    return el;
  }

  function renderList(container, recs, opts) {
    container.innerHTML = "";
    if (!recs.length) {
      container.innerHTML = `<div class="empty-state"><h3>No recommendations right now</h3><p>The decision engine will surface new items here as models produce output.</p></div>`;
      return;
    }
    recs.forEach((r) => container.appendChild(item(r, opts)));
  }

  return { card: item, renderList };
})();
