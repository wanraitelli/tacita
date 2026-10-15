/* =========================================================
   tacita · main.js
   1. Datos de los productos
   2. Utilidades (precios y carrito guardado en el navegador)
   3. Menú mobile
   4. Agregar al carrito (botones "+")
   5. Filtros del estante
   6. Página de producto
   7. Página del carrito
   8. Checkout
   9. Confirmación
   10. Formularios (contacto y newsletter)
   11. Video del hero
   ========================================================= */


/* ---------- 1. Datos de los productos ---------- */
// Cada producto tiene un id que se usa en el HTML (data-agregar="etiopia")
// y en la URL de la página de producto (producto.html?id=etiopia).
const PRODUCTOS = [
  {
    id: "etiopia",
    nombre: "Etiopía Guji",
    detalle: "lavado · 250 g",
    precio: 20000,
    categoria: "café",
    imagen: "img/cafe-etiopia.jpg",
    sticker: "café del mes",
    descripcion: "Floral y jugoso, ideal para filtro. Si te gusta el té, este es para vos.",
    notas: ["durazno", "jazmín", "té negro"],
    galeria: ["img/cafe-etiopia.jpg", "img/barista-filtro.jpg", "img/estante-2.jpg"]
  },
  { id: "colombia", nombre: "Colombia Huila", detalle: "lavado · 250 g", precio: 20000, categoria: "café", imagen: "img/cafe-colombia.jpg" },
  { id: "brasil", nombre: "Brasil Cerrado", detalle: "natural · 250 g", precio: 20000, categoria: "café", imagen: "img/cafe-brasil.jpg" },
  { id: "taza", nombre: "Taza tacita", detalle: "cerámica · 250 ml", precio: 15000, categoria: "merch", imagen: "img/taza.jpg", sticker: "nuevo" },
  { id: "tote", nombre: "Tote \"una tacita\"", detalle: "algodón", precio: 10000, categoria: "merch", imagen: "img/tote.jpg" },
  { id: "remera", nombre: "Remera tacita", detalle: "algodón", precio: 30000, categoria: "merch", imagen: "img/remera.jpg" },
  { id: "no-strokes", nombre: "No strokes", detalle: "Emma Dibujitos", precio: 30000, categoria: "libros", imagen: "img/libro-no-strokes.jpg", sticker: "último" },
  { id: "rodeado", nombre: "rodeado de cosas", detalle: "Juan Pincel", precio: 30000, categoria: "libros", imagen: "img/libro-rodeado-de-cosas.jpg" },
  // El precio de los stickers no estaba definido en el mockup: cambialo acá.
  { id: "stickers", nombre: "Stickers tacita", detalle: "pack x5", precio: 5000, categoria: "merch", imagen: "img/stickers.jpg", sticker: "nuevo" }
];

// Costo del envío a domicilio en CABA (el retiro en el local es gratis).
const COSTO_ENVIO = 3500;


/* ---------- 2. Utilidades ---------- */

// Busca un producto por su id
function buscarProducto(id) {
  return PRODUCTOS.find(function (p) { return p.id === id; });
}

// 20000 → "$ 20.000"
function formatearPrecio(numero) {
  return "$ " + numero.toLocaleString("es-AR");
}

// El carrito se guarda en el navegador (localStorage), así no se pierde
// al cambiar de página. Es una lista como: [{ id: "etiopia", cantidad: 2 }]
function leerCarrito() {
  try {
    return JSON.parse(localStorage.getItem("tacita-carrito")) || [];
  } catch (error) {
    return [];
  }
}

function guardarCarrito(carrito) {
  try {
    localStorage.setItem("tacita-carrito", JSON.stringify(carrito));
  } catch (error) {
    // Si el navegador no deja guardar, el sitio sigue funcionando igual.
  }
  actualizarContador();
}

// Actualiza el número del botón del carrito en el header
function actualizarContador() {
  const total = leerCarrito().reduce(function (suma, item) { return suma + item.cantidad; }, 0);
  document.querySelectorAll(".carrito-contador").forEach(function (contador) {
    contador.textContent = total;
  });
}

function agregarAlCarrito(id, cantidad) {
  const carrito = leerCarrito();
  const existente = carrito.find(function (item) { return item.id === id; });
  if (existente) {
    existente.cantidad += cantidad;
  } else {
    carrito.push({ id: id, cantidad: cantidad });
  }
  guardarCarrito(carrito);
  const producto = buscarProducto(id);
  mostrarAviso(producto.nombre + " está en tu carrito");
}

// Cartelito que aparece abajo unos segundos
function mostrarAviso(texto) {
  let aviso = document.querySelector(".aviso-flotante");
  if (!aviso) {
    aviso = document.createElement("div");
    aviso.className = "aviso-flotante";
    aviso.setAttribute("role", "status");
    document.body.appendChild(aviso);
  }
  aviso.textContent = texto;
  aviso.classList.add("visible");
  clearTimeout(aviso.temporizador);
  aviso.temporizador = setTimeout(function () {
    aviso.classList.remove("visible");
  }, 2500);
}

actualizarContador();


/* ---------- 3. Menú mobile ---------- */
const botonMenu = document.querySelector(".btn-menu");
const menu = document.querySelector(".header__menu");

if (botonMenu && menu) {
  botonMenu.addEventListener("click", function () {
    const abierto = menu.classList.toggle("abierto");
    botonMenu.setAttribute("aria-expanded", abierto);
    botonMenu.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
  });
}


/* ---------- 4. Agregar al carrito (botones "+" de las cards) ---------- */
document.querySelectorAll("[data-agregar]").forEach(function (boton) {
  boton.addEventListener("click", function () {
    agregarAlCarrito(boton.dataset.agregar, 1);
  });
});


/* ---------- 5. Filtros del estante ---------- */
const filtros = document.querySelectorAll("[data-filtro]");

filtros.forEach(function (filtro) {
  filtro.addEventListener("click", function () {
    const categoria = filtro.dataset.filtro;
    let visibles = 0;

    // Marca el filtro activo
    filtros.forEach(function (f) {
      f.classList.toggle("activo", f === filtro);
      f.setAttribute("aria-pressed", f === filtro);
    });

    // Muestra solo las cards de esa categoría
    document.querySelectorAll("[data-categoria]").forEach(function (card) {
      const mostrar = categoria === "todo" || card.dataset.categoria === categoria;
      card.hidden = !mostrar;
      if (mostrar) visibles++;
    });

    document.getElementById("cantidad-productos").textContent = visibles + " productos";
  });
});


/* ---------- 6. Página de producto ---------- */
// Una sola página (producto.html) sirve para todos los productos:
// lee el id de la URL y completa los datos.
const ficha = document.getElementById("ficha");

if (ficha) {
  const parametros = new URLSearchParams(window.location.search);
  const producto = buscarProducto(parametros.get("id")) || PRODUCTOS[0];
  let cantidad = 1;

  document.title = producto.nombre + " · tacita";
  document.getElementById("ficha-nombre").textContent = producto.nombre;
  document.getElementById("ficha-precio").textContent = formatearPrecio(producto.precio);
  document.getElementById("ficha-etiqueta").textContent = producto.categoria + " · " + producto.detalle;
  document.getElementById("migas-categoria").textContent = producto.categoria;
  document.getElementById("migas-nombre").textContent = producto.nombre;

  const fotoPrincipal = document.getElementById("ficha-foto");
  fotoPrincipal.src = producto.imagen;
  fotoPrincipal.alt = producto.nombre;

  // Sticker (café del mes, nuevo, último)
  const sticker = document.getElementById("ficha-sticker");
  if (producto.sticker) {
    sticker.textContent = producto.sticker;
  } else {
    sticker.remove();
  }

  // Descripción y notas: solo si el producto las tiene
  const descripcion = document.getElementById("ficha-descripcion");
  if (producto.descripcion) {
    descripcion.textContent = producto.descripcion;
  } else {
    descripcion.remove();
  }

  const notas = document.getElementById("ficha-notas");
  if (producto.notas) {
    notas.querySelector(".chips").innerHTML = producto.notas.map(function (nota) {
      return '<span class="chip chip--nota">' + nota + "</span>";
    }).join("");
  } else {
    notas.remove();
  }

  // La molienda solo aplica al café
  const molienda = document.getElementById("ficha-molienda");
  if (producto.categoria !== "café") {
    molienda.remove();
  } else {
    molienda.querySelectorAll(".chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        molienda.querySelectorAll(".chip").forEach(function (c) {
          c.classList.toggle("activo", c === chip);
          c.setAttribute("aria-pressed", c === chip);
        });
      });
    });
  }

  // Galería: al tocar una miniatura cambia la foto grande
  const miniaturas = document.getElementById("ficha-miniaturas");
  if (producto.galeria) {
    miniaturas.innerHTML = producto.galeria.map(function (src, i) {
      return '<button type="button" class="' + (i === 0 ? "activo" : "") + '" aria-label="Ver foto ' + (i + 1) + '">' +
        '<img src="' + src + '" alt=""></button>';
    }).join("");
    miniaturas.querySelectorAll("button").forEach(function (boton, i) {
      boton.addEventListener("click", function () {
        fotoPrincipal.src = producto.galeria[i];
        miniaturas.querySelectorAll("button").forEach(function (b) {
          b.classList.toggle("activo", b === boton);
        });
      });
    });
  } else {
    miniaturas.remove();
  }

  // Cantidad: – 1 +
  const numero = document.getElementById("ficha-cantidad");
  document.getElementById("ficha-menos").addEventListener("click", function () {
    if (cantidad > 1) cantidad--;
    numero.textContent = cantidad;
  });
  document.getElementById("ficha-mas").addEventListener("click", function () {
    cantidad++;
    numero.textContent = cantidad;
  });

  document.getElementById("ficha-agregar").addEventListener("click", function () {
    agregarAlCarrito(producto.id, cantidad);
  });
}


/* ---------- 7. Página del carrito ---------- */
const listaCarrito = document.getElementById("lista-carrito");

function dibujarCarrito() {
  const carrito = leerCarrito();
  const contenido = document.getElementById("carrito-contenido");
  const vacio = document.getElementById("carrito-vacio");

  // Carrito vacío
  if (carrito.length === 0) {
    contenido.hidden = true;
    vacio.hidden = false;
    document.getElementById("carrito-cantidad").textContent = "0 productos";
    return;
  }

  contenido.hidden = false;
  vacio.hidden = true;

  let subtotal = 0;
  let unidades = 0;

  listaCarrito.innerHTML = carrito.map(function (item) {
    const p = buscarProducto(item.id);
    subtotal += p.precio * item.cantidad;
    unidades += item.cantidad;
    return (
      '<li class="item">' +
        '<img src="' + p.imagen + '" alt="">' +
        "<div>" +
          '<h3 class="serif">' + p.nombre + "</h3>" +
          '<p class="texto-chico suave">' + p.detalle + "</p>" +
          '<button class="link-quitar" data-quitar="' + p.id + '">Quitar</button>' +
        "</div>" +
        '<div class="cantidad">' +
          '<button data-restar="' + p.id + '" aria-label="Restar uno">–</button>' +
          "<span>" + item.cantidad + "</span>" +
          '<button data-sumar="' + p.id + '" aria-label="Sumar uno">+</button>' +
        "</div>" +
        '<p class="precio">' + formatearPrecio(p.precio * item.cantidad) + "</p>" +
      "</li>"
    );
  }).join("");

  document.getElementById("carrito-cantidad").textContent = unidades + (unidades === 1 ? " producto" : " productos");
  document.getElementById("carrito-subtotal").textContent = formatearPrecio(subtotal);
  document.getElementById("carrito-total").textContent = formatearPrecio(subtotal);
}

// Cambia la cantidad de un producto (y lo saca si llega a 0)
function cambiarCantidad(id, cambio) {
  const carrito = leerCarrito()
    .map(function (item) {
      if (item.id === id) item.cantidad += cambio;
      return item;
    })
    .filter(function (item) { return item.cantidad > 0; });
  guardarCarrito(carrito);
  dibujarCarrito();
}

if (listaCarrito) {
  dibujarCarrito();

  // Un solo "escuchador" para todos los botones de la lista
  listaCarrito.addEventListener("click", function (evento) {
    const boton = evento.target.closest("button");
    if (!boton) return;
    if (boton.dataset.sumar) cambiarCantidad(boton.dataset.sumar, 1);
    if (boton.dataset.restar) cambiarCantidad(boton.dataset.restar, -1);
    if (boton.dataset.quitar) cambiarCantidad(boton.dataset.quitar, -Infinity);
  });

  // Los "+" de "sumale algo" también redibujan la lista
  document.querySelectorAll("[data-agregar]").forEach(function (boton) {
    boton.addEventListener("click", dibujarCarrito);
  });
}


/* ---------- 8. Checkout ---------- */
const formCheckout = document.getElementById("form-checkout");

if (formCheckout) {
  const carrito = leerCarrito();
  const listaPedido = document.getElementById("pedido-lista");
  const direccion = document.getElementById("direccion");
  let entrega = "envio";
  let subtotal = 0;

  if (carrito.length === 0) {
    document.getElementById("checkout-contenido").hidden = true;
    document.getElementById("checkout-vacio").hidden = false;
  }

  // Resumen del pedido
  listaPedido.innerHTML = carrito.map(function (item) {
    const p = buscarProducto(item.id);
    subtotal += p.precio * item.cantidad;
    return (
      '<li class="pedido-item">' +
        '<img src="' + p.imagen + '" alt="">' +
        "<div><strong>" + p.nombre + (item.cantidad > 1 ? " × " + item.cantidad : "") + "</strong>" +
        '<p class="texto-chico suave">' + p.detalle + "</p></div>" +
        "<span>" + formatearPrecio(p.precio * item.cantidad) + "</span>" +
      "</li>"
    );
  }).join("");

  function actualizarTotales() {
    const envio = entrega === "envio" ? COSTO_ENVIO : 0;
    document.getElementById("pedido-subtotal").textContent = formatearPrecio(subtotal);
    document.getElementById("pedido-envio").textContent = envio === 0 ? "gratis" : formatearPrecio(envio);
    document.getElementById("pedido-total").textContent = formatearPrecio(subtotal + envio);
  }

  // Retiro en el local / Envío a domicilio
  document.querySelectorAll("[data-entrega]").forEach(function (boton) {
    boton.addEventListener("click", function () {
      entrega = boton.dataset.entrega;
      document.querySelectorAll("[data-entrega]").forEach(function (b) {
        b.classList.toggle("activo", b === boton);
        b.setAttribute("aria-pressed", b === boton);
      });
      // Con retiro no hace falta la dirección
      const conEnvio = entrega === "envio";
      direccion.hidden = !conEnvio;
      direccion.querySelectorAll("[data-obligatorio]").forEach(function (campo) {
        campo.required = conEnvio;
      });
      actualizarTotales();
    });
  });

  actualizarTotales();

  // Al confirmar: guardamos un número de pedido, vaciamos el carrito
  // y vamos a la página de confirmación.
  formCheckout.addEventListener("submit", function (evento) {
    evento.preventDefault();
    const numeroPedido = Math.floor(1000 + Math.random() * 9000);
    try {
      localStorage.setItem("tacita-pedido", JSON.stringify({ numero: numeroPedido, entrega: entrega }));
    } catch (error) {}
    guardarCarrito([]);
    window.location.href = "confirmacion.html";
  });
}


/* ---------- 9. Confirmación ---------- */
const numeroConfirmacion = document.getElementById("numero-pedido");

if (numeroConfirmacion) {
  try {
    const pedido = JSON.parse(localStorage.getItem("tacita-pedido"));
    if (pedido) numeroConfirmacion.textContent = "#" + pedido.numero;
  } catch (error) {}
}


/* ---------- 10. Formularios (contacto y newsletter) ---------- */
// No hay servidor, así que solo mostramos un mensaje de que se envió.
document.querySelectorAll("[data-formulario]").forEach(function (form) {
  form.addEventListener("submit", function (evento) {
    evento.preventDefault();
    const mensaje = form.parentElement.querySelector(".mensaje-ok");
    mensaje.hidden = false;
    form.reset();
  });
});


/* ---------- 11. Video del hero ---------- */
// El video arranca solo, sin sonido y en loop. El botón lo pausa o lo vuelve a reproducir.
// Si la persona pidió "reducir movimiento" en su sistema, el video arranca pausado.
const videoHero = document.getElementById("video-hero");
const botonVideo = document.getElementById("btn-video");

if (videoHero && botonVideo) {
  function actualizarBotonVideo() {
    const pausado = videoHero.paused;
    botonVideo.textContent = pausado ? "Play" : "Pausa";
    botonVideo.setAttribute("aria-label", pausado ? "Reproducir video" : "Pausar video");
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    videoHero.pause();
  }

  botonVideo.addEventListener("click", function () {
    if (videoHero.paused) {
      videoHero.play();
    } else {
      videoHero.pause();
    }
  });

  // Si el archivo de video no carga, queda la foto y escondemos el botón
  videoHero.querySelector("source").addEventListener("error", function () {
    botonVideo.hidden = true;
  });

  videoHero.addEventListener("play", actualizarBotonVideo);
  videoHero.addEventListener("pause", actualizarBotonVideo);
  actualizarBotonVideo();
}
