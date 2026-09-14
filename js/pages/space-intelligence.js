document.addEventListener("DOMContentLoaded", () => {
  Api.getSpaceLayers().then(({ data: layers }) => {
    const keys = Object.keys(layers);
    document.getElementById("layer-toggles").innerHTML = keys.map((k, i) => `
      <label><input type="radio" name="layer" value="${k}" ${i === 0 ? "checked" : ""}/> ${layers[k].label}</label>`).join("");

    function draw() {
      const active = document.querySelector('input[name="layer"]:checked').value;
      Components.Map.renderSpaceMap(document.getElementById("space-map"), active, layers[active]);
    }
    document.querySelectorAll('input[name="layer"]').forEach((r) => r.addEventListener("change", draw));
    draw();
  });

  Api.getImpactSummary().then(({ data }) => {
    document.getElementById("impact-text").textContent = data;
  });

  const timeline = window.MockData.space.timeline;
  const slider = document.getElementById("timeline");
  slider.addEventListener("input", () => {
    document.getElementById("timeline-label").textContent = timeline[slider.value];
  });
});
