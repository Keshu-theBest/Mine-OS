/* Components.Modal — minimal open/close helper for the "Run Simulation",
   "Add Data Source" etc. dialogs. Expects markup already in the DOM with
   class="modal-overlay" and a matching id. */
window.Components = window.Components || {};

Components.Modal = (() => {
  function open(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add("is-open");
  }
  function close(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove("is-open");
  }
  function bindDismiss() {
    document.querySelectorAll(".modal-overlay").forEach((overlay) => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.classList.remove("is-open");
      });
      overlay.querySelectorAll("[data-modal-close]").forEach((btn) => {
        btn.addEventListener("click", () => overlay.classList.remove("is-open"));
      });
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") document.querySelectorAll(".modal-overlay.is-open").forEach((o) => o.classList.remove("is-open"));
    });
  }
  return { open, close, bindDismiss };
})();
