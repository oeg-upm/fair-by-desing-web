function toggleInput(inputId) {
    var inputField = document.getElementById(inputId);
    if (inputField.style.display === "none") {
        inputField.style.display = "block";
    } else {
        inputField.style.display = "none";
    }
}

function submitForm(fieldId) {
    const value = document.getElementById(fieldId).value.trim();
    if (!value) return;

    if (fieldId === 'prefixField') {
        // CHECK YOUR PREFIX (prefix.cc)
        checkPrefix(value);
    } else if (fieldId === 'uriField') {
      checkNamespaceURI(value);
        // CHECK YOUR URI (FOOPS)
      //sendRequest(value);
    }
}

function checkNamespaceURI(uri) {
  const spinner = document.getElementById('loadingSpinnerUri');
  const result = document.getElementById('resultContainerUri');

  // Reset
  result.style.display = "none";
  result.innerHTML = "";
  result.className = "alert mt-2"; // limpia clases previas

  spinner.style.display = "block";

  const messages = [];
  let status = "success";

  // 1) Validación básica + host
  let host = "";
  try {
    const url = new URL(uri);
    host = url.host;
  } catch (e) {
    messages.push(`
      <li>
        <i class="bi bi-exclamation-octagon-fill me-1"></i>
        The value does not look like a valid URI. Make sure it includes the scheme, e.g.
        <code>https://w3id.org/your-ontology#</code>.
      </li>
    `);
    status = "warning";
  }

  // 2) ¿Termina en / o #?
  if (uri.length > 0) {
    const lastChar = uri[uri.length - 1];
    if (lastChar !== '/' && lastChar !== '#') {
      messages.push(`
        <li>
          <i class="bi bi-exclamation-triangle-fill me-1"></i>
          The namespace URI should end with <code>/</code> or <code>#</code>. Consider using
          <code>${uri}/</code> or <code>${uri}#</code>.
        </li>
      `);
      if (status === "success") status = "warning";
    } else {
      messages.push(`
        <li>
          <i class="bi bi-check-circle-fill me-1"></i>
          Namespace ends with <code>${lastChar}</code>.
        </li>
      `);
    }
  }

  let versionUri = uri;
  if (uri[uri.length - 1] === '/') {
    versionUri = uri.slice(0, -1) + '#';
  }

  // 3) Proveedor recomendado
  if (host) {
    const recommendedHosts = [
      "w3id.org",
      "doi.org",
      "purl.org",
      "linked.data.gov.au",
      "dbpedia.org",
      "www.w3.org",
      "perma.cc",
      "data.europa.eu"
    ];

    const isPurlVariant = host === "purl.org" || (host.startsWith("purl.") && host.endsWith(".org"));
    const isRecommended = recommendedHosts.includes(host) || isPurlVariant;

    if (isRecommended) {
      messages.push(`
        <li>
          <i class="bi bi-check-circle-fill me-1"></i>
          The host <code>${host}</code> is a commonly used persistent provider.
        </li>
      `);
    } else {
      messages.push(`
        <li>
          <i class="bi bi-info-circle-fill me-1"></i>
          The host <code>${host}</code> is not in the usual list of persistent providers
          (e.g. <code>w3id.org</code>, <code>doi.org</code>, <code>purl.org</code>,
          <code>data.europa.eu</code>, ...), but that does not mean it is wrong.
        </li>
      `);
      if (status === "success") status = "info";
    }
  }

  // 4) Longitud del namespace
  if (uri.length >= 40) {
    messages.push(`
      <li>
        <i class="bi bi-exclamation-circle-fill me-1"></i>
        The namespace is quite long (${uri.length} characters). It is recommended to keep it under
        40 characters.
      </li>
    `);
    if (status === "success") status = "warning";
  } else if (uri.length > 0) {
    messages.push(`
      <li>
        <i class="bi bi-check-circle-fill me-1"></i>
        Namespace length is ${uri.length} characters (&lt; 40 recommended).
      </li>
    `);
  }

  // 5) Checklist opaque / readable
  const opaqueChoice = document.querySelector('input[name="opaqueChoice"]:checked');
  if (opaqueChoice) {
    if (opaqueChoice.value === "unknown") {
      messages.push(`
        <li>
          <i class="bi bi-square me-1"></i>
          You have not yet decided whether to use opaque or readable URIs. Add this to your design checklist.
        </li>
      `);
      if (status === "success") status = "warning";
    } else {
      messages.push(`
        <li>
          <i class="bi bi-check2-square me-1"></i>
          You have decided whether to use opaque or readable URIs for ontology elements (<code>${opaqueChoice.value}</code>).
        </li>
      `);
    }
  } else {
    messages.push(`
      <li>
        <i class="bi bi-square me-1"></i>
        Checklist: mark whether you will use opaque or readable URIs.
      </li>
    `);
    if (status === "success") status = "info";
  }

  // Mostrar resultado
  spinner.style.display = "none";
  result.style.display = "block";

  if (status === "success") {
    result.classList.add("alert-success");
  } else if (status === "warning") {
    result.classList.add("alert-warning");
  } else {
    result.classList.add("alert-info");
  }

  result.innerHTML = `
    <strong>Namespace URI check</strong>
    <ul class="mb-0 mt-2">
      ${messages.join("")}
    </ul>
  `;
  checkVersionSchema(versionUri);
}



// === CHECK YOUR PREFIX (prefix.cc) ===
function checkPrefix(prefix) {
  const spinner = document.getElementById('loadingSpinnerPrefix');
  const result = document.getElementById('resultContainerPrefix');

  // Reset
  result.style.display = "none";
  result.innerHTML = "";
  result.className = "alert mt-2"; // limpia clases previas

  // Mostrar spinner
  spinner.style.display = "block";

  fetch(`https://prefix.cc/${encodeURIComponent(prefix)}.file.json`)
    .then(response => {
      spinner.style.display = "none";
      result.style.display = "block";

      if (response.ok) {
        // El prefijo EXISTE
        result.classList.add("alert-danger");
        result.innerHTML = `
          <i class="bi bi-x-circle-fill me-2"></i>
          The prefix <strong>${prefix}</strong> already exists in prefix.cc. Better think of another one.
        `;
      } else if (response.status === 404) {
        // El prefijo NO existe
        result.classList.add("alert-success");
        result.innerHTML = `
          <i class="bi bi-check-circle-fill me-2"></i>
          The prefix <strong>${prefix}</strong> is not registered in prefix.cc. You can use it.
        `;
      } else {
        result.classList.add("alert-danger");
        result.innerHTML = `
          <strong>Error:</strong> Could not check the prefix (HTTP ${response.status}).
        `;
      }
    })
    .catch(error => {
      spinner.style.display = "none";
      result.style.display = "block";
      result.classList.add("alert-danger");
      result.innerHTML = `<strong>Error:</strong> ${error.message}`;
    });
}


function sendRequest(value) {
  const spinner = document.getElementById('loadingSpinnerUri');
  const result = document.getElementById('resultContainerUri');

  result.style.display = "none";
  result.innerHTML = "";
  result.className = "alert mt-2";

  spinner.style.display = "block";

  const requestData = {
    resource_identifier: `https://w3id.org/${value}#`
  };

  fetch("https://foops.linkeddata.es/assess/test/FIND2", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestData)
  })
    .then(response => response.json())
    .then(data => {
      spinner.style.display = "none";
      result.style.display = "block";
      result.classList.add("alert-success");
      result.innerHTML = `
        <strong>Response:</strong>
        <pre class="mb-0">${JSON.stringify(data, null, 2)}</pre>
      `;
    })
    .catch(error => {
      spinner.style.display = "none";
      result.style.display = "block";
      result.classList.add("alert-danger");
      result.innerHTML = `<strong>Error:</strong> ${error.message}`;
    });
}


function checkVersionSchema(uri) {
  const versionBox = document.getElementById('versionResult');
  if (!versionBox) return;

  versionBox.style.display = "block";
  versionBox.className = "alert mt-3";
  versionBox.classList.add("alert-light");
  versionBox.innerHTML = "";

  if (!uri) {
    versionBox.classList.remove("alert-light");
    versionBox.classList.add("alert-warning");
    versionBox.innerHTML = `
      <strong>Versioning check</strong>
      <p class="mb-0 mt-2">Please enter a namespace URI in step 1 before checking your version schema.</p>
    `;
    return;
  }

  let semverUsed = false;
  let calverUsed = false;

  let lastSegment = "";

  try {
    const url = new URL(uri);
    const path = url.pathname;
    const segments = path.split('/').filter(Boolean);
    lastSegment = segments[segments.length - 1] || "";

    const semverRegex = /^\d+\.\d+\.\d+$/; // 1.0.0
    const calverRegex = /^20\d{2}([.-]?\d{2}([.-]?\d{2})?)?$/; // 2024 o 2024-05 o 2024-05-10

    if (semverRegex.test(lastSegment)) semverUsed = true;
    if (calverRegex.test(lastSegment)) calverUsed = true;
  } catch (e) {
    // URI no parseable, seguimos sin detección automática
  }

  // Base para ejemplos: si no acaba en / o #, añadimos /
  let base = uri;
  const lastChar = uri[uri.length - 1];
  if (lastChar !== '/' && lastChar !== '#') {
    base = uri + '/';
  }

  // Ejemplo SemVer
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');

  const exampleSemver = base + '1.0.0';
  const exampleCalver = base + `${yyyy}-${mm}-${dd}`;

  versionBox.classList.remove("alert-light");
  versionBox.classList.add("alert-info");

  // Elegir esquema inicial por defecto
  let initialScheme = 'semver';

  versionBox.innerHTML = `
    <strong>Versioning scheme</strong>
    <p class="mb-2 mt-2">
      According to your namespace, here you have some options to define <code>versionIRI</code> (or similar).
      ${semverUsed ? '<span class="badge bg-success ms-1">SemVer pattern detected</span>' : ''}
      ${calverUsed ? '<span class="badge bg-success ms-1">CalVer pattern detected</span>' : ''}
    </p>

    <div class="mb-2">
      <label class="form-label mb-1" for="versionSchemeSelect">Choose a versioning scheme:</label>
      <select id="versionSchemeSelect" class="form-select form-select-sm">
        <option value="semver" ${initialScheme === 'semver' ? 'selected' : ''}>Semantic Versioning (SemVer)</option>
        <option value="calver" ${initialScheme === 'calver' ? 'selected' : ''}>Calendar versioning (CalVer)</option>
        <option value="custom" ${initialScheme === 'custom' ? 'selected' : ''}>Custom suffix</option>
      </select>
    </div>

    <div class="mb-2">
      <label class="form-label mb-1" for="versionSuffixInput">Version string or suffix:</label>
      <input type="text" id="versionSuffixInput" class="form-control form-control-sm" />
      <div class="form-text" id="versionSuffixHelp"></div>
    </div>

    <div class="mt-2">
      <span class="fw-semibold">Resulting version URI:</span>
      <code id="versionUriPreview" class="d-block mt-1"></code>
    </div>

    <p class="mb-0 small text-muted mt-2">
      Updated in metadata!
    </p>
  `;

  // Enganchar eventos a los controles recién creados
  const schemeSelect = document.getElementById('versionSchemeSelect');
  const suffixInput  = document.getElementById('versionSuffixInput');
  const help         = document.getElementById('versionSuffixHelp');
  const preview      = document.getElementById('versionUriPreview');

  if (!schemeSelect || !suffixInput || !help || !preview) return;

  function setDefaultsForScheme() {
    const scheme = schemeSelect.value;

    if (scheme === 'semver') {
      suffixInput.value = '1.0.0';
      help.textContent = `Example: ${exampleSemver}`;
    } else if (scheme === 'calver') {
      suffixInput.value = `${yyyy}-${mm}-${dd}`;
      help.textContent = `Example: ${exampleCalver}`;
    } else {
      suffixInput.value = '';
      suffixInput.placeholder = 'e.g. v1, draft, beta, ...';
      help.textContent = 'Type the suffix you want to append to your namespace URI.';
    }
  }

  function updatePreview() {
    const suffix = suffixInput.value.trim();
    if (suffix) {
      preview.textContent = base + suffix;
    } else {
      preview.textContent = '(please enter a version string)';
    }
  }

  schemeSelect.addEventListener('change', () => {
    setDefaultsForScheme();
    updatePreview();
  });

  suffixInput.addEventListener('input', () => {
    updatePreview();
  });

  // Inicializar
  setDefaultsForScheme();
  updatePreview();
}


document.addEventListener('DOMContentLoaded', () => {

  const btnToTop = document.getElementById('btnToTop');
  const btnToPrinciples = document.getElementById('btnToPrinciples');
  const btnToWhy = document.getElementById('btnToWhy');


  const header = document.querySelector('.header-wrap');
  const headerOffset = header ? header.offsetHeight : 0;

  function scrollWithOffset(target) {
    const elementPos = target.getBoundingClientRect().top + window.scrollY;
    const finalPos = elementPos - headerOffset;

    window.scrollTo({
      top: finalPos,
      behavior: 'smooth'
    });
  }

  if (btnToTop) {
    btnToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  if (btnToPrinciples) {
    btnToPrinciples.addEventListener('click', () => {
      const section = document.getElementById('principlesSection');
      if (section) scrollWithOffset(section);
    });
  }

  if (btnToWhy) {
    btnToWhy.addEventListener('click', () => {
      const section = document.getElementById('whySection');
      if (section) scrollWithOffset(section);
    });
  }


});


function initializeDragAndDrop() {
  const dropArea        = document.getElementById('drag-drop-area');
  const fileInput       = document.getElementById('fileElem');
  const response        = document.getElementById('response');
  const dragText        = document.getElementById('drag-text');
  const downloadWrapper = document.getElementById('downloadTtlWrapper');
  const downloadBtn     = document.getElementById('downloadTtlBtn');

  // TTL generado por Chowlk (para descarga)
  let generatedTtl = '';

  // Si no existe el bloque (por si el parcial no está cargado), salir
  if (!dropArea || !fileInput || !response || !dragText) {
    console.warn('Drag & drop: elementos no encontrados');
    return;
  }

  // Evitar enganchar los eventos dos veces si se recarga el parcial
  if (dropArea.dataset.initialized === 'true') return;
  dropArea.dataset.initialized = 'true';

  // Helper visual para resetear el texto y color
  function resetBox() {
    dropArea.style.backgroundColor = 'white';
    dragText.style.display = 'block';
    dragText.textContent = 'Drag and drop your diagram or click to choose your file';
  }

  // Click en la caja → abrir selector de archivo
  dropArea.addEventListener('click', () => {
    fileInput.value = ''; // para disparar change aunque seleccione el mismo fichero
    fileInput.click();
  });

  // Archivo seleccionado por el diálogo
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  });

  // Evitar comportamiento por defecto del navegador en drag & drop
  ['dragenter','dragover','dragleave','drop'].forEach(evtName => {
    dropArea.addEventListener(evtName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  });

  dropArea.addEventListener('dragenter', () => {
    response.style.display = 'none';
    resetBox();
  });

  dropArea.addEventListener('dragover', () => {
    dropArea.style.backgroundColor = '#ECECEC';
    dragText.textContent = 'Release your diagram';
  });

  dropArea.addEventListener('dragleave', () => {
    resetBox();
  });

  dropArea.addEventListener('drop', (e) => {
    resetBox();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  // Procesar archivo: comprobar extensión y llamar a Chowlk
  function handleFile(file) {
    const isXmlType = file.type === 'text/xml' || file.type === 'application/xml';
    const isXmlName = file.name.toLowerCase().endsWith('.xml');

    if (!isXmlType && !isXmlName) {
      alert('The diagram must be an XML file (.xml)');
      return;
    }

    dragText.innerHTML = '<b>"' + file.name + '"</b> selected. Sending to Chowlk...';
    response.style.display = 'none';
    response.innerHTML = '';

    generatedTtl = '';
    if (downloadWrapper) {
      downloadWrapper.style.display = 'none';
    }

    transformDiagramWithChowlk(file);
  }

  // Llamada a la API de Chowlk desde el navegador
function transformDiagramWithChowlk(file) {
  const uri = 'https://chowlk.linkeddata.es/api';
  const formData = new FormData();

  // nombre del campo = "data", tal y como dice la doc de Chowlk
  formData.append('data', file, file.name);

  fetch(uri, {
    method: 'POST',
    body: formData,
    headers: {
      // Igual que el curl con "Accept: application/json"
      'Accept': 'application/json'
      // NO pongas Content-Type a mano, que si no rompes el boundary del multipart
    }
  })
  .then(res => {
    if (!res.ok) {
      // Para ver bien qué devuelve el servidor
      return res.text().then(t => {
        throw new Error(`HTTP ${res.status} ${res.statusText} – ${t || 'no body'}`);
      });
    }
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Respuesta no es JSON: ${text}`);
    }
  })
  .then(data => {
    const ttl = data.ttl_data || '';

    generatedTtl = ttl;
    dragText.style.display = 'none';
    response.style.display = 'block';

    response.innerHTML = `
      <strong>Generated Turtle (TTL) from your diagram:</strong>
      <pre class="mt-2 mb-0" style="white-space: pre; overflow-x:auto;">${escapeHtml(ttl)}</pre>
    `;

    if (downloadWrapper) {
      downloadWrapper.style.display = 'block';
    }
  })
  .catch(err => {
    console.error('Error calling Chowlk:', err);

    dragText.style.display = 'block';
    dragText.textContent = 'There was an error transforming your diagram. Please try again.';

    response.style.display = 'block';
    response.innerHTML = `
      <div class="alert alert-danger mt-2 mb-0">
        <strong>Error:</strong> ${escapeHtml(err.message)}
      </div>
    `;

    if (downloadWrapper) {
      downloadWrapper.style.display = 'none';
    }
  });
}


  // Descargar el TTL generado
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      if (!generatedTtl) {
        alert('There is no TTL generated yet.');
        return;
      }

      const blob = new Blob([generatedTtl], { type: 'text/turtle;charset=utf-8' });
      const url  = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'ontology.ttl';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  // Escapar HTML para mostrar el TTL de forma segura
  function escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

// Manejar explicación de opaque/readable aunque el HTML se cargue por AJAX
// Manejar explicación de opaque/readable aunque el HTML se cargue por AJAX
document.addEventListener('change', function (e) {
  const target = e.target;
  if (!target.matches('input[name="opaqueChoice"]')) {
    return; // no es uno de nuestros radios → ignorar
  }

  const explanation = document.getElementById('uriExplanation');
  if (!explanation) return; // aún no se ha cargado el bloque

  const texts = {
    readable: `
      <strong>Readable (non-opaque) URIs</strong>
      <ul class="mb-0">
        <li><strong>Pro:</strong> easier to read.</li>
        <li><strong>Con:</strong> a change in the label will cause a change in the term URI.</li>
      </ul>
    `,
    opaque: `
      <strong>Opaque URIs</strong>
      <ul class="mb-0">
        <li><strong>Pro:</strong> better for compatibility with legacy systems and for multi-linguality.</li>
        <li><strong>Con:</strong> difficult to read.</li>
      </ul>
    `,
    unknown: `
      <strong>Not sure yet?</strong>
      <ul class="mb-0">
        <li>Readable: easier to read, but changing the label changes the URI.</li>
        <li>Opaque: better for versioning and multi-linguality, but harder to read.</li>
        <li>Decide what fits your use case better.</li>
      </ul>
    `
  };

  const value = target.value;
  const html = texts[value];

  if (!html) {
    explanation.classList.add('d-none');
    explanation.innerHTML = '';
    return;
  }

  explanation.innerHTML = html;
  explanation.classList.remove('d-none');
});

function updateMetadataSnippet() {
  const snippetPre = document.getElementById('metadataSnippet');
  if (!snippetPre) return;

  // Prefix y namespace desde el paso 1
  const prefixInput = document.getElementById('prefixField');
  const uriInput    = document.getElementById('uriField');

  let prefix = prefixInput ? prefixInput.value.trim() : '';
  let ns     = uriInput ? uriInput.value.trim() : '';

  if (!prefix) prefix = 'ex';
  if (!ns) ns = 'http://example.com/ontology#';

  // Aseguramos que el namespace termina en / o #
  let base = ns;
  const lastChar = base[base.length - 1];
  if (lastChar !== '/' && lastChar !== '#') {
    base = base + '#';
  }

  // Version IRI desde el paso 2 (preview)
  const versionPreviewEl = document.getElementById('versionUriPreview');
  let versionIri = versionPreviewEl ? versionPreviewEl.textContent.trim() : '';
  if (!versionIri || versionIri.startsWith('(')) {
    versionIri = ''; // modo "please enter..." → ignorar
  }

  // Campos de metadata del paso 3
  const titleInput   = document.getElementById('mdTitle');
  const descInput    = document.getElementById('mdDescription');
  const licenseInput = document.getElementById('mdLicense');
  const creatorContainer = document.getElementById('creatorContainer');

  const title   = titleInput && titleInput.value.trim() ? titleInput.value.trim() : 'add ontology title';

  const desc    = descInput && descInput.value.trim() ? descInput.value.trim() : 'add ontology description';

  const license = licenseInput && licenseInput.value.trim() ? licenseInput.value.trim() : '';

  // Todos los creadores (pueden ser varios)
  let creators = [];
  if (creatorContainer) {
    creators = Array.from(
      creatorContainer.querySelectorAll('.creator-input')
    )
    .map(el => el.value.trim())
    .filter(Boolean);
  }

  function esc(str) {
    return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  let ttl = '';

  // Prefix declarations
  ttl += `@prefix ${prefix}: <${base}> .\n`;
  ttl += '@prefix owl:    <http://www.w3.org/2002/07/owl#> .\n';
  ttl += '@prefix dcterms:<http://purl.org/dc/terms/> .\n';
  ttl += '@prefix vann:   <http://purl.org/vocab/vann/> .\n\n';

  // Ontology metadata
  ttl += `${prefix}: a owl:Ontology ;\n`;
  ttl += `    dcterms:title "${esc(title)}" ;\n`;
  ttl += `    dcterms:description "${esc(desc)}" ;\n`;

  if (license) {
    // Como viene de un <select>, asumimos que es siempre una IRI
    ttl += `    dcterms:license <${license}> ;\n`;
  } else {
    ttl += `    dcterms:license "TODO: add license (e.g. CC-BY-4.0)" ;\n`;
  }

  if (creators.length === 0) {
    ttl += `    dcterms:creator "add creator name" ;\n`;
  } else {
    creators.forEach(c => {
      ttl += `    dcterms:creator "${esc(c)}" ;\n`;
    });
  }

  if (versionIri) {
    ttl += `    owl:versionIRI <${versionIri}> ;\n`;
  } else {
    ttl += `    owl:versionIRI <${base}1.0.0> ;\n`;
  }

  ttl += `    vann:preferredNamespaceUri <${base}> .\n`;

  snippetPre.textContent = ttl;
}


function initializeMetadataForm() {
  const snippetPre = document.getElementById('metadataSnippet');
  if (!snippetPre) return; // no estamos en encoding.html

  const titleInput       = document.getElementById('mdTitle');
  const descInput        = document.getElementById('mdDescription');
  const licenseSelect    = document.getElementById('mdLicense');
  const creatorContainer = document.getElementById('creatorContainer');

  // Rellenar lista de licencias
  if (licenseSelect) {
    populateLicenseSelect();
    licenseSelect.addEventListener('change', () => {
      updateMetadataSnippet();
    });
  }

  // Cambios en title/description → actualizan snippet
  const fields = [titleInput, descInput];
  fields.forEach(el => {
    if (el) {
      el.addEventListener('input', () => {
        updateMetadataSnippet();
      });
    }
  });

  // Manejo dinámico de creadores (+ / -) y cambios de texto
  if (creatorContainer) {
    // Click en + o -
    creatorContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-role]');
      if (!btn) return;

      const role = btn.dataset.role;

      if (role === 'add-creator') {
        addCreatorRow();
        updateMetadataSnippet();
      } else if (role === 'remove-creator') {
        const row = btn.closest('.creator-row');
        if (!row) return;

        const rows = creatorContainer.querySelectorAll('.creator-row');
        if (rows.length > 1) {
          row.remove();
          updateMetadataSnippet();
        }
      }
    });

    // Cualquier cambio en inputs de creadores → actualiza snippet
    creatorContainer.addEventListener('input', (e) => {
      if (e.target.classList.contains('creator-input')) {
        updateMetadataSnippet();
      }
    });
  }

  function addCreatorRow() {
    const row = document.createElement('div');
    row.className = 'input-group input-group-sm mb-1 creator-row';
    row.innerHTML = `
      <input type="text"
             class="form-control creator-input"
             placeholder="Name, group or organisation">
      <button type="button"
              class="btn btn-outline-danger"
              data-role="remove-creator">
        <i class="bi bi-dash-lg"></i>
      </button>
    `;
    creatorContainer.appendChild(row);
  }

  // Primera generación del snippet
  updateMetadataSnippet();
}


// === Lista de licencias disponibles ===
const LICENSES = [
  { value: "", label: "Select a license…" },

  // Creative Commons
  {
    value: "https://creativecommons.org/publicdomain/zero/1.0/",
    label: "CC0 1.0 Universal (CC0)"
  },
  {
    value: "https://creativecommons.org/licenses/by/4.0/",
    label: "Creative Commons Attribution 4.0 International (CC BY 4.0)"
  },
  {
    value: "https://creativecommons.org/licenses/by-sa/4.0/",
    label: "Creative Commons Attribution-ShareAlike 4.0 (CC BY-SA 4.0)"
  },
  {
    value: "https://creativecommons.org/licenses/by-nd/4.0/",
    label: "Creative Commons Attribution-NoDerivatives 4.0 (CC BY-ND 4.0)"
  },
  {
    value: "https://creativecommons.org/licenses/by-nc/4.0/",
    label: "Creative Commons Attribution-NonCommercial 4.0 (CC BY-NC 4.0)"
  },
  {
    value: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
    label: "Creative Commons Attribution-NonCommercial-ShareAlike 4.0 (CC BY-NC-SA 4.0)"
  },
  {
    value: "https://creativecommons.org/licenses/by-nc-nd/4.0/",
    label: "Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 (CC BY-NC-ND 4.0)"
  },

  // Open Data Commons
  {
    value: "https://opendatacommons.org/licenses/pddl/1-0/",
    label: "Open Data Commons Public Domain Dedication and License (PDDL 1.0)"
  },
  {
    value: "https://opendatacommons.org/licenses/by/1-0/",
    label: "Open Data Commons Attribution License (ODC-By 1.0)"
  },
  {
    value: "https://opendatacommons.org/licenses/odbl/1-0/",
    label: "Open Data Commons Open Database License (ODbL 1.0)"
  },

  // OSS típicas
  {
    value: "https://www.apache.org/licenses/LICENSE-2.0",
    label: "Apache License 2.0"
  },
  {
    value: "https://opensource.org/licenses/MIT",
    label: "MIT License"
  },
  {
    value: "https://opensource.org/licenses/BSD-2-Clause",
    label: "BSD 2-Clause \"Simplified\" License"
  },
  {
    value: "https://opensource.org/licenses/BSD-3-Clause",
    label: "BSD 3-Clause \"New\" or \"Revised\" License"
  },

  // GPL family
  {
    value: "https://www.gnu.org/licenses/gpl-3.0",
    label: "GNU General Public License v3.0 (GPL-3.0)"
  },
  {
    value: "https://www.gnu.org/licenses/lgpl-3.0",
    label: "GNU Lesser General Public License v3.0 (LGPL-3.0)"
  },
  {
    value: "https://www.gnu.org/licenses/agpl-3.0",
    label: "GNU Affero General Public License v3.0 (AGPL-3.0)"
  },

  // EUPL
  {
    value: "https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12",
    label: "European Union Public License 1.2 (EUPL-1.2)"
  }
];

// Rellena el <select> de licencias
function populateLicenseSelect() {
  const select = document.getElementById('mdLicense');
  if (!select) return;

  select.innerHTML = "";

  LICENSES.forEach(lic => {
    const opt = document.createElement('option');
    opt.value = lic.value;
    opt.textContent = lic.label;
    select.appendChild(opt);
  });
}
