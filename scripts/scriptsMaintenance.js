(() => {
  if (window.__maintenanceSyncBound) return;
  window.__maintenanceSyncBound = true;

  const sync = (fromId, toId) => {
    const from = document.getElementById(fromId);
    const to   = document.getElementById(toId);
    if (from && to) to.value = from.value;
  };

  // Copiar mientras escribes
  document.addEventListener("input", (e) => {
    const el = e.target;
    if (!el) return;

    if (el.id === "om42Field") sync("om42Field", "ver2Field");
    if (el.id === "ver2Field") sync("ver2Field", "om42Field");
  }, true);

  // (Opcional) también al enviar cualquiera de los forms
  document.addEventListener("submit", (e) => {
    const form = e.target;
    if (!form) return;

    if (form.id === "om42Form") sync("om42Field", "ver2Field");
    if (form.id === "ver2Form") sync("ver2Field", "om42Field");
    // aquí NO hacemos preventDefault: eso ya lo hace scriptsFoops.js
  }, true);
})();
