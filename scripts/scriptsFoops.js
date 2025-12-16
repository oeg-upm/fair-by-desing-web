
// ================================
// FOOPS! tests – Refactor genérico
// ================================

(function () {
  // Mapa de formularios → configuración del test
  // Ajusta/añade entradas para nuevos tests (p. ej., VER1, FIND2, etc.)
  const TESTS_MAP = {
    // 1) VOC1 – Ontology reuses existing vocabularies for metadata annotations
    vocabForm: {
      testCode: 'VOC1',
      fieldId: 'vocabField',
      boxId: 'voc1Result',
      rawId: 'voc1Raw',
      messages: {
        running: 'Running VOC1… please wait.',
        pass: 'VOC1 passed: the ontology reuses standard vocabularies for metadata.',
        fail: 'VOC1 failed: no standard metadata vocabularies detected (see details below).',
        generic: 'VOC1 completed. See details below.'
      }
    },

    // 2) VOC2 – Ontology imports or reuses well established vocabularies
    vocab2Form: {
      testCode: 'VOC2',
      fieldId: 'vocab2Field',
      boxId: 'voc2Result',
      rawId: 'voc2Raw',
      messages: {
        running: 'Running VOC2… please wait.',
        pass: 'VOC2 passed: the ontology imports or reuses well-established vocabularies.',
        fail: 'VOC2 failed: no imports or reuse of external vocabularies detected (see details below).',
        generic: 'VOC2 completed. See details below.'
      }
    }

    // EJEMPLO para añadir otro test (crear también el HTML con esos IDs):
    // ver1Form: {
    //   testCode: 'VER1',
    //   fieldId: 'ver1Field',
    //   boxId: 'ver1Result',
    //   rawId: 'ver1Raw',
    //   messages: {
    //     running: 'Running VER1… please wait.',
    //     pass: 'VER1 passed: version IRI is declared in the ontology metadata.',
    //     fail: 'VER1 failed: no owl:versionIRI found (see details below).',
    //     generic: 'VER1 completed. See details below.'
    //   }
    // }
  };

  // -----------------------------
  // Delegación: captura submit(s)
  // -----------------------------
  document.addEventListener('submit', async (e) => {
    const form = e.target;
    const cfg = TESTS_MAP[form?.id];
    if (!cfg) return; // no es uno de los formularios mapeados

    e.preventDefault();

    // Obtén el valor del campo
    const input = form.querySelector(`#${cfg.fieldId}`);
    const value = (input?.value || '').trim();

    // Validaciones comunes
    if (!value) {
      showMessage(cfg, 'Please enter an ontology URI (e.g., https://w3id.org/your-ontology#).', 'warning', { hideRaw: true });
      return;
    }
    if (!isValidUri(value)) {
      showMessage(cfg, 'The value does not look like a valid URI. Enter the ontology URI (not just a prefix).', 'warning', { hideRaw: true });
      return;
    }

    // Asegura contenedores (si faltan en el DOM, los creamos bajo el form)
    ensureContainers(cfg, form);

    // Ejecuta el test
    await runFOOPSTest(cfg, value);
  });

  // -----------------------------
  // Utils de validación/UI/DOM
  // -----------------------------
  function isValidUri(str) {
    try { new URL(str); return true; } catch { return false; }
  }

  function ensureContainers(cfg, form) {
    let box = document.getElementById(cfg.boxId);
    let raw = document.getElementById(cfg.rawId);

    if (!box) {
      box = document.createElement('div');
      box.id = cfg.boxId;
      box.className = 'alert mt-3';
      box.style.display = 'none';
      form.insertAdjacentElement('afterend', box);
    }
    if (!raw) {
      raw = document.createElement('pre');
      raw.id = cfg.rawId;
      raw.style.display = 'none';
      raw.style.maxHeight = '300px';
      raw.style.overflow = 'auto';
      box.insertAdjacentElement('afterend', raw);
    }
  }

  // Muestra mensaje en el contenedor del test
  // hideRaw=true oculta el <pre> (útil mientras está "Running…")
  function showMessage(cfg, msg, level, opts = {}) {
    const { hideRaw = false } = opts;
    const box = document.getElementById(cfg.boxId);
    const raw = document.getElementById(cfg.rawId);
    if (!box) return;

    box.style.display = 'block';
    box.className = 'alert mt-3';
    box.classList.remove('alert-success', 'alert-warning', 'alert-danger', 'alert-info');

    if (level === 'success') box.classList.add('alert-success');
    else if (level === 'warning') box.classList.add('alert-warning');
    else if (level === 'info') box.classList.add('alert-info');
    else box.classList.add('alert-danger'); // default: error

    box.innerHTML = msg;

    if (hideRaw && raw) {
      raw.style.display = 'none';
      raw.textContent = '';
    }
  }

  // Muestra el JSON/texto devuelto por FOOPS! en el <pre>
  function showRaw(cfg, dataOrText) {
    const raw = document.getElementById(cfg.rawId);
    if (!raw) return;

    raw.style.display = 'block';
    if (typeof dataOrText === 'string') {
      raw.textContent = dataOrText;
    } else {
      raw.textContent = JSON.stringify(dataOrText, null, 2);
    }
  }

  // -----------------------------
  // Runner genérico para FOOPS!
  // -----------------------------
  async function runFOOPSTest(cfg, ontologyUri) {
    const endpoint = `https://foops.linkeddata.es/assess/test/${cfg.testCode}`;

    // 1) Estado inicial: mostramos "Running..." y ocultamos el <pre>
    showMessage(cfg, cfg.messages.running, 'info', { hideRaw: true });

    // Intento dual de payload:
    // - resource_identifier (patrón visto en /assess/test/*)
    // - ontologyUri (clave usada por /assessOntology, por compatibilidad)
    const payloads = [
      { resource_identifier: ontologyUri },
      { ontologyUri: ontologyUri }
    ];

    let lastError = null;

    for (const body of payloads) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch { data = { _raw: text }; }

        if (!res.ok) {
          lastError = new Error(`HTTP ${res.status} ${res.statusText}: ${text || 'no body'}`);
          continue; // prueba el siguiente payload
        }

        // 2) Inferimos PASS/FAIL
        const passed = inferPass(cfg.testCode, data);

        // 3) Mostramos mensaje final (no ocultar <pre>) y luego el JSON
        if (passed === true) {
          showMessage(cfg, cfg.messages.pass, 'success');
        } else if (passed === false) {
          showMessage(cfg, cfg.messages.fail, 'warning');
        } else {
          showMessage(cfg, cfg.messages.generic, 'info');
        }
        showRaw(cfg, data);

        return; // éxito → no probar siguientes payloads
      } catch (err) {
        lastError = err;
      }
    }

    // Si ambos payloads fallaron
    showMessage(cfg, `Error running ${cfg.testCode}: ${lastError ? lastError.message : 'Unknown error'}`, 'error');
    showRaw(cfg, lastError ? String(lastError) : '');
  }

  // -----------------------------
  // Heurística PASS/FAIL genérica
  // -----------------------------
  function inferPass(testCode, data) {
    try {
      // 1) Respuesta con lista de tests
      if (data?.tests) {
        const t = Array.isArray(data.tests)
          ? data.tests.find(x => new RegExp(testCode, 'i').test(x?.id || x?.shortName || ''))
          : null;

        if (t && typeof t.passed === 'boolean') return t.passed;
        if (t && typeof t.result === 'string') {
          if (/pass/i.test(t.result)) return true;
          if (/fail/i.test(t.result)) return false;
        }
      }
      // 2) Respuesta con campo "status"
      if (typeof data?.status === 'string') {
        if (/pass/i.test(data.status)) return true;
        if (/fail/i.test(data.status)) return false;
      }
      // 3) Otra estructura → desconocido
    } catch {}
    return null;
  }
})();
