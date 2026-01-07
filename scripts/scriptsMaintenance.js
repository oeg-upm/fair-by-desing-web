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

(() => {
  if (window.__runAllMaintBound) return;
  window.__runAllMaintBound = true;

  const FORM_IDS = [
    "om42Form",
    "ver2Form"
  ];

  function clickSubmit(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    const btn = form.querySelector('button[type="submit"], input[type="submit"]');
    if (btn) btn.click();
    else form.requestSubmit?.(); // fallback moderno
  }

  // Secuencial: evita pegar 10 fetches a la vez (y que FOOPS se haga el sueco)
  async function runAll() {
    const mainBtn = document.getElementById("runAllMaintenanceTests");
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
    if (t && t.id === "runAllMaintenanceTests") {
      e.preventDefault();
      runAll();
    }
  }, true);
})();
