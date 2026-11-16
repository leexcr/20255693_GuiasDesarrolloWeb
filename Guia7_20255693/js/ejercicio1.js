// Obteniendo la referencia de los elementos
// por medio de arreglos asociativos
const formulario = document.forms["frmRegistro"];
const button = document.forms["frmRegistro"].elements["btnRegistro"];

// CREANDO MODAL CON BOOTSTRAP
const modal = new bootstrap.Modal(document.getElementById("idModal"), {});

// OBTENIENDO LA REFERENCIA DEL CUERPO DEL MODAL
const bodyModal = document.getElementById("idBodyModal");

// Referencias a los controles del formulario
const nombre = document.getElementById("idNombre");
const apellidos = document.getElementById("idApellidos");
const fechaNac = document.getElementById("idFechaNac");
const correo = document.getElementById("idCorreo");
const password = document.getElementById("idPassword");
const passwordRepetir = document.getElementById("idPasswordRepetir");
const pais = document.getElementById("idCmPais");
const archivo = document.getElementById("idArchivo");
const intereses = document.querySelectorAll("input[type='checkbox']");
const carreras = document.getElementsByName("idRdCarrera");

// Obtiene el texto del label asociado a un control
const obtenerTextoLabel = function (control) {
  return document.querySelector(`label[for='${control.id}']`).textContent;
};

// Obtiene la fecha actual en formato yyyy-mm-dd
const obtenerFechaActual = function () {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${hoy.getFullYear()}-${mes}-${dia}`;
};

// Validando la informacion del formulario
const validarFormulario = function () {
  let errores = [];

  // a. Validando que los campos no esten vacios
  const campos = [nombre, apellidos, fechaNac, correo, password, passwordRepetir, archivo];
  for (const campo of campos) {
    if (campo.value.trim() == "") {
      errores.push(`El campo "${obtenerTextoLabel(campo).trim()}" no puede estar vacío`);
    }
  }

  // b. Validando que la fecha de nacimiento no supere la fecha actual
  if (fechaNac.value != "" && fechaNac.value > obtenerFechaActual()) {
    errores.push("La fecha de nacimiento no puede ser mayor a la fecha actual");
  }

  // c. Validando el correo electronico con expresion regular
  const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (correo.value != "" && !regexCorreo.test(correo.value.trim())) {
    errores.push("El correo electrónico no tiene un formato válido");
  }

  // d. Validando que las contraseñas sean iguales
  if (password.value != "" && passwordRepetir.value != "" && password.value != passwordRepetir.value) {
    errores.push("Las contraseñas no coinciden");
  }

  // e. Validando que se seleccione al menos un interes
  let interesSeleccionado = false;
  for (const interes of intereses) {
    if (interes.checked) {
      interesSeleccionado = true;
    }
  }
  if (!interesSeleccionado) {
    errores.push("Debe seleccionar al menos un interés");
  }

  // f. Validando que se seleccione una carrera
  let carreraSeleccionada = false;
  for (const carrera of carreras) {
    if (carrera.checked) {
      carreraSeleccionada = true;
    }
  }
  if (!carreraSeleccionada) {
    errores.push("Debe seleccionar una carrera");
  }

  // g. Validando que se seleccione un pais de origen
  if (pais.selectedIndex == 0) {
    errores.push("Debe seleccionar un país de origen");
  }

  return errores;
};

// Crea una fila de la tabla con DOM
const crearFila = function (campo, valor) {
  const fila = document.createElement("tr");

  const celdaCampo = document.createElement("th");
  celdaCampo.appendChild(document.createTextNode(campo));

  const celdaValor = document.createElement("td");
  celdaValor.appendChild(document.createTextNode(valor));

  fila.appendChild(celdaCampo);
  fila.appendChild(celdaValor);
  return fila;
};

// Muestra la informacion en una tabla dentro del modal
const mostrarInformacion = function () {
  // Limpiando el cuerpo del modal
  while (bodyModal.hasChildNodes()) {
    bodyModal.removeChild(bodyModal.firstChild);
  }

  // Obteniendo intereses seleccionados
  let listaIntereses = [];
  for (const interes of intereses) {
    if (interes.checked) {
      listaIntereses.push(obtenerTextoLabel(interes));
    }
  }

  // Obteniendo carrera seleccionada
  let carreraSeleccionada = "";
  for (const carrera of carreras) {
    if (carrera.checked) {
      carreraSeleccionada = obtenerTextoLabel(carrera);
    }
  }

  // Creando la tabla
  const tabla = document.createElement("table");
  tabla.setAttribute("class", "table table-striped table-bordered");

  const thead = document.createElement("thead");
  const filaEncabezado = document.createElement("tr");
  const thCampo = document.createElement("th");
  thCampo.appendChild(document.createTextNode("Campo"));
  const thValor = document.createElement("th");
  thValor.appendChild(document.createTextNode("Información"));
  filaEncabezado.appendChild(thCampo);
  filaEncabezado.appendChild(thValor);
  thead.appendChild(filaEncabezado);

  const tbody = document.createElement("tbody");
  tbody.appendChild(crearFila("Nombres", nombre.value));
  tbody.appendChild(crearFila("Apellidos", apellidos.value));
  tbody.appendChild(crearFila("Fecha nacimiento", fechaNac.value));
  tbody.appendChild(crearFila("Correo electrónico", correo.value));
  tbody.appendChild(crearFila("Intereses", listaIntereses.join(", ")));
  tbody.appendChild(crearFila("Carrera", carreraSeleccionada));
  tbody.appendChild(crearFila("País de origen", pais.options[pais.selectedIndex].text));
  tbody.appendChild(crearFila("Avatar", archivo.files[0].name));

  tabla.appendChild(thead);
  tabla.appendChild(tbody);
  bodyModal.appendChild(tabla);

  modal.show();
};

// agregando eventos al boton
button.onclick = () => {
  const errores = validarFormulario();

  if (errores.length > 0) {
    alert(errores.join("\n"));
  } else {
    mostrarInformacion();
  }
};
