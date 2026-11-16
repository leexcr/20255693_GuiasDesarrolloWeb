// Configuracion de la API de Sephora en RapidAPI
// Pegue aqui su llave de RapidAPI (X-RapidAPI-Key)
const API_KEY = "5d3c25a492mshb11881c7fc95f9ap1101b8jsnd0c10edf9091";
const API_HOST = "sephora.p.rapidapi.com";
const URL_BASE = `https://${API_HOST}`;

// Categoria de maquillaje en Sephora
const CATEGORIA_MAQUILLAJE = "cat140006";

const opciones = {
  method: "GET",
  headers: {
    "x-rapidapi-key": API_KEY,
    "x-rapidapi-host": API_HOST,
  },
};

// Referencias a elementos HTML
const listadoProductos = document.getElementById("listadoProductos");
const mensajeListado = document.getElementById("mensajeListado");
const detalleProducto = document.getElementById("detalleProducto");
const mensajeDetalle = document.getElementById("mensajeDetalle");

// Funcion generica para consultar la API con async/await
const consultarApi = async function (endpoint) {
  const respuesta = await fetch(`${URL_BASE}${endpoint}`, opciones);

  if (respuesta.status == 401 || respuesta.status == 403) {
    throw new Error("La llave de la API no es válida o no está suscrita al plan.");
  }
  if (respuesta.status == 429) {
    throw new Error("Se alcanzó el límite de solicitudes de la API. Intente más tarde.");
  }
  if (!respuesta.ok) {
    throw new Error(`La API respondió con el error ${respuesta.status}.`);
  }

  return await respuesta.json();
};

// Muestra un mensaje de carga, informativo o de error
const mostrarMensaje = function (elemento, texto, esError = false) {
  elemento.textContent = texto;
  elemento.className = esError ? "mensaje error" : "mensaje";
};

// Elimina todos los hijos de un elemento
const limpiarElemento = function (elemento) {
  while (elemento.hasChildNodes()) {
    elemento.removeChild(elemento.firstChild);
  }
};

// Convierte el HTML de la descripcion a texto plano
const htmlATexto = function (html) {
  if (!html) {
    return "";
  }
  const documento = new DOMParser().parseFromString(html.replace(/<br\s*\/?>/gi, "\n"), "text/html");
  return documento.body.textContent.trim();
};

// Crea un parrafo con el precio (y precio anterior si esta en oferta)
const crearPrecio = function (precioLista, precioOferta) {
  const precio = document.createElement("p");
  precio.setAttribute("class", "precio");

  if (precioOferta) {
    precio.textContent = precioOferta;
    const anterior = document.createElement("span");
    anterior.setAttribute("class", "precio-anterior");
    anterior.textContent = precioLista;
    precio.appendChild(anterior);
  } else {
    precio.textContent = precioLista;
  }
  return precio;
};

// Panel de detalle: oculto al inicio, se muestra al elegir un producto
const contenedorPrincipal = document.querySelector("main");
const panelDetalle = document.querySelector(".panel-detalle");

const abrirPanelDetalle = function () {
  contenedorPrincipal.classList.add("con-detalle");
  panelDetalle.classList.add("visible");
};

const cerrarPanelDetalle = function () {
  contenedorPrincipal.classList.remove("con-detalle");
  panelDetalle.classList.remove("visible");
  limpiarElemento(detalleProducto);
  mostrarMensaje(mensajeDetalle, "");
  const activa = document.querySelector(".tarjeta.seleccionada");
  if (activa) {
    activa.classList.remove("seleccionada");
  }
};

// Boton para cerrar el detalle del producto
const botonCerrar = document.createElement("button");
botonCerrar.setAttribute("type", "button");
botonCerrar.setAttribute("class", "boton-cerrar");
botonCerrar.setAttribute("aria-label", "Cerrar detalle");
botonCerrar.textContent = "✕";
botonCerrar.addEventListener("click", cerrarPanelDetalle);
panelDetalle.appendChild(botonCerrar);

// ENDPOINT 1: Listado de productos (us/products/v2/list)
const cargarProductos = async function () {
  if (API_KEY == "") {
    mostrarMensaje(mensajeListado, "Falta agregar la llave de RapidAPI en js/app.js.", true);
    return;
  }

  mostrarMensaje(mensajeListado, "Cargando productos de maquillaje...");

  try {
    const datos = await consultarApi(
      `/us/products/v2/list?categoryId=${CATEGORIA_MAQUILLAJE}&pageSize=30&currentPage=1&loc=en-US`
    );
    const productos = datos.products || [];

    if (productos.length == 0) {
      mostrarMensaje(mensajeListado, "No se encontraron productos en esta categoría.");
      return;
    }

    for (const producto of productos) {
      const sku = producto.currentSku;

      const tarjeta = document.createElement("div");
      tarjeta.setAttribute("class", "tarjeta");

      const imagen = document.createElement("img");
      imagen.setAttribute("src", producto.heroImage);
      imagen.setAttribute("alt", sku.imageAltText || producto.displayName);
      imagen.setAttribute("loading", "lazy");

      const marca = document.createElement("p");
      marca.setAttribute("class", "marca");
      marca.textContent = producto.brandName;

      const nombre = document.createElement("p");
      nombre.setAttribute("class", "nombre");
      nombre.textContent = producto.displayName;

      tarjeta.appendChild(imagen);
      tarjeta.appendChild(marca);
      tarjeta.appendChild(nombre);
      tarjeta.appendChild(crearPrecio(sku.listPrice, sku.salePrice));

      // Al seleccionar un producto se consulta su detalle sin recargar la pagina
      tarjeta.addEventListener("click", () => {
        const anterior = document.querySelector(".tarjeta.seleccionada");
        if (anterior) {
          anterior.classList.remove("seleccionada");
        }
        tarjeta.classList.add("seleccionada");
        abrirPanelDetalle();
        cargarDetalle(producto.productId, sku.skuId);
      });

      listadoProductos.appendChild(tarjeta);
    }

    mostrarMensaje(mensajeListado, `Mostrando ${productos.length} productos.`);
  } catch (error) {
    console.error(error);
    mostrarMensaje(mensajeListado, `No se pudieron cargar los productos. ${error.message}`, true);
  }
};

// ENDPOINT 2: Detalle de un producto (us/products/v2/detail)
const cargarDetalle = async function (productId, skuId) {
  limpiarElemento(detalleProducto);
  mostrarMensaje(mensajeDetalle, "Cargando detalle del producto...");

  try {
    const datos = await consultarApi(
      `/us/products/v2/detail?productId=${productId}&preferedSku=${skuId}&loc=en-US`
    );
    const sku = datos.currentSku;
    const detalles = datos.productDetails;

    // Imagen principal
    const imagenPrincipal = document.createElement("img");
    imagenPrincipal.setAttribute("class", "imagen-principal");
    imagenPrincipal.setAttribute("src", sku.skuImages.imageUrl);
    imagenPrincipal.setAttribute("alt", detalles.displayName);
    detalleProducto.appendChild(imagenPrincipal);

    // Galeria de imagenes adicionales
    if (sku.alternateImages && sku.alternateImages.length > 0) {
      const galeria = document.createElement("div");
      galeria.setAttribute("class", "galeria");
      for (const imagen of sku.alternateImages) {
        const miniatura = document.createElement("img");
        miniatura.setAttribute("src", imagen.image250);
        miniatura.setAttribute("alt", imagen.altText);
        miniatura.addEventListener("click", () => {
          imagenPrincipal.setAttribute("src", imagen.imageUrl);
        });
        galeria.appendChild(miniatura);
      }
      detalleProducto.appendChild(galeria);
    }

    // Marca, nombre y precio
    const marca = document.createElement("p");
    marca.setAttribute("class", "marca");
    marca.textContent = detalles.brand.displayName;

    const nombre = document.createElement("h3");
    nombre.textContent = detalles.displayName;

    detalleProducto.appendChild(marca);
    detalleProducto.appendChild(nombre);
    detalleProducto.appendChild(crearPrecio(sku.listPrice, sku.salePrice));

    // Etiquetas
    const etiquetas = document.createElement("div");
    const listaEtiquetas = [];
    if (sku.isNew) listaEtiquetas.push("Nuevo");
    if (sku.isSephoraExclusive) listaEtiquetas.push("Exclusivo Sephora");
    if (sku.isLimitedEdition) listaEtiquetas.push("Edición limitada");
    if (sku.isOutOfStock) listaEtiquetas.push("Agotado");
    for (const texto of listaEtiquetas) {
      const etiqueta = document.createElement("span");
      etiqueta.setAttribute("class", "etiqueta");
      etiqueta.textContent = texto;
      etiquetas.appendChild(etiqueta);
    }
    detalleProducto.appendChild(etiquetas);

    // Datos del producto
    const lista = document.createElement("ul");
    lista.setAttribute("class", "datos");
    const informacion = [
      `⭐ Calificación: ${Number(detalles.rating).toFixed(1)} / 5 (${detalles.reviews} reseñas)`,
      `💗 Loves: ${detalles.lovesCount}`,
      `🏷️ Categoría: ${datos.parentCategory ? datos.parentCategory.displayName : "Maquillaje"}`,
    ];
    for (const dato of informacion) {
      const item = document.createElement("li");
      item.textContent = dato;
      lista.appendChild(item);
    }
    detalleProducto.appendChild(lista);

    // Descripcion
    const tituloDescripcion = document.createElement("h4");
    tituloDescripcion.textContent = "Descripción";
    const descripcion = document.createElement("p");
    descripcion.setAttribute("class", "descripcion");
    descripcion.textContent =
      htmlATexto(detalles.longDescription) || detalles.quickLookDescription || "Sin descripción.";
    detalleProducto.appendChild(tituloDescripcion);
    detalleProducto.appendChild(descripcion);

    // Modo de uso
    if (detalles.suggestedUsage) {
      const tituloUso = document.createElement("h4");
      tituloUso.textContent = "Modo de uso";
      const uso = document.createElement("p");
      uso.setAttribute("class", "descripcion");
      uso.textContent = htmlATexto(detalles.suggestedUsage);
      detalleProducto.appendChild(tituloUso);
      detalleProducto.appendChild(uso);
    }

    // Enlace a Sephora
    const enlace = document.createElement("a");
    enlace.setAttribute("class", "boton");
    enlace.setAttribute("href", datos.fullSiteProductUrl);
    enlace.setAttribute("target", "_blank");
    enlace.textContent = "Ver en Sephora";
    detalleProducto.appendChild(enlace);

    mostrarMensaje(mensajeDetalle, "");
  } catch (error) {
    console.error(error);
    mostrarMensaje(mensajeDetalle, `No se pudo cargar el detalle del producto. ${error.message}`, true);
  }
};

// Iniciando la aplicacion
cargarProductos();
