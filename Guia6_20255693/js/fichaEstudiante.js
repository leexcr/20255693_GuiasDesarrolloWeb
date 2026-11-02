const expresiones = {
  carnet: /^[A-Z]{2}\d{3}$/,
  nombre: /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+( [A-Za-zÁÉÍÓÚáéíóúÑñÜü]+)*$/,
  dui: /^\d{8}-\d$/,
  nit: /^\d{4}-\d{6}-\d{3}-\d$/,
  fecha: /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
  correo: /^[\w.+-]+@[\w-]+(\.[\w-]+)+$/,
  edad: /^\d+$/,
};

const campos = [
  { input: document.getElementById("idTxtCarnet"), regex: expresiones.carnet, nombre: "Carnet" },
  { input: document.getElementById("idTxtNombreCompleto"), regex: expresiones.nombre, nombre: "Nombre completo" },
  { input: document.getElementById("idTxtDui"), regex: expresiones.dui, nombre: "DUI" },
  { input: document.getElementById("idTxtNit"), regex: expresiones.nit, nombre: "NIT" },
  { input: document.getElementById("idTxtFecha"), regex: expresiones.fecha, nombre: "Fecha de nacimiento" },
  { input: document.getElementById("idTxtCorreo"), regex: expresiones.correo, nombre: "Correo electrónico" },
  { input: document.getElementById("idTxtEdad"), regex: expresiones.edad, nombre: "Edad" },
];

document.getElementById("idBtnValidar").addEventListener("click", () => {
  for (let campo of campos) {
    if (!campo.regex.test(campo.input.value.trim())) {
      alert(`El campo ${campo.nombre} es incorrecto`);
      return;
    }
  }

  alert("Datos válidos");
});

document.getElementById("idBtnLimpiarFicha").addEventListener("click", () => {
  campos.forEach((campo) => {
    campo.input.value = "";
  });
});
