function toggleInput(inputId) {
    var inputField = document.getElementById(inputId);
    if (inputField.style.display === "none") {
        inputField.style.display = "block";
    } else {
        inputField.style.display = "none";
    }
}

function submitForm(inputId) {
    // Obtener el valor del campo de texto
    const inputField = document.getElementById(inputId);
    const inputValue = inputField.value.trim();

    // Verificar que el campo no esté vacío
    if (!inputValue) {
        alert("Please enter a value before submitting.");
        return;
    }

    // Llamar a la función que hace la solicitud POST
    sendRequest(inputValue);
}

function sendRequest(value) {
    const spinner = document.getElementById('loadingSpinner');
    const result = document.getElementById('resultContainer');

    // Limpiar contenido anterior
    result.style.display = "none";
    result.innerHTML = "";

    // Mostrar el spinner
    spinner.style.display = "block";

    // Crear el objeto de datos
    const requestData = {
        resource_identifier: `https://w3id.org/${value}#`
    };

    // Hacer la solicitud POST
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
        console.log("Respuesta del servidor:", data);

        // Ocultar el spinner
        spinner.style.display = "none";

        // Mostrar la respuesta
        result.style.display = "block";
        result.classList.remove("alert-danger");
        result.classList.add("alert-success");

        // Mostrar el JSON bonito
        result.innerHTML = `
            <strong>Response:</strong>
            <pre class="mb-0">${JSON.stringify(data, null, 2)}</pre>
        `;
    })
    .catch(error => {
        console.error("Error al hacer la solicitud:", error);

        // Ocultar el spinner
        spinner.style.display = "none";

        // Mostrar mensaje de error
        result.style.display = "block";
        result.classList.remove("alert-success");
        result.classList.add("alert-danger");
        result.innerHTML = `<strong>Error:</strong> ${error.message}`;
    });
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
  const dropArea  = document.getElementById('drag-drop-area');
  const fileInput = document.getElementById('fileElem');
  const response  = document.getElementById('response');
  const dragText  = document.getElementById('drag-text');

  if (!dropArea || !fileInput) {
    console.warn('Drag & drop: elementos no encontrados (¿parcial no cargado aún?)');
    return;
  }

  // Evita enganchar dos veces si vuelves a cargar el mismo parcial
  if (dropArea.dataset.initialized === 'true') return;
  dropArea.dataset.initialized = 'true';

  // Click en la caja = abrir selector de archivo
  dropArea.addEventListener('click', () => {
    fileInput.click();
  });

  // Archivo seleccionado por diálogo
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

  // Estilo visual cuando arrastras encima
  ['dragenter','dragover'].forEach(evtName => {
    dropArea.addEventListener(evtName, () => {
      dropArea.classList.add('is-dragover');
    });
  });

  ['dragleave','drop'].forEach(evtName => {
    dropArea.addEventListener(evtName, () => {
      dropArea.classList.remove('is-dragover');
    });
  });

  // Archivo soltado en el área
  dropArea.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  function handleFile(file){
    dragText.textContent = 'Selected file: ' + file.name;
    response.style.display = 'block';
    response.textContent = 'File ready: ' + file.name;

    // Aquí podrías hacer el upload con fetch/FormData si quieres
  }
}
