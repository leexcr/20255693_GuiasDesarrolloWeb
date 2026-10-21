let pedidos = [];

const formPedido = document.querySelector("#formPedido");
const txtProducto = document.querySelector("#txtProducto");
const txtPrecio = document.querySelector("#txtPrecio");
const txtCantidad = document.querySelector("#txtCantidad");
const txtPrecioMaximo = document.querySelector("#txtPrecioMaximo");
const mensajeError = document.querySelector("#mensajeError");
const cuerpoTabla = document.querySelector("#cuerpoTabla");
const totalUnidades = document.querySelector("#totalUnidades");
const montoTotal = document.querySelector("#montoTotal");
const btnFiltrar = document.querySelector("#btnFiltrar");
const btnMostrarTodos = document.querySelector("#btnMostrarTodos");
const btnLimpiar = document.querySelector("#btnLimpiar");

function validarPedido(producto, precio, cantidad) {
  if (producto === "") {
    return "El nombre del producto no puede estar vacío.";
  }
  if (isNaN(precio) || precio <= 0) {
    return "El precio debe ser mayor que cero.";
  }
  if (!Number.isInteger(cantidad) || cantidad <= 0) {
    return "La cantidad debe ser un número entero positivo.";
  }
  return "";
}

function crearPedido(producto, precio, cantidad) {
  return { producto: producto, precio: precio, cantidad: cantidad };
}

function calcularSubtotal(pedido) {
  return pedido.precio * pedido.cantidad;
}

function calcularTotalUnidades(lista) {
  return lista.reduce((total, pedido) => total + pedido.cantidad, 0);
}

function calcularMontoTotal(lista) {
  return lista.reduce((total, pedido) => total + calcularSubtotal(pedido), 0);
}

function filtrarPorPrecio(lista, precioMaximo) {
  return lista.filter((pedido) => pedido.precio <= precioMaximo);
}

function mostrarTabla(lista) {
  cuerpoTabla.innerHTML = lista
    .map(
      (pedido) => `
        <tr>
          <td>${pedido.producto}</td>
          <td>$${pedido.precio.toFixed(2)}</td>
          <td>${pedido.cantidad}</td>
          <td>$${calcularSubtotal(pedido).toFixed(2)}</td>
        </tr>`
    )
    .join("");
}

function mostrarTotales() {
  totalUnidades.innerHTML = calcularTotalUnidades(pedidos);
  montoTotal.innerHTML = `$${calcularMontoTotal(pedidos).toFixed(2)}`;
}

function mostrarError(mensaje) {
  mensajeError.innerHTML = mensaje;
  mensajeError.classList.toggle("d-none", mensaje === "");
}

function limpiarFormulario() {
  formPedido.reset();
  txtProducto.focus();
}


function agregarPedido(evento) {
  evento.preventDefault();

  const producto = txtProducto.value.trim();
  const precio = parseFloat(txtPrecio.value);
  const cantidad = Number(txtCantidad.value);

  const error = validarPedido(producto, precio, cantidad);
  if (error !== "") {
    mostrarError(error);
    return;
  }

  mostrarError("");
  pedidos.push(crearPedido(producto, precio, cantidad));
  mostrarTabla(pedidos);
  mostrarTotales();
  limpiarFormulario();
}

function filtrarProductos() {
  const precioMaximo = parseFloat(txtPrecioMaximo.value);
  if (isNaN(precioMaximo) || precioMaximo <= 0) {
    mostrarError("Ingrese un precio máximo válido para filtrar.");
    return;
  }
  mostrarError("");
  mostrarTabla(filtrarPorPrecio(pedidos, precioMaximo));
}

function mostrarTodos() {
  mostrarError("");
  txtPrecioMaximo.value = "";
  mostrarTabla(pedidos);
}

function limpiarPedidos() {
  pedidos = [];
  mostrarError("");
  mostrarTabla(pedidos);
  mostrarTotales();
}

formPedido.addEventListener("submit", agregarPedido);
btnFiltrar.addEventListener("click", filtrarProductos);
btnMostrarTodos.addEventListener("click", mostrarTodos);
btnLimpiar.addEventListener("click", limpiarPedidos);