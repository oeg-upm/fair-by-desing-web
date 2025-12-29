(() => {
  // Evita engancharlo 200 veces si repintas la vista
  if (window.__vocabSyncBound) return;
  window.__vocabSyncBound = true;

  const sync = (fromId, toId) => {
    const from = document.getElementById(fromId);
    const to   = document.getElementById(toId);
    if (from && to) to.value = from.value;
  };

  // Copiar al hacer submit (capturing=true para pillarlo siempre)
  document.addEventListener("submit", (e) => {
    const form = e.target;
    if (!form) return;

    if (form.id === "vocabForm") {
      e.preventDefault();
      sync("vocabField", "vocab2Field");
      // aquí tu runVOC1 si toca
    }

    if (form.id === "vocab2Form") {
      e.preventDefault();
      sync("vocab2Field", "vocabField");
      // aquí tu runVOC2 si toca
    }
  }, true);

  // (Opcional) también copiar mientras escribes
  document.addEventListener("input", (e) => {
    const el = e.target;
    if (!el) return;

    if (el.id === "vocabField")  sync("vocabField", "vocab2Field");
    if (el.id === "vocab2Field") sync("vocab2Field", "vocabField");
  }, true);
})();