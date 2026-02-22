/* ==================================================
   CHECKOUT.JS - VERSIÓN PRODUCCIÓN
   Flujo completo de checkout con:
   - Métodos de pago (Nequi, Daviplata)
   - Resumen del pedido dinámico
   - Subida de comprobante a Google Drive
   - Envío de emails con EmailJS
   - Soporte para productos digitales
================================================== */

/* =========================
   CONFIGURACIÓN
========================= */
const CART_KEY = "cart";
const ORDER_KEY = "orders";

// 🔹 Configuración de métodos de pago
const PAYMENT_METHODS = {
  nequi: {
    name: "Nequi",
    number: "3123675535",
    qrImage: "assets/img/pagos/qr-andres-nequi.png", // Reemplazar con tu QR real
    logo: "assets/img/pagos/logo-nequi.jpg", // Reemplazar tu logo
    deepLink: "nequi://",
    color: "#6C1C5C"
  },
  daviplata: {
    name: "Daviplata",
    number: "3174369474",
    qrImage: "assets/img/pagos/qr-daviplata.png", // Reemplazar con tu QR real
    logo: "assets/img/pagos/logo-daviplata.png", // Reemplazar tu logo
    deepLink: "daviplata://",
    color: "#ED1C24"
  }
};

// 🔹 Google Apps Script URL
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyJuAQrlIEK2YxyCBQuZJVmNGYNECuCxYmRNI3SUupU-Q2cQpqDAs2d8khutKwzFwjS/exec";

// 🔹 EmailJS
const EMAILJS_PUBLIC_KEY = "dE5hbDtP0q7v-chkh";
const EMAILJS_SERVICE_ID = "default_service"; // Reemplazar con tu Service ID
const EMAILJS_TEMPLATE_VENDOR = "template_9wtvduj"; // Reemplazar con tu Template ID para vendedor
const EMAILJS_TEMPLATE_CUSTOMER = "template_0km5fgk"; // Reemplazar con tu Template ID para cliente

/* =========================
   VARIABLES GLOBALES
========================= */
let selectedPaymentMethod = null;
let uploadedReceipt = null;
let uploadedReceiptData = null;

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  initEmailJS();
  loadCountries();
  handleCountryChange();
  renderOrderSummary();
  initPaymentMethods();
  initReceiptUpload();
  handleCheckoutSubmit();
  validateCartNotEmpty();
});

/* =========================
   VALIDAR CARRITO NO VACÍO
========================= */
function validateCartNotEmpty() {
  const cart = getCart();
  
  if (cart.length === 0) {
    document.body.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; text-align: center; padding: 2rem;">
        <div style="font-size: 5rem; margin-bottom: 1rem;">🛒</div>
        <h2 style="margin-bottom: 1rem;">Tu carrito está vacío</h2>
        <p style="color: #6c757d; margin-bottom: 2rem;">Agrega productos antes de continuar con el checkout.</p>
        <a href="index.html" style="background: #0a58ca; color: white; padding: 0.8rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Ir a la tienda
        </a>
      </div>
    `;
  }
}

/* =========================
   INICIALIZAR EMAILJS
========================= */
function initEmailJS() {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

/* =========================
   DATA HELPERS
========================= */
function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
}

function calculateTotal() {
  return getCart().reduce((acc, item) => acc + item.price * item.quantity, 0);
}

/* =========================
   PAÍS Y CIUDAD
========================= */
function loadCountries() {
  const countrySelect = document.getElementById("country");
  if (!countrySelect || typeof locations === "undefined") return;

  Object.keys(locations).forEach(country => {
    const option = document.createElement("option");
    option.value = country;
    option.textContent = country;
    countrySelect.appendChild(option);
  });
}

function handleCountryChange() {
  const countrySelect = document.getElementById("country");
  const citySelect = document.getElementById("city");

  if (!countrySelect || !citySelect) return;

  countrySelect.addEventListener("change", () => {
    citySelect.innerHTML = `<option value="">Ciudad</option>`;

    const cities = locations[countrySelect.value] || [];
    cities.forEach(city => {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      citySelect.appendChild(option);
    });
  });
}

/* =========================
   RENDERIZAR RESUMEN DEL PEDIDO
========================= */
function renderOrderSummary() {
  const container = document.getElementById("orderSummary");
  if (!container) return;

  const cart = getCart();
  const total = calculateTotal();

  let itemsHTML = "";

  cart.forEach(item => {
    const subtotal = item.price * item.quantity;
    
    // Obtener imagen del producto
    const productImage = getProductImage(item.id, item.variation);
    
    // Construir nombre completo con variación
    let fullName = item.name;
    let variationDetails = "";
    
    if (item.isVariable && item.variation) {
      const varParts = [];
      if (item.variation.color) varParts.push(item.variation.color);
      if (item.variation.size) varParts.push(`Talla ${item.variation.size}`);
      if (item.variation.design) varParts.push(item.variation.design);
      
      if (varParts.length > 0) {
        variationDetails = varParts.join(", ");
      }
    }

    itemsHTML += `
      <div class="summary-item">
        <img src="${productImage}" alt="${item.name}" class="summary-item-image">
        <div class="summary-item-details">
          <div class="summary-item-info">
            <span class="summary-item-name">${fullName}</span>
            ${variationDetails ? `<span class="summary-item-variation">${variationDetails}</span>` : ''}
            <span class="summary-item-price">$${item.price.toLocaleString("es-CO")}</span>
          </div>
          <span class="summary-item-qty">Cantidad: ${item.quantity}</span>
        </div>
        <span class="summary-item-subtotal">$${subtotal.toLocaleString("es-CO")}</span>
      </div>
    `;
  });

  container.innerHTML = `
    <h3>Resumen del pedido</h3>
    <div class="summary-items">
      ${itemsHTML}
    </div>
    <div class="summary-total">
      <span>Total:</span>
      <span class="total-price">$${total.toLocaleString("es-CO")}</span>
    </div>
  `;
}

/* =========================
   OBTENER IMAGEN DEL PRODUCTO
========================= */
function getProductImage(id, variation = null) {
  const product = products.find(p => p.id === id);
  if (!product) return "https://via.placeholder.com/80x80?text=Producto";

  // Si hay variación y tiene imagen, usar esa
  if (variation && variation.image) {
    const img = variation.image;
    return img.startsWith("http") ? img : "assets/img/" + img;
  }

  // Si no, usar la imagen por defecto del producto
  const img = product.images[0];
  return img.startsWith("http") ? img : "assets/img/" + img;
}

/* =========================
   MÉTODOS DE PAGO
========================= */
function initPaymentMethods() {
  const container = document.getElementById("paymentMethods");
  if (!container) return;

  container.innerHTML = "";

  Object.keys(PAYMENT_METHODS).forEach(key => {
    const method = PAYMENT_METHODS[key];
    const total = calculateTotal();

    const div = document.createElement("div");
    div.className = "payment-method";
    div.innerHTML = `
      <div class="payment-header" onclick="togglePaymentDetails('${key}')">
        <img src="${method.logo}" 
          alt="${method.name}" 
          class="payment-logo"
          onerror="this.style.display='none'">
        <input 
          type="radio" 
          name="paymentMethod" 
          id="payment_${key}" 
          value="${key}"
          onchange="selectPaymentMethod('${key}')">
        <label for="payment_${key}">
          <img src="${method.qrImage}" alt="${method.name}" onerror="this.style.display='none'">
          <span>${method.name}</span>
        </label>
        <i class="fa-solid fa-chevron-down toggle-icon" id="icon_${key}"></i>
      </div>
      
      <div class="payment-details" id="details_${key}">
        <div class="payment-content">
          <div class="qr-container">
            <img src="${method.qrImage}" alt="QR ${method.name}" class="qr-code" onerror="this.style.display='none'">
          </div>
          
          <div class="payment-info">
            <p><strong>Número:</strong> ${method.number}</p>
            <p><strong>Total a pagar:</strong> $${total.toLocaleString("es-CO")}</p>
          </div>

          <div class="payment-actions">
            <button type="button" class="btn-secondary" onclick="copyToClipboard('${method.number}', 'Número')">
              <i class="fa-solid fa-copy"></i>
              Copiar número
            </button>
            
            <button type="button" class="btn-secondary" onclick="copyToClipboard('${total}', 'Total')">
              <i class="fa-solid fa-dollar-sign"></i>
              Copiar total
            </button>
            
            <button type="button" class="btn-secondary" onclick="copyOrderDetails('${method.name}')">
              <i class="fa-solid fa-clipboard"></i>
              Copiar detalles
            </button>
            
            <button type="button" class="btn-primary" onclick="openPaymentApp('${method.deepLink}')">
              <i class="fa-solid fa-mobile-screen"></i>
              Abrir ${method.name}
            </button>
          </div>
        </div>
      </div>
    `;

    container.appendChild(div);
  });
}

function togglePaymentDetails(method) {
  const details = document.getElementById(`details_${method}`);
  const icon = document.getElementById(`icon_${method}`);
  const radio = document.getElementById(`payment_${method}`);
  
  // Cerrar todos los demás
  Object.keys(PAYMENT_METHODS).forEach(key => {
    if (key !== method) {
      const otherDetails = document.getElementById(`details_${key}`);
      const otherIcon = document.getElementById(`icon_${key}`);
      if (otherDetails) {
        otherDetails.classList.remove('active');
      }
      if (otherIcon) {
        otherIcon.classList.remove('rotated');
      }
    }
  });
  
  // Toggle el actual
  if (details) {
    details.classList.toggle('active');
  }
  if (icon) {
    icon.classList.toggle('rotated');
  }
  
  // Seleccionar el radio
  if (radio) {
    radio.checked = true;
    selectPaymentMethod(method);
  }
}

function selectPaymentMethod(method) {
  selectedPaymentMethod = method;
}

function copyToClipboard(text, label) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`${label} copiado al portapapeles`, "success");
  }).catch(() => {
    showToast("Error al copiar", "error");
  });
}

function copyOrderDetails(methodName) {
  const cart = getCart();
  const total = calculateTotal();
  
  let details = `📱 Pago vía ${methodName}\n`;
  details += `💰 Total: $${total.toLocaleString("es-CO")}\n\n`;
  details += `📦 Pedido:\n`;
  
  cart.forEach(item => {
    let itemName = item.name;
    if (item.isVariable && item.variation) {
      const varParts = [];
      if (item.variation.color) varParts.push(item.variation.color);
      if (item.variation.size) varParts.push(`Talla ${item.variation.size}`);
      if (item.variation.design) varParts.push(item.variation.design);
      if (varParts.length > 0) itemName += ` (${varParts.join(", ")})`;
    }
    details += `- ${itemName} x${item.quantity}\n`;
  });

  copyToClipboard(details, "Detalles del pedido");
}

function openPaymentApp(deepLink) {
  window.location.href = deepLink;
}

/* =========================
   SUBIDA DE COMPROBANTE
========================= */
function initReceiptUpload() {
  const dropZone = document.getElementById("receiptDropZone");
  const fileInput = document.getElementById("receiptFile");
  const preview = document.getElementById("receiptPreview");

  if (!dropZone || !fileInput) return;

  // Click en la zona de drop
  dropZone.addEventListener("click", () => {
    fileInput.click();
  });

  // Selección de archivo
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file);
    }
  });

  // Drag and drop
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  });
}

function handleFile(file) {
  // Validar tipo
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
  if (!validTypes.includes(file.type)) {
    showToast("Solo se permiten archivos JPG, PNG o PDF", "error");
    return;
  }

  // Validar tamaño (5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    showToast("El archivo no debe superar 5MB", "error");
    return;
  }

  uploadedReceipt = file;
  showReceiptPreview(file);
}

function showReceiptPreview(file) {
  const preview = document.getElementById("receiptPreview");
  const dropZone = document.getElementById("receiptDropZone");
  
  if (!preview) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    if (file.type === "application/pdf") {
      preview.innerHTML = `
        <div class="preview-pdf">
          <i class="fa-solid fa-file-pdf"></i>
          <p>${file.name}</p>
          <button type="button" onclick="removeReceipt()" class="btn-remove">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      `;
    } else {
      preview.innerHTML = `
        <div class="preview-image">
          <img src="${e.target.result}" alt="Comprobante">
          <button type="button" onclick="removeReceipt()" class="btn-remove">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      `;
    }
    
    preview.style.display = "block";
    dropZone.style.display = "none";
  };
  
  reader.readAsDataURL(file);
}

function removeReceipt() {
  uploadedReceipt = null;
  uploadedReceiptData = null;
  
  const preview = document.getElementById("receiptPreview");
  const dropZone = document.getElementById("receiptDropZone");
  const fileInput = document.getElementById("receiptFile");
  
  if (preview) preview.style.display = "none";
  if (dropZone) dropZone.style.display = "flex";
  if (fileInput) fileInput.value = "";
}

/* =========================
   CONVERTIR ARCHIVO A BASE64
========================= */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* =========================
   SUBIR COMPROBANTE A GOOGLE DRIVE
========================= */
async function uploadReceiptToDrive(file) {
  try {
    showLoadingOverlay("Subiendo comprobante...");

    const base64Data = await fileToBase64(file);

    const formData = new FormData();
    formData.append("file", base64Data);
    formData.append("filename", file.name);
    formData.append("mimeType", file.type);

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      body: formData
      //headers: {
      //  "Content-Type": "application/json"
      //},
      //body: JSON.stringify({
      //  file: base64Data,
      //  filename: file.name,
      //  mimeType: file.type
      //})
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Error al subir comprobante");
    }

    return result.url;

  } catch (error) {
    console.error("Error real al subir comprobante:", error);
    throw error;
  } finally {
    hideLoadingOverlay();
  }
}

function buildProductDetails(item) {
  let details = `${item.name}\n`;
  details += `Cantidad: ${item.quantity}\n`;
  details += `Precio unitario: $${item.price.toLocaleString("es-CO")}\n`;
  details += `Subtotal: $${(item.price * item.quantity).toLocaleString("es-CO")}\n`;

  if (item.isVariable && item.variation) {
    if (item.variation.color) {
      details += `Color: ${item.variation.color}\n`;
    }
    if (item.variation.size) {
      details += `Talla: ${item.variation.size}\n`;
    }
    if (item.variation.design) {
      details += `Diseño: ${item.variation.design}\n`;
    }
  }

  details += `-----------------------------------\n`;

  return details;
}

/* =========================
   ENVIAR EMAILS
========================= */
async function sendEmails(order, receiptUrl) {

  const cart = order.items;

  // Construir mensaje vendedor
  let vendorMessage = `NUEVO PEDIDO - GoldenPolis\n\n`;
  vendorMessage += `Cliente: ${order.customer.name}\n`;
  vendorMessage += `Teléfono: ${order.customer.phone}\n`;
  vendorMessage += `Email: ${order.customer.email}\n`;
  vendorMessage += `Ciudad: ${order.customer.city}\n`;
  vendorMessage += `País: ${order.customer.country}\n\n`;
  vendorMessage += `Método de pago: ${order.paymentMethod}\n\n`;
  vendorMessage += `Productos:\n`;

  cart.forEach((item, index) => {
    vendorMessage += `${index + 1}.\n`;
    vendorMessage += buildProductDetails(item);
  });

  vendorMessage += `\nTOTAL: $${order.total.toLocaleString("es-CO")}\n`;
  vendorMessage += `Comprobante: ${receiptUrl}\n`;

  // Email al VENDEDOR
  await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_VENDOR,
    {
      to_name: "Andrés Rodríguez",
      to_email: "artworldartistico@gmail.com",
      from_name: order.customer.name,
      from_email: order.customer.email,
      message: vendorMessage,
    }
  );

  // Construir mensaje cliente
  let customerMessage = `¡Gracias por tu compra ${order.customer.name}!\n\n`;
  customerMessage += `Resumen del pedido:\n\n`;

  cart.forEach((item, index) => {
    customerMessage += `${index + 1}.\n`;
    customerMessage += buildProductDetails(item);
  });

  customerMessage += `\nTOTAL PAGADO: $${order.total.toLocaleString("es-CO")}\n`;
  customerMessage += `Método de pago: ${order.paymentMethod}\n\n`;

  // Email al CLIENTE
  await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_CUSTOMER,
    {
      to_name: order.customer.name,
      to_email: order.customer.email,
      from_name: "GoldenPolis",
      message: customerMessage,
    }
  );

  // Agregar productos digitales si existen
  const digitalProducts = cart.filter(item => {
    const product = products.find(p => p.id === item.id);
    return product && product.type === "digital";
  });

  if (digitalProducts.length > 0) {
    customerMessage += `\nProductos digitales:\n\n`;

    digitalProducts.forEach(item => {
      const product = products.find(p => p.id === item.id);
      if (product && product.downloadUrl) {
        customerMessage += `Descargar ${product.name}:\n${product.downloadUrl}\n\n`;
      }
    });

    customerMessage += `Guarda estos enlaces para futuras descargas.\n`;
  }

  /* =========================
     ENVIAR EMAIL CLIENTE
  ========================= */

  await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_CUSTOMER,
    {
      to_name: order.customer.name,
      to_email: order.customer.email,
      from_name: "GoldenPolis",
      message: customerMessage,
    }
  );
}

/* =========================
   SUBMIT CHECKOUT
========================= */
function handleCheckoutSubmit() {
  const form = document.getElementById("checkoutForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validaciones
    const cart = getCart();
    if (cart.length === 0) {
      showToast("El carrito está vacío", "error");
      return;
    }

    if (!selectedPaymentMethod) {
      showToast("Selecciona un método de pago", "error");
      return;
    }

    if (!uploadedReceipt) {
      showToast("Debes subir el comprobante de pago", "error");
      return;
    }

    try {
      // 1️⃣ Subir comprobante a Drive
      const receiptUrl = await uploadReceiptToDrive(uploadedReceipt);

      // 2️⃣ Crear objeto de orden
      const order = {
        id: Date.now(),
        customer: {
          name: document.getElementById("customerName").value,
          phone: document.getElementById("customerPhone").value,
          email: document.getElementById("customerEmail").value,
          country: document.getElementById("country").value,
          city: document.getElementById("city").value
        },
        items: cart,
        total: calculateTotal(),
        paymentMethod: PAYMENT_METHODS[selectedPaymentMethod].name,
        receiptUrl: receiptUrl,
        date: new Date().toLocaleString("es-CO")
      };

      // 3️⃣ Enviar emails
      await sendEmails(order, receiptUrl);

      // 4️⃣ Guardar orden
      saveOrder(order);

      // 5️⃣ Limpiar carrito
      clearCart();

      // 6️⃣ Mostrar éxito
      showSuccessPage(order);

    //} catch (error) {
    //  console.error("Error en checkout:", error);
    //  showToast("Hubo un error al procesar tu pedido. Inténtalo nuevamente.", "error");
    //}
    } catch (error) {
      console.error("ERROR DETALLADO CHECKOUT:", error);
      alert(error.message);
      showToast("Hubo un error al procesar tu pedido.", "error");
    }
  });
}

/* =========================
   GUARDAR ORDEN
========================= */
function saveOrder(order) {
  const orders = JSON.parse(localStorage.getItem(ORDER_KEY)) || [];
  orders.push(order);
  localStorage.setItem(ORDER_KEY, JSON.stringify(orders));
}

/* =========================
   PÁGINA DE ÉXITO
========================= */
function showSuccessPage(order) {
  const cart = order.items;
  
  // Verificar si hay productos digitales
  const digitalProducts = cart.filter(item => {
    const product = products.find(p => p.id === item.id);
    return product && product.type === "digital";
  });

  let downloadsHTML = "";
  
  if (digitalProducts.length > 0) {
    downloadsHTML = `
      <div class="downloads-box">
        <h3>
          <i class="fa-solid fa-cloud-arrow-down"></i>
          Tus productos digitales
        </h3>
        <div class="download-links">
    `;
    
    digitalProducts.forEach(item => {
      const product = products.find(p => p.id === item.id);
      if (product && product.downloadUrl) {
        downloadsHTML += `
          <a 
            href="${product.downloadUrl}" 
            download 
            class="download-link"
            target="_blank"
          >
            <i class="fa-solid fa-download"></i>
            Descargar ${product.name}
          </a>
        `;
      }
    });
    
    downloadsHTML += `
        </div>
        <p class="download-note">
          <i class="fa-solid fa-info-circle"></i>
          También recibirás los links de descarga por email
        </p>
      </div>
    `;
  }

  document.body.innerHTML = `
    <div class="success-page">
      <div class="success-container">
        <div class="success-icon">
          <i class="fa-solid fa-circle-check"></i>
        </div>
        
        <h1>¡Pedido confirmado!</h1>
        
        <p class="success-message">
          Tu pedido #${order.id} ha sido registrado correctamente.
        </p>

        <div class="order-info">
          <p><strong>Total pagado:</strong> $${order.total.toLocaleString("es-CO")}</p>
          <p><strong>Método de pago:</strong> ${order.paymentMethod}</p>
          <p><strong>Fecha:</strong> ${order.date}</p>
        </div>

        ${downloadsHTML}

        ${!digitalProducts.length ? `
          <p class="success-note">
            Pronto nos pondremos en contacto contigo para coordinar la entrega.
          </p>
        ` : ""}

        <div class="success-actions">
          <a href="index.html" class="btn-primary">
            <i class="fa-solid fa-house"></i>
            Volver a la tienda
          </a>
        </div>

        <p class="email-note">
          <i class="fa-solid fa-envelope"></i>
          Hemos enviado una confirmación a ${order.customer.email}
        </p>
      </div>
    </div>
  `;
}

/* =========================
   UI HELPERS
========================= */
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fa-solid fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"}"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add("show"), 100);
  
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function showLoadingOverlay(message = "Procesando...") {
  const overlay = document.createElement("div");
  overlay.id = "loadingOverlay";
  overlay.className = "loading-overlay";
  overlay.innerHTML = `
    <div class="loading-content">
      <div class="spinner"></div>
      <p>${message}</p>
    </div>
  `;
  
  document.body.appendChild(overlay);
}

function hideLoadingOverlay() {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) {
    overlay.remove();
  }
}
