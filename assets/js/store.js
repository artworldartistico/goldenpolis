/* ==================================================
   STORE.JS
   Lógica principal de tienda y carrito
   Backend simulado con LocalStorage
   
   🆕 SOPORTE PARA PRODUCTOS VARIABLES
================================================== */

/* =========================
   CONFIG
========================= */
const CART_KEY = "cart";

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  initCategories();
  renderProducts(products);
  initFilters();
  initCart();
  applyCategoryFromURL();
});

/* =========================
   RENDER PRODUCTS
========================= */
function renderProducts(list) {
    const container = document.getElementById("productList");
    if (!container) return;
  
    container.innerHTML = "";
  
    // 🔍 SIN RESULTADOS
    if (!list.length) {
      container.innerHTML = `
        <div class="no-results">
          <span>🔍</span>
          <h3>No se encontraron productos</h3>
          <p>Intenta cambiar los filtros o el término de búsqueda.</p>
        </div>
      `;
      return;
    }
  
    // 🛒 CON RESULTADOS
    list.forEach(product => {
      const card = document.createElement("article");
      card.className = "product";

      // 🔹 Para productos variables, obtener precio mínimo
      let displayPrice = product.price;
      let priceLabel = "";

      if (product.isVariable && product.variations && product.variations.length > 0) {
        const prices = product.variations.map(v => v.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        if (minPrice === maxPrice) {
          displayPrice = minPrice;
        } else {
          displayPrice = minPrice;
          priceLabel = "Desde ";
        }
      }
  
      card.innerHTML = `
        <a href="producto.html?id=${product.slug}" class="product-link">
        <img 
          src="${product.images[0].startsWith('http') 
            ? product.images[0] 
            : 'assets/img/' + product.images[0]}"
          alt="${product.name}">      
        </a>
  
        <div class="product-info">
          <h3>
            <a href="producto.html?id=${product.slug}">
              ${product.name}
            </a>
          </h3>
  
          <p>${truncateText(product.description, 50)}</p>
  
          <div class="price">
            ${priceLabel}$${displayPrice.toLocaleString("es-CO")}
          </div>
  
          ${product.isVariable ? `
            <button onclick="window.location.href='producto.html?id=${product.slug}'">
              Ver opciones
            </button>
          ` : `
            <button onclick="addToCart(${product.id})">
              Añadir al carrito
            </button>
          `}
        </div>
      `;
  
      container.appendChild(card);
    });
  }  

/* =========================
   CATEGORIES
========================= */
function initCategories() {
  const select = document.getElementById("categoryFilter");
  if (!select) return;

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
}

/* =========================
   FILTERS & SEARCH
========================= */
function initFilters() {
  const search = document.getElementById("searchInput");
  const category = document.getElementById("categoryFilter");
  const price = document.getElementById("priceFilter");
  const stock = document.getElementById("stockFilter");

  [search, category, price, stock].forEach(el => {
    if (el) el.addEventListener("input", applyFilters);
  });
}

function applyFilters() {
  let filtered = [...products];

  const searchText = document.getElementById("searchInput")?.value.toLowerCase() || "";
  const categoryValue = document.getElementById("categoryFilter")?.value || "";
  const priceValue = document.getElementById("priceFilter")?.value || "";
  const stockOnly = document.getElementById("stockFilter")?.checked || false;

  if (searchText) {
    filtered = filtered.filter(p => {
      const specsText = p.specs
        ? Object.values(p.specs).join(" ").toLowerCase()
        : "";
  
      const categoryText = Array.isArray(p.category)
        ? p.category.join(" ").toLowerCase()
        : p.category.toLowerCase();
  
      return (
        p.name.toLowerCase().includes(searchText) ||
        p.description.toLowerCase().includes(searchText) ||
        categoryText.includes(searchText) ||
        specsText.includes(searchText)
      );
    });
  }  

  if (categoryValue) {
    filtered = filtered.filter(p => {
      const categories = Array.isArray(p.category)
        ? p.category
        : p.category.split(",").map(c => c.trim());
  
      return categories
        .map(c => c.toLowerCase())
        .includes(categoryValue.toLowerCase());
    });
  }    

  if (stockOnly) {
    // 🔹 Para productos variables, verificar si hay alguna variación con stock
    filtered = filtered.filter(p => {
      if (p.isVariable && p.variations) {
        return p.variations.some(v => v.stock > 0);
      }
      return p.stock > 0;
    });
  }

  if (priceValue === "low") {
    filtered.sort((a, b) => {
      const priceA = a.isVariable && a.variations?.length > 0 
        ? Math.min(...a.variations.map(v => v.price))
        : a.price;
      const priceB = b.isVariable && b.variations?.length > 0
        ? Math.min(...b.variations.map(v => v.price))
        : b.price;
      return priceA - priceB;
    });
  }

  if (priceValue === "high") {
    filtered.sort((a, b) => {
      const priceA = a.isVariable && a.variations?.length > 0
        ? Math.max(...a.variations.map(v => v.price))
        : a.price;
      const priceB = b.isVariable && b.variations?.length > 0
        ? Math.max(...b.variations.map(v => v.price))
        : b.price;
      return priceB - priceA;
    });
  }

  renderProducts(filtered);
}

/* =========================
   CART
========================= */
function initCart() {
  updateCartUI();

  const btn = document.getElementById("cartBtn");
  const sidebar = document.getElementById("cartSidebar");
  const closeBtn = document.getElementById("closeCart");

  if (btn && sidebar) {
    btn.addEventListener("click", () => {
      sidebar.classList.toggle("active");
    });
  }

  if (closeBtn && sidebar) {
    closeBtn.addEventListener("click", () => {
      sidebar.classList.remove("active");
    });
  }
}

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartUI();
}

/* =========================
   🆕 ADD TO CART CON SOPORTE PARA VARIACIONES
========================= */
function addToCart(productId, quantity = 1, variation = null) {
  const cart = getCart();
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const isDigital = product.type === "digital";
  const isVariable = product.isVariable === true;

  // 🔹 Para productos variables, validar que se envíe la variación
  if (isVariable && !variation) {
    console.error("Producto variable requiere información de variación");
    return;
  }

  // 🔹 Crear identificador único para el item en el carrito
  let cartItemId;
  if (isVariable) {
    // ID único basado en producto + variación
    cartItemId = `${productId}_${variation.color}_${variation.size}${variation.design ? '_' + variation.design : ''}`;
  } else {
    // ID simple para productos no variables
    cartItemId = productId.toString();
  }

  // 🔹 Buscar si el item ya existe en el carrito
  const item = cart.find(i => {
    if (isVariable) {
      return i.cartItemId === cartItemId;
    }
    return i.id === productId;
  });

  if (item) {
    // Item ya existe en el carrito
    if (isDigital) return; // ⛔ no sumar digitales

    item.quantity += quantity;

    // Validar stock
    const maxStock = isVariable ? variation.stock : product.stock;
    if (item.quantity > maxStock) {
      item.quantity = maxStock;
    }
  } else {
    // Nuevo item
    const newItem = {
      id: product.id,
      name: product.name,
      price: isVariable ? variation.price : product.price,
      quantity: isDigital ? 1 : quantity
    };

    // 🔹 Para productos variables, agregar info adicional
    if (isVariable) {
      newItem.cartItemId = cartItemId;
      newItem.isVariable = true;
      newItem.variation = {
        color: variation.color,
        size: variation.size,
        design: variation.design,
        stock: variation.stock,
        image: variation.images && variation.images.length > 0 
          ? variation.images[0] 
          : null // 👈 NUEVO: Guardar primera imagen de la variación
      };
    }

    cart.push(newItem);
  }

  saveCart(cart);
  openCart();
}

/* =========================
   🆕 REMOVE FROM CART CON SOPORTE PARA VARIACIONES
========================= */
function removeFromCart(cartItemId) {
  let cart = getCart();
  
  // Buscar y eliminar por cartItemId (si es variable) o por id (si no lo es)
  cart = cart.filter(item => {
    if (item.isVariable) {
      return item.cartItemId !== cartItemId;
    }
    return item.id.toString() !== cartItemId;
  });
  
  saveCart(cart);
}

/* =========================
   🆕 UPDATE QUANTITY CON SOPORTE PARA VARIACIONES
========================= */
function updateQuantity(cartItemId, delta) {
  const cart = getCart();
  
  // Buscar el item
  const item = cart.find(i => {
    if (i.isVariable) {
      return i.cartItemId === cartItemId;
    }
    return i.id.toString() === cartItemId;
  });

  if (!item) return;

  // Buscar el producto original
  const product = products.find(p => p.id === item.id);
  if (!product) return;

  // Determinar stock máximo
  let maxStock;
  if (item.isVariable) {
    maxStock = item.variation.stock;
  } else {
    maxStock = product.stock;
  }

  item.quantity += delta;

  // ⛔ mínimo 1
  if (item.quantity < 1) {
    item.quantity = 1;
  }

  // ⛔ máximo stock
  if (item.quantity > maxStock) {
    item.quantity = maxStock;
  }

  saveCart(cart);
}

function openCart() {
  const sidebar = document.getElementById("cartSidebar");
  if (sidebar) {
    sidebar.classList.add("active");
  }
}

/* =========================
   🆕 CART UI CON SOPORTE PARA VARIACIONES
========================= */
function updateCartUI() {
  const cart = getCart();
  const container = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  const countEl = document.getElementById("cartCount");
  const couponBox = document.querySelector(".cart-coupon");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const totalBox = totalEl?.closest("p");

  if (!container || !totalEl || !countEl) return;

  container.innerHTML = "";
  let total = 0;
  let count = 0;

  // 🟡 CARRITO VACÍO
  if (cart.length === 0) {
    container.innerHTML = `
    <div class="cart-empty-highlight">
      🛒
      <strong>Tu carrito está vacío</strong>
      <p>Agrega productos para comenzar tu compra</p>
    </div>
    `;

    totalEl.textContent = "$0";
    countEl.textContent = "0";

    if (couponBox) couponBox.style.display = "none";
    if (checkoutBtn) checkoutBtn.style.display = "none";
    if (totalBox) totalBox.style.display = "none";

    return;
  }

  // 🟢 CARRITO CON PRODUCTOS
  if (couponBox) couponBox.style.display = "flex";
  if (checkoutBtn) checkoutBtn.style.display = "block";
  if (totalBox) totalBox.style.display = "block";

  cart.forEach(item => {
    total += item.price * item.quantity;
    count += item.quantity;

    const subtotal = item.price * item.quantity;

    // 🔹 Identificador único para el item
    const itemId = item.isVariable ? item.cartItemId : item.id;

    // 🔹 Construir nombre completo con variación
    let fullName = item.name;
    if (item.isVariable && item.variation) {
      const varParts = [];
      if (item.variation.color) varParts.push(item.variation.color);
      if (item.variation.size) varParts.push(`Talla ${item.variation.size}`);
      if (item.variation.design) varParts.push(item.variation.design);
      
      if (varParts.length > 0) {
        fullName += ` (${varParts.join(", ")})`;
      }
    }

    const div = document.createElement("div");
    div.className = "cart-item";

    // 🔹 Verificar si es producto digital
    const product = products.find(p => p.id === item.id);
    const isDigital = product?.type === "digital";

    div.innerHTML = `
      <img src="${getProductImage(item.id, item.variation)}" class="cart-thumb">

      <div class="cart-info">
        <span class="cart-name">${fullName}</span>

        <div class="cart-controls">
          <span class="cart-qty">Cantidad:</span>

          ${isDigital ? `
            <span class="digital-badge">
              <i class="fa-solid fa-cloud-arrow-down"></i> Descarga inmediata
            </span>
          ` : `
            <button class="qty-btn" onclick="updateQuantity('${itemId}', -1)">−</button>
            <strong>${item.quantity}</strong>
            <button class="qty-btn" onclick="updateQuantity('${itemId}', 1)">+</button>
          `}

          <span class="cart-subtotal">
            $${subtotal.toLocaleString("es-CO")}
          </span>
        </div>
      </div>
    
      <button 
        class="cart-remove" 
        onclick="removeFromCart('${itemId}')"
        title="Eliminar producto"
      >
        <i class="fa-regular fa-trash-can"></i>
      </button>
    `;

    container.appendChild(div);
  });

  totalEl.textContent = `$${total.toLocaleString("es-CO")}`;
  countEl.textContent = count;
}

function getProductImage(id, variation = null) {
  const product = products.find(p => p.id === id);
  if (!product) return "";

  // 🔹 Si hay variación y tiene imagen, usar esa
  if (variation && variation.image) {
    const img = variation.image;
    return img.startsWith("http") ? img : "assets/img/" + img;
  }

  // 🔹 Si no, usar la imagen por defecto del producto
  const img = product.images[0];
  return img.startsWith("http") ? img : "assets/img/" + img;
}

/* =========================
   CHECKOUT REDIRECT
========================= */
const checkoutBtn = document.getElementById("checkoutBtn");
if (checkoutBtn) {
  checkoutBtn.addEventListener("click", () => {
    window.location.href = "checkout.html";
  });
}


/* =========================
   TRUNCAR TEXTO
========================= */

function truncateText(text, maxLength = 20) {
  if (!text) return "";
  return text.length > maxLength
    ? text.slice(0, maxLength).trim() + "…"
    : text;
}



/* =========================
   FILTRAR CATEGORÍA DE PRODUCTOS
========================= */

function applyCategoryFromURL() {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");

  if (!category) return;

  const select = document.getElementById("categoryFilter");
  if (select) {
    select.value = category;
  }

  applyFilters();
}
