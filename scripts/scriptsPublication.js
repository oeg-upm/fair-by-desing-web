(() => {
  // No lo enganches 200 veces si repintas la vista
  if (window.__pubInputsSyncBound) return;
  window.__pubInputsSyncBound = true;

  const FIELDS = [
    "http1Field",
    "rdf1Field",
    "cn1Field",
    "doc1Field",
    "uri1Field",
    "uri2Field",
    "ver1Field",
    "ver2Field",
    "find3Field",
    "find3bisField"
  ];

  // Evita bucles raros si algún framework dispara input al setear value
  let isSyncing = false;

  function syncFrom(sourceId) {
    if (isSyncing) return;

    const src = document.getElementById(sourceId);
    if (!src) return;

    isSyncing = true;
    const v = src.value;

    for (const id of FIELDS) {
      if (id === sourceId) continue;
      const el = document.getElementById(id);
      if (el) el.value = v;
    }

    isSyncing = false;
  }

  // Copiar mientras escribes (lo más importante)
  document.addEventListener(
    "input",
    (e) => {
      const el = e.target;
      if (!el || !el.id) return;
      if (!FIELDS.includes(el.id)) return;

      syncFrom(el.id);
    },
    true
  );

  // Extra: al enviar cualquier form, aseguramos sync por si acaso
  document.addEventListener(
    "submit",
    (e) => {
      const form = e.target;
      if (!form) return;

      // Busca el input del form que pertenezca a la lista y sincroniza
      const input = form.querySelector("input[type='text']");
      if (input && input.id && FIELDS.includes(input.id)) {
        syncFrom(input.id);
      }
      // NO hacemos preventDefault aquí: eso ya lo hace scriptsFoops.js
    },
    true
  );
})();

(() => {
  if (window.__runAllPublBound) return;
  window.__runAllPublBound = true;

  const FORM_IDS = [
    "http1Form",
    "rdf1Form",
    "cn1Form",
    "doc1Form",
    "uri1Form",
    "uri2Form",
    "ver1Form",
    "ver2Form",
    "find3Form",
    "find3bisForm"
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
    const mainBtn = document.getElementById("runAllPublicationTests");
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
    if (t && t.id === "runAllPublicationTests") {
      e.preventDefault();
      runAll();
    }
  }, true);
})();