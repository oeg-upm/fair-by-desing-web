(() => {
  let initialized = false;

  function escapeHtml(text) {
    return (text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function initChowlkStep2() {
    const dropArea  = document.getElementById('drag-drop-area');
    const fileInput = document.getElementById('fileElem');
    const response  = document.getElementById('response');
    const dragText  = document.getElementById('drag-text');

    const downloadWrapper = document.getElementById('downloadTtlWrapper');
    const downloadBtn     = document.getElementById('downloadTtlBtn');

    // Si el parcial aún no está pintado, fuera.
    if (!dropArea || !fileInput || !response || !dragText) return;

    // Evitar doble inicialización (si repintas el HTML)
    if (initialized || dropArea.dataset.initialized === 'true') return;
    initialized = true;
    dropArea.dataset.initialized = 'true';

    let generatedTtl = '';

    function setDownload(enabled) {
      if (downloadWrapper) downloadWrapper.style.display = enabled ? 'block' : 'none';
      if (downloadBtn) downloadBtn.disabled = !enabled;
    }

    function resetBox() {
      dropArea.style.backgroundColor = 'white';
      dragText.style.display = 'block';
      dragText.textContent = 'Drag and drop your diagram or click to choose your file';
    }

    async function transformDiagramWithChowlk(file) {
      const uri = 'https://chowlk.linkeddata.es/api';
      const formData = new FormData();
      formData.append('data', file, file.name);

      const res = await fetch(uri, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} ${res.statusText}${t ? ' – ' + t : ''}`);
      }

      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        return res.json();
      }
      // fallback: texto (a veces devuelve TTL directo o JSON en texto)
      const text = await res.text();
      try { return JSON.parse(text); } catch { return { ttl_data: text }; }
    }

    async function handleFile(file) {
      const isXmlType = file.type === 'text/xml' || file.type === 'application/xml';
      const isXmlName = file.name.toLowerCase().endsWith('.xml');

      if (!isXmlType && !isXmlName) {
        alert('The diagram must be an XML file (.xml)');
        return;
      }

      dragText.innerHTML = `<b>"${escapeHtml(file.name)}"</b> selected. Sending to Chowlk...`;
      response.style.display = 'none';
      response.innerHTML = '';
      generatedTtl = '';
      setDownload(false);

      try {
        const data = await transformDiagramWithChowlk(file);
        const ttl = data.ttl_data || data.ttl || '';

        generatedTtl = ttl;

        dragText.style.display = 'none';
        response.style.display = 'block';
        response.innerHTML = `
          <strong>Generated Turtle (TTL)</strong>
          <pre class="mt-2 mb-0" style="white-space: pre; overflow-x:auto;">${escapeHtml(ttl)}</pre>
        `;

        setDownload(true);
      } catch (err) {
        console.error('Chowlk error:', err);
        dragText.style.display = 'block';
        dragText.textContent = 'There was an error transforming your diagram. Please try again.';

        response.style.display = 'block';
        response.innerHTML = `
          <div class="alert alert-danger mt-2 mb-0">
            <strong>Error:</strong> ${escapeHtml(err.message)}
          </div>
        `;

        setDownload(false);
      }
    }

    // Click → abrir selector
    dropArea.addEventListener('click', () => {
      fileInput.value = '';
      fileInput.click();
    });

    // Selección por diálogo
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) handleFile(file);
    });

    // Drag & drop
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
      const file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) handleFile(file);
    });

    // Descargar TTL
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

    // Estado inicial
    setDownload(false);
    resetBox();
  }

  // 1) Intenta init ya
  initChowlkStep2();

  // 2) Y también cuando cargue el DOM
  document.addEventListener('DOMContentLoaded', initChowlkStep2);

  // 3) Y para cuando el parcial se inyecte más tarde
  const obs = new MutationObserver(() => initChowlkStep2());
  obs.observe(document.documentElement, { childList: true, subtree: true });
})();
