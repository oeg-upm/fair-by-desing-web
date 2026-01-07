(() => {
  // Evita engancharlo 200 veces si repintas la vista (solo para VOC3/VOC4)
  if (window.__voc34SyncBound) return;
  window.__voc34SyncBound = true;

  const sync = (fromId, toId) => {
    const from = document.getElementById(fromId);
    const to   = document.getElementById(toId);
    if (from && to) to.value = from.value;
  };

  // Copiar al hacer submit
  document.addEventListener("submit", (e) => {
    const form = e.target;
    if (!form) return;

    if (form.id === "voc3Form") {
      e.preventDefault();
      sync("voc3Field", "voc4Field");
      // runVOC3?.(document.getElementById("voc3Field")?.value);
    }

    if (form.id === "voc4Form") {
      e.preventDefault();
      sync("voc4Field", "voc3Field");
      // runVOC4?.(document.getElementById("voc4Field")?.value);
    }
  }, true);

  // (Opcional) copiar mientras escribes
  document.addEventListener("input", (e) => {
    const el = e.target;
    if (!el) return;

    if (el.id === "voc3Field") sync("voc3Field", "voc4Field");
    if (el.id === "voc4Field") sync("voc4Field", "voc3Field");
  }, true);
})();

(() => {
  if (window.__runAllDocuBound) return;
  window.__runAllDocuBound = true;

  const FORM_IDS = [
    "voc3Form",
    "voc4Form"
  ];

  function clickSubmit(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    const btn = form.querySelector('button[type="submit"], input[type="submit"]');
    if (btn) btn.click();
    else form.requestSubmit?.(); // fallback moderno
  }

  async function runAll() {
    const mainBtn = document.getElementById("runAllDocumentationTests");
    if (mainBtn) {
      mainBtn.disabled = true;
      mainBtn.textContent = "Running...";
    }

    for (const id of FORM_IDS) {
      clickSubmit(id);
      // pequeña pausa para no spamear (ajústala si quieres)
      await new Promise(r => setTimeout(r, 250));
    }

    if (mainBtn) {
      mainBtn.disabled = false;
      mainBtn.textContent = "Run all tests";
    }
  }

  // Delegación por si el HTML se inyecta tarde
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (t && t.id === "runAllDocumentationTests") {
      e.preventDefault();
      runAll();
    }
  }, true);
})();
