/* ==================================================
   UI.JS
   Manejo de interfaz (render, animaciones, UI)
   Totalmente desacoplado de la lógica de negocio
   
   🆕 SOPORTE PARA PRODUCTOS VARIABLES
================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initSlider();
  let maxProductStock = 1;
  loadProductDetail();
  initComments();
  initSupportForm();
});

/* ==================================================
   SLIDER AUTOMÁTICO
================================================== */
function initSlider() {
  const slides = document.querySelectorAll(".slide");
  if (!slides.length) return;

  let index = 0;

  setInterval(() => {
    slides[index].classList.remove("active");
    index = (index + 1) % slides.length;
    slides[index].classList.add("active");
  }, 4000);
}

/* ==================================================
   🆕 VARIABLES GLOBALES PARA PRODUCTOS VARIABLES
================================================== */
let currentProduct = null;
let selectedVariation = {
  color: null,
  size: null,
  design: null
};
let maxProductStock = 1;

/* ==================================================
   PRODUCTO INDIVIDUAL
================================================== */
function loadProductDetail() {
  const container = document.getElementById("productDetail");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("id");
  const product = products.find(p => p.slug === slug);

  if (!product) {
    container.innerHTML = "<p>Producto no encontrado</p>";
    return;
  }

  // 🔹 Guardar producto actual
  currentProduct = product;

  const isDigital = product.type === "digital";
  const isVariable = product.isVariable === true;
  
  // 🔹 Para productos NO variables, usar stock directo
  if (!isVariable) {
    maxProductStock = product.stock || 1;
  }

  container.innerHTML = `
    <div class="product-detail-grid">

      <div class="product-media">
        <div class="main-image zoom-container">
          <img id="mainProductImage" src="${getImage(product.images[0])}">
        </div>

        <div class="thumbnail-list" id="thumbnailList"></div>

        ${product.video ? `
          <div class="video-wrapper">
            <iframe 
              src="${product.video}"
              frameborder="0"
              allowfullscreen>
            </iframe>
          </div>
        ` : ""}
      </div>

      <div class="product-info-detail">
        <h2>${product.name}</h2>
        <div class="product-categories">
          ${renderCategories(product.category)}
        </div>
        <div class="rating-stars">⭐ ${product.rating}</div>
        
        ${isVariable ? `
          <!-- PRECIO DINÁMICO PARA VARIABLES -->
          <div class="price" id="productPrice">Selecciona opciones</div>
        ` : `
          <!-- PRECIO FIJO PARA NO VARIABLES -->
          <div class="price">$${product.price.toLocaleString("es-CO")}</div>
        `}

        ${isDigital ? `
          <div class="digital-info">
            <i class="fa-solid fa-cloud-arrow-down"></i>
            <strong>Descarga inmediata después de la compra</strong>
          </div>
        ` : isVariable ? `
          <!-- STOCK DINÁMICO PARA VARIABLES -->
          <p class="stock" id="productStock">Selecciona opciones para ver disponibilidad</p>
        ` : `
          <!-- STOCK FIJO PARA NO VARIABLES -->
          <p class="stock">Stock disponible: ${product.stock}</p>
        `}

        <div class="product-description">
          ${renderDescription(product.description)}
        </div>

        ${renderContactButtons(product.contact)}

        ${renderSpecs(product.specs)}

        ${isVariable ? renderVariationSelectors(product) : ""}

        ${isDigital ? "" : isVariable ? `
          <!-- SELECTOR DE CANTIDAD PARA VARIABLES -->
          <div class="quantity-selector" id="quantitySelector" style="display: none;">
            <button onclick="changeQty(-1)">−</button>
            <input 
              type="number" 
              id="qty" 
              value="1" 
              min="1" 
              max="1">
            <button onclick="changeQty(1)">+</button>
          </div>
        ` : `
          <!-- SELECTOR DE CANTIDAD PARA NO VARIABLES -->
          <div class="quantity-selector">
            <button onclick="changeQty(-1)">−</button>
            <input 
              type="number" 
              id="qty" 
              value="1" 
              min="1" 
              max="${product.stock}">
            <button onclick="changeQty(1)">+</button>
          </div>
        `}

        <button class="add-cart-btn" id="addToCartBtn" onclick="${isVariable ? 'addVariableProductToCart()' : `addProductFromDetail(${product.id}, ${isDigital})`}">
          ${isDigital ? "Comprar y descargar" : isVariable ? "Selecciona opciones" : "Añadir al carrito"}
        </button>
        
        <!-- COMPARTIR PRODUCTO -->
        <div class="share-product">
          <p>Comparte este producto:</p>

          <div class="a2a_kit a2a_kit_size_32 a2a_default_style">
            <a class="a2a_button_facebook"></a>
            <a class="a2a_button_linkedin"></a>
            <a class="a2a_button_whatsapp"></a>
            <a class="a2a_button_email"></a>
          </div>
        </div>
        <a href="index.html" class="back-link">
          <i class="fa-solid fa-arrow-left"></i>
          Volver
        </a>
      </div>

    </div>
  `;

  renderThumbnails(product.images);
  initImageZoom();
  renderProductNavigation(product.slug);
  initSpecsToggle();
  initShareButtons();

  // 🔹 Inicializar selectores de variaciones
  if (isVariable) {
    initVariationSelectors();
  }
}  

/* ==================================================
   🆕 RENDERIZAR SELECTORES DE VARIACIONES
================================================== */
function renderVariationSelectors(product) {
  if (!product.variations || !product.variations.length) {
    return "";
  }

  // Detectar qué atributos tiene el producto
  const hasColor = product.variations.some(v => v.color);
  const hasSize = product.variations.some(v => v.size);
  const hasDesign = product.variations.some(v => v.design);

  return `
    <div class="variation-selectors">
      ${hasColor ? `
        <div class="variation-group">
          <label>Color:</label>
          <div class="variation-options" id="colorOptions">
            <!-- Se renderiza dinámicamente -->
          </div>
        </div>
      ` : ""}

      ${hasSize ? `
        <div class="variation-group" id="sizeGroup" style="display: none;">
          <label>Talla:</label>
          <div class="variation-options" id="sizeOptions">
            <!-- Se renderiza dinámicamente -->
          </div>
        </div>
      ` : ""}

      ${hasDesign ? `
        <div class="variation-group" id="designGroup" style="display: none;">
          <label>Diseño:</label>
          <div class="variation-options" id="designOptions">
            <!-- Se renderiza dinámicamente -->
          </div>
        </div>
      ` : ""}
    </div>
  `;
}

/* ==================================================
   🆕 INICIALIZAR SELECTORES DE VARIACIONES
================================================== */
function initVariationSelectors() {
  if (!currentProduct || !currentProduct.isVariable) return;

  // Renderizar colores disponibles
  renderColorOptions();
}

/* ==================================================
   🆕 RENDERIZAR OPCIONES DE COLOR
================================================== */
function renderColorOptions() {
  const container = document.getElementById("colorOptions");
  if (!container) return;

  // Obtener colores únicos
  const colors = [...new Set(currentProduct.variations.map(v => v.color))];

  container.innerHTML = "";

  colors.forEach(color => {
    const btn = document.createElement("button");
    btn.className = "variation-option";
    btn.textContent = color;
    btn.onclick = () => selectColor(color);
    container.appendChild(btn);
  });
}

/* ==================================================
   🆕 SELECCIONAR COLOR
================================================== */
function selectColor(color) {
  selectedVariation.color = color;
  selectedVariation.size = null;
  selectedVariation.design = null;

  // Actualizar UI de color
  document.querySelectorAll("#colorOptions .variation-option").forEach(btn => {
    btn.classList.toggle("active", btn.textContent === color);
  });

  // Actualizar imágenes según el color
  updateImagesForVariation();

  // Verificar si hay diseños disponibles para este color
  const hasDesigns = currentProduct.variations.some(
    v => v.color === color && v.design
  );

  if (hasDesigns) {
    // Mostrar selector de diseño
    renderDesignOptions(color);
    document.getElementById("designGroup")?.style.removeProperty("display");
    document.getElementById("sizeGroup").style.display = "none";
  } else {
    // No hay diseños, mostrar tallas directamente
    document.getElementById("designGroup")?.style.setProperty("display", "none");
    renderSizeOptions(color, null);
    document.getElementById("sizeGroup")?.style.removeProperty("display");
  }

  // Reset precio y stock
  updatePriceAndStock();
}

/* ==================================================
   🆕 RENDERIZAR OPCIONES DE DISEÑO
================================================== */
function renderDesignOptions(color) {
  const container = document.getElementById("designOptions");
  if (!container) return;

  // Obtener diseños únicos para este color
  const designs = [...new Set(
    currentProduct.variations
      .filter(v => v.color === color && v.design)
      .map(v => v.design)
  )];

  container.innerHTML = "";

  designs.forEach(design => {
    const btn = document.createElement("button");
    btn.className = "variation-option";
    btn.textContent = design;
    btn.onclick = () => selectDesign(design);
    container.appendChild(btn);
  });
}

/* ==================================================
   🆕 SELECCIONAR DISEÑO
================================================== */
function selectDesign(design) {
  selectedVariation.design = design;
  selectedVariation.size = null;

  // Actualizar UI de diseño
  document.querySelectorAll("#designOptions .variation-option").forEach(btn => {
    btn.classList.toggle("active", btn.textContent === design);
  });

  // Actualizar imágenes según diseño
  updateImagesForVariation();

  // Mostrar tallas
  renderSizeOptions(selectedVariation.color, design);
  document.getElementById("sizeGroup")?.style.removeProperty("display");

  // Reset precio y stock
  updatePriceAndStock();
}

/* ==================================================
   🆕 RENDERIZAR OPCIONES DE TALLA
================================================== */
function renderSizeOptions(color, design) {
  const container = document.getElementById("sizeOptions");
  if (!container) return;

  // Filtrar variaciones por color y diseño (si aplica)
  const variations = currentProduct.variations.filter(v => {
    const matchColor = v.color === color;
    const matchDesign = design ? v.design === design : true;
    return matchColor && matchDesign;
  });

  // Obtener tallas únicas
  const sizes = [...new Set(variations.map(v => v.size))];

  container.innerHTML = "";

  sizes.forEach(size => {
    // Verificar si hay stock para esta talla
    const variation = variations.find(v => v.size === size);
    const hasStock = variation && variation.stock > 0;

    const btn = document.createElement("button");
    btn.className = "variation-option";
    btn.textContent = size;
    btn.disabled = !hasStock;
    
    if (!hasStock) {
      btn.classList.add("out-of-stock");
      btn.title = "Sin stock";
    }

    btn.onclick = () => selectSize(size);
    container.appendChild(btn);
  });
}

/* ==================================================
   🆕 SELECCIONAR TALLA
================================================== */
function selectSize(size) {
  selectedVariation.size = size;

  // Actualizar UI de talla
  document.querySelectorAll("#sizeOptions .variation-option").forEach(btn => {
    btn.classList.toggle("active", btn.textContent === size);
  });

  // Actualizar precio y stock
  updatePriceAndStock();

  // Habilitar botón de añadir al carrito
  const addBtn = document.getElementById("addToCartBtn");
  if (addBtn) {
    addBtn.disabled = false;
    addBtn.textContent = "Añadir al carrito";
  }

  // Mostrar selector de cantidad
  const qtySelector = document.getElementById("quantitySelector");
  if (qtySelector) {
    qtySelector.style.removeProperty("display");
  }
}

/* ==================================================
   🆕 ACTUALIZAR IMÁGENES SEGÚN VARIACIÓN
================================================== */
function updateImagesForVariation() {
  // Buscar la primera variación que coincida con la selección actual
  const variation = currentProduct.variations.find(v => {
    const matchColor = v.color === selectedVariation.color;
    const matchDesign = selectedVariation.design 
      ? v.design === selectedVariation.design 
      : true;
    return matchColor && matchDesign;
  });

  if (variation && variation.images && variation.images.length > 0) {
    // Actualizar imagen principal
    const mainImg = document.getElementById("mainProductImage");
    if (mainImg) {
      mainImg.src = getImage(variation.images[0]);
      mainImg.style.transform = "scale(1) translate(0,0)";
    }

    // Actualizar miniaturas
    renderThumbnails(variation.images);
  }
}

/* ==================================================
   🆕 ACTUALIZAR PRECIO Y STOCK
================================================== */
function updatePriceAndStock() {
  const priceEl = document.getElementById("productPrice");
  const stockEl = document.getElementById("productStock");
  const qtyInput = document.getElementById("qty");

  // Buscar la variación exacta
  const variation = currentProduct.variations.find(v => {
    const matchColor = v.color === selectedVariation.color;
    const matchSize = v.size === selectedVariation.size;
    const matchDesign = selectedVariation.design 
      ? v.design === selectedVariation.design 
      : true;
    return matchColor && matchSize && matchDesign;
  });

  if (variation) {
    // Actualizar precio
    if (priceEl) {
      priceEl.textContent = `$${variation.price.toLocaleString("es-CO")}`;
    }

    // Actualizar stock
    if (stockEl) {
      if (variation.stock > 0) {
        stockEl.textContent = `Stock disponible: ${variation.stock}`;
        stockEl.classList.remove("out-of-stock");
      } else {
        stockEl.textContent = "Sin stock";
        stockEl.classList.add("out-of-stock");
      }
    }

    // Actualizar max stock
    maxProductStock = variation.stock;

    // Actualizar input de cantidad
    if (qtyInput) {
      qtyInput.max = variation.stock;
      if (parseInt(qtyInput.value) > variation.stock) {
        qtyInput.value = variation.stock;
      }
    }
  } else {
    // No hay variación completa seleccionada
    if (priceEl && !selectedVariation.size) {
      priceEl.textContent = "Selecciona todas las opciones";
    }
    if (stockEl && !selectedVariation.size) {
      stockEl.textContent = "Selecciona opciones para ver disponibilidad";
    }
  }
}

/* ==================================================
   🆕 AÑADIR PRODUCTO VARIABLE AL CARRITO
================================================== */
function addVariableProductToCart() {
  // Validar que se hayan seleccionado todas las opciones
  if (!selectedVariation.color || !selectedVariation.size) {
    alert("Por favor selecciona todas las opciones del producto");
    return;
  }

  // Buscar la variación exacta
  const variation = currentProduct.variations.find(v => {
    const matchColor = v.color === selectedVariation.color;
    const matchSize = v.size === selectedVariation.size;
    const matchDesign = selectedVariation.design 
      ? v.design === selectedVariation.design 
      : true;
    return matchColor && matchSize && matchDesign;
  });

  if (!variation) {
    alert("Variación no encontrada");
    return;
  }

  if (variation.stock === 0) {
    alert("Esta variación no tiene stock disponible");
    return;
  }

  // Obtener cantidad
  const qty = parseInt(document.getElementById("qty")?.value || 1);

  // Añadir al carrito con información de variación
  addToCart(currentProduct.id, qty, {
    color: selectedVariation.color,
    size: selectedVariation.size,
    design: selectedVariation.design,
    price: variation.price,
    stock: variation.stock,
    images: variation.images || [] // 👈 INCLUIR IMÁGENES
  });
}

function initSpecsToggle() {
  const toggle = document.getElementById("specsToggle");
  const content = document.getElementById("specsContent");

  if (!toggle || !content) return;

  toggle.addEventListener("click", () => {
    content.classList.toggle("open");
    toggle.classList.toggle("open");
  });
}  

function changeQty(delta) {
  const input = document.getElementById("qty");
  let value = parseInt(input.value) || 1;

  value += delta;

  if (value < 1) value = 1;
  if (value > maxProductStock) value = maxProductStock;
  input.value = value;
}

function addProductFromDetail(id, isDigital = false) {
  const qty = isDigital ? 1 : parseInt(document.getElementById("qty").value);
  addToCart(id, qty);
}  

//MINIATURAS
function renderThumbnails(images) {
  const list = document.getElementById("thumbnailList");
  const mainImg = document.getElementById("mainProductImage");

  list.innerHTML = "";

  images.forEach((img, index) => {
    const thumb = document.createElement("img");
    thumb.src = getImage(img);

    if (index === 0) thumb.classList.add("active");

    thumb.addEventListener("click", () => {
      document
        .querySelectorAll(".thumbnail-list img")
        .forEach(i => i.classList.remove("active"));

      thumb.classList.add("active");
      mainImg.src = thumb.src;

      mainImg.style.transform = "scale(1) translate(0,0)";
    });

    list.appendChild(thumb);
  });
}

function initImageZoom() {
  const container = document.querySelector(".zoom-container");
  const img = container?.querySelector("img");
  if (!container || !img) return;

  const zoom = 1.65;
  const panLimit = 60;

  container.addEventListener("mousemove", (e) => {
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * panLimit;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * panLimit;

    img.style.transform = `
      scale(${zoom})
      translate(${-x}%, ${-y}%)
    `;
  });

  container.addEventListener("mouseleave", () => {
    img.style.transform = "scale(1) translate(0, 0)";
  });
}    

//HELPER
function getImage(img) {
  return img.startsWith("http") ? img : "assets/img/" + img;
}  

/* ==================================================
   🆕 RENDERIZAR BOTONES DE CONTACTO
================================================== */
function renderContactButtons(contact) {
  if (!contact) return "";

  const hasWhatsApp = contact.whatsapp && contact.whatsapp.number;
  const hasEmail = contact.email && contact.email.address;

  if (!hasWhatsApp && !hasEmail) return "";

  return `
    <div class="product-contact">
      ${contact.message ? `
        <p class="contact-message">
          <i class="fa-solid fa-info-circle"></i>
          ${contact.message}
        </p>
      ` : ""}
      
      <div class="contact-buttons">
        ${hasWhatsApp ? `
          <a 
            href="https://wa.me/${contact.whatsapp.number}${contact.whatsapp.text ? `?text=${encodeURIComponent(contact.whatsapp.text)}` : ''}"
            target="_blank"
            rel="noopener noreferrer"
            class="contact-btn whatsapp-btn"
          >
            <i class="fa-brands fa-whatsapp"></i>
            <span>WhatsApp</span>
          </a>
        ` : ""}

        ${hasEmail ? `
          <a 
            href="mailto:${contact.email.address}${contact.email.subject ? `?subject=${encodeURIComponent(contact.email.subject)}` : ''}${contact.email.body ? `&body=${encodeURIComponent(contact.email.body)}` : ''}"
            class="contact-btn email-btn"
          >
            <i class="fa-solid fa-envelope"></i>
            <span>Email</span>
          </a>
        ` : ""}
      </div>
    </div>
  `;
}

function renderSpecs(specs) {
  if (!specs) return "";

  return `
    <div class="product-specs" id="productSpecs">
      
      <button class="specs-toggle" id="specsToggle">
        <span>Ficha técnica</span>
        <i class="fa-solid fa-angle-up"></i>
      </button>

      <div class="specs-content" id="specsContent">
        <table>
          <tbody>
            ${Object.entries(specs).map(([key, value]) => `
              <tr>
                <td class="spec-key">${key}</td>
                <td class="spec-value">
                  ${String(value)
                    .trim()
                    .replace(/\n+/g, "<br>")}
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>

    </div>
  `;
}    

function renderDescription(text) {
  if (!text) return "";

  return text
    .trim()
    .split("\n")
    .filter(p => p.trim() !== "")
    .map(p => `<p>${p}</p>`)
    .join("");
}  

function renderCategories(categories) {
  if (!categories) return "";

  // Si viene como string → convertir a array
  const list = Array.isArray(categories)
    ? categories
    : categories.split(",").map(c => c.trim());

  return list
    .map(cat => `
      <a 
        href="index.html?category=${encodeURIComponent(cat)}"
        class="product-category"
      >
        ${cat}
      </a>
    `)
    .join("");
}  

/* ==================================================
   SHARE
================================================== */
function share(platform) {
  const url = window.location.href;
  const text = "Mira este producto 👀";

  const links = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    whatsapp: `https://wa.me/?text=${text} ${url}`,
    instagram: `https://www.instagram.com/`
  };

  window.open(links[platform], "_blank");
}

/* ==================================================
   COMENTARIOS (LocalStorage)
================================================== */
function initComments() {
  const btn = document.getElementById("addComment");
  const textarea = document.getElementById("commentText");
  const list = document.getElementById("commentList");

  if (!btn || !textarea || !list) return;

  const productId = new URLSearchParams(window.location.search).get("id");
  const key = `comments_${productId}`;

  renderComments();

  btn.addEventListener("click", () => {
    if (!textarea.value.trim()) return;

    const comments = JSON.parse(localStorage.getItem(key)) || [];
    comments.push({
      text: textarea.value,
      date: new Date().toLocaleString()
    });

    localStorage.setItem(key, JSON.stringify(comments));
    textarea.value = "";
    renderComments();
  });

  function renderComments() {
    list.innerHTML = "";
    const comments = JSON.parse(localStorage.getItem(key)) || [];

    comments.forEach(c => {
      const div = document.createElement("div");
      div.className = "comment";
      div.innerHTML = `<strong>${c.date}</strong><p>${c.text}</p>`;
      list.appendChild(div);
    });
  }
}

/* ==================================================
   SOPORTE
================================================== */
function initSupportForm() {
  const form = document.getElementById("supportForm");
  const select = document.getElementById("productSelect");

  if (!form || !select) return;

  products.forEach(p => {
    const option = document.createElement("option");
    option.value = p.name;
    option.textContent = p.name;
    select.appendChild(option);
  });

  form.addEventListener("submit", e => {
    e.preventDefault();

    const message = form.querySelector("textarea").value;
    if (!message.trim()) return;

    const tickets = JSON.parse(localStorage.getItem("supportTickets")) || [];
    tickets.push({
      product: select.value,
      message,
      date: new Date().toLocaleString()
    });

    localStorage.setItem("supportTickets", JSON.stringify(tickets));
    form.reset();
    alert("Consulta enviada correctamente");
  });
}

 /* ==================================================
   CONECTAR PRODUCTOS
================================================== */
function renderProductNavigation(currentSlug) {
  const index = products.findIndex(p => p.slug === currentSlug);

  const prev = products[index - 1];
  const next = products[index + 1];

  const prevEl = document.getElementById("prevProduct");
  const nextEl = document.getElementById("nextProduct");

  // RESET
  prevEl.classList.add("hidden");
  nextEl.classList.add("hidden");

  if (prev) {
    prevEl.href = `producto.html?id=${prev.slug}`;
    prevEl.innerHTML = `
      <span class="nav-icon">
        <i class="fa-solid fa-angle-left"></i>
      </span>
      <div>
        <small>Producto anterior</small>
        <div>${prev.name}</div>
      </div>
    `;
    prevEl.classList.remove("hidden");
  }

  if (next) {
    nextEl.href = `producto.html?id=${next.slug}`;
    nextEl.innerHTML = `
      <div>
        <small>Siguiente producto</small>
        <div>${next.name}</div>
      </div>
      <span class="nav-icon">
        <i class="fa-solid fa-angle-right"></i>
      </span>
    `;
    nextEl.classList.remove("hidden");
  }
}  


/* ==================================================
   REINICIAR ADDTOANY DESPUÉS DE NAVEGAR LOS PRODUCTOS
================================================== */

function initShareButtons() {
  if (window.a2a) {
    a2a.init_all();
  }
}