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