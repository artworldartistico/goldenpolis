/* =========================================
   DATA.JS
   Simulación de base de datos
   En el futuro será una API REST
========================================= */

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quitar tildes
    .replace(/[^a-z0-9]+/g, "-") // espacios y símbolos → -
    .replace(/(^-|-$)/g, ""); // quitar - inicial/final
}

// PRODUCTOS
const demoProducts = [
    /* ==========================================
       HOODIE DAMA
    ========================================== */
    {
      id: 1,
      name: "Buzo con capota Hoodie Dama",
      type: "physical",
      isVariable: true,
      category: ["Ropa"],
      description: "Este buzo abierto con capota, en silueta clásica, está diseñado para brindar confort superior en cualquier contexto. Su construcción ligera y funcional lo convierte en el aliado ideal para trabajar desde casa con total comodidad o para acompañarte en tus recorridos diarios mientras disfrutas cada momento del día.",
      price: 139000,
      stock: 0,
      images: ["hoodies/dama/mockup-front.png","hoodies/dama/mockup-back.png","hoodies/dama/mockup-model-front.png","hoodies/dama/mockup-model-back.png"],
      rating: 5,
      // 🆕 CONTACTO PARA PEDIDOS AL POR MAYOR
      contact: {
        message: "📦 ¿Pedidos al por mayor? ¡Contáctanos ahora mismo!",
        whatsapp: {
          number: "573174369474",
          text: "Hola, quiero información sobre pedidos al por mayor de Buzos hoodies"
        }
      },
      
      variations: [
        // CORAZONCITO - BLANCO
        { color: "Blanco", size: "XS", design: "Corazón y amor", price: 132000, stock: 8, images: ["hoodies/dama/mockup-front.png","hoodies/dama/mockup-back.png","hoodies/dama/mockup-model-front.png","hoodies/dama/mockup-model-back.png"] },
        { color: "Blanco", size: "S", design: "Corazón y amor", price: 135000, stock: 12, images: ["hoodies/dama/mockup-front.png","hoodies/dama/mockup-back.png","hoodies/dama/mockup-model-front.png","hoodies/dama/mockup-model-back.png"] },
        { color: "Blanco", size: "M", design: "Corazón y amor", price: 135000, stock: 15, images: ["hoodies/dama/mockup-front.png","hoodies/dama/mockup-back.png","hoodies/dama/mockup-model-front.png","hoodies/dama/mockup-model-back.png"] },
        { color: "Blanco", size: "L", design: "Corazón y amor", price: 139000, stock: 10, images: ["hoodies/dama/mockup-front.png","hoodies/dama/mockup-back.png","hoodies/dama/mockup-model-front.png","hoodies/dama/mockup-model-back.png"] },

        // Estrellas - NEGRO
        { color: "Negro", size: "XS", design: "Estrellas", price: 132000, stock: 8, images: ["hoodies/dama/mockup-black-front.png","hoodies/dama/mockup-black-back.png","hoodies/dama/mockup-model-black-front.png","hoodies/dama/mockup-model-black-back.png"] },
        { color: "Negro", size: "S", design: "Estrellas", price: 135000, stock: 12, images: ["hoodies/dama/mockup-black-front.png","hoodies/dama/mockup-black-back.png","hoodies/dama/mockup-model-black-front.png","hoodies/dama/mockup-model-black-back.png"] },
        { color: "Negro", size: "M", design: "Estrellas", price: 135000, stock: 15, images: ["hoodies/dama/mockup-black-front.png","hoodies/dama/mockup-black-back.png","hoodies/dama/mockup-model-black-front.png","hoodies/dama/mockup-model-black-back.png"] },
        { color: "Negro", size: "L", design: "Estrellas", price: 139000, stock: 10, images: ["hoodies/dama/mockup-black-front.png","hoodies/dama/mockup-black-back.png","hoodies/dama/mockup-model-black-front.png","hoodies/dama/mockup-model-black-back.png"] },
        
        // AMOR Y UNIÓN - GRIS
        { color: "Gris", size: "XS", design: "Amor", price: 135000, stock: 6, images: ["hoodies/dama/mockup-grey-front.png","hoodies/dama/mockup-grey-back.png","hoodies/dama/mockup-model-grey-front.png","hoodies/dama/mockup-model-grey-back.png"] },
        { color: "Gris", size: "S", design: "Amor", price: 140000, stock: 10, images: ["hoodies/dama/mockup-grey-front.png","hoodies/dama/mockup-grey-back.png","hoodies/dama/mockup-model-grey-front.png","hoodies/dama/mockup-model-grey-back.png"] },
        { color: "Gris", size: "M", design: "Amor", price: 140000, stock: 12, images: ["hoodies/dama/mockup-grey-front.png","hoodies/dama/mockup-grey-back.png","hoodies/dama/mockup-model-grey-front.png","hoodies/dama/mockup-model-grey-back.png"] },
        { color: "Gris", size: "L", design: "Amor", price: 149000, stock: 8, images: ["hoodies/dama/mockup-grey-front.png","hoodies/dama/mockup-grey-back.png","hoodies/dama/mockup-model-grey-front.png","hoodies/dama/mockup-model-grey-back.png"] }
      ]
    },
    /* ==========================================
       HOODIE CABALLERO
    ========================================== */
    {
      id: 2,
      name: "Buzo con capota Hoodie Caballero",
      type: "physical",
      isVariable: true,
      category: ["Ropa"],
      description: "Este buzo abierto con capota, en silueta clásica, está diseñado para brindar confort superior en cualquier contexto. Su construcción ligera y funcional lo convierte en el aliado ideal para trabajar desde casa con total comodidad o para acompañarte en tus recorridos diarios mientras disfrutas cada momento del día.",
      price: 139000,
      stock: 0,
      images: ["hoodies/caballero/mockup-black-front.png","hoodies/caballero/mockup-black-back.png","hoodies/caballero/mockup-model-front.png","hoodies/caballero/mockup-model-back.png"],
      rating: 5,
      // 🆕 CONTACTO PARA PEDIDOS AL POR MAYOR
      contact: {
        message: "📦 ¿Pedidos al por mayor? ¡Contáctanos ahora mismo!",
        whatsapp: {
          number: "573174369474",
          text: "Hola, quiero información sobre pedidos al por mayor de Buzos hoodies"
        }
      },
      
      variations: [
        // PERRO DJOKY - NEGRO
        { color: "Negro", size: "XS", design: "Perro DJoky", price: 132000, stock: 8, images: ["hoodies/caballero/mockup-black-front.png","hoodies/caballero/mockup-black-back.png","hoodies/caballero/mockup-model-front.png","hoodies/caballero/mockup-model-back.png"] },
        { color: "Negro", size: "S", design: "Perro DJoky", price: 135000, stock: 12, images: ["hoodies/caballero/mockup-black-front.png","hoodies/caballero/mockup-black-back.png","hoodies/caballero/mockup-model-front.png","hoodies/caballero/mockup-model-back.png"] },
        { color: "Negro", size: "M", design: "Perro DJoky", price: 135000, stock: 15, images: ["hoodies/caballero/mockup-black-front.png","hoodies/caballero/mockup-black-back.png","hoodies/caballero/mockup-model-front.png","hoodies/caballero/mockup-model-back.png"] },
        { color: "Negro", size: "L", design: "Perro DJoky", price: 139000, stock: 10, images: ["hoodies/caballero/mockup-black-front.png","hoodies/caballero/mockup-black-back.png","hoodies/caballero/mockup-model-front.png","hoodies/caballero/mockup-model-back.png"] }
      ]
    }
  ];

  demoProducts.forEach(product => {
    if (!product.slug) {
      product.slug = slugify(product.name);
    }
  });  
  
  // CATEGORÍAS
  const categories = ["Tecnología", "Accesorios", "Hogar", "Software", "Productos Digitales", "Ropa", "Deportes"];
  
  // USUARIOS FAKE
  const demoUsers = [
    {
      email: "admin@test.com",
      password: "admin@test.com123456",
      name: "Administrador"
    }
  ];
  
  // PAISES Y CIUDADES
  const locations = {
    Colombia: ["Bogotá", "Medellín", "Cali", "Villavicencio", "Bucaramanga", "Cartagena", "Fusagasugá", "Envigado", "Manizales", "Pereira", "Envigado", "Santa Marta", "Valle de Buga", "Valle de Aburrá", "Valledupar", "Sabaneta", "Itagui", "Soacha", "Salamina", "Puerto López", "Rionegro", "Acacías", "Tocancipá", "Duitama", "Tabio", "Tenjo", "Ciudad Jardín", "Santa Fé de Antioquia", "Siberia", "Chía", "Cajicá", "Aguachica", "Aguazul", "Puerto Gaitán", "Granada", "Cúcuta", "Chocontá", "Chinacota"],
    México: ["CDMX", "Guadalajara", "Monterrey", "Tijuana", "Puerto Vallarta", "Cancun", "Puebla-Tlaxcala", "León", "Mérida", "Querétaro", "Chihuahua"],
    España: ["Madrid", "Barcelona", "Andalucía", "Sevilla", "Zaragoza", "Málaga", "Bilbao", "Palma", "Murcia", "Valencia"],
    Argentina: ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata", "San Miguel de Tucumán", "Mar del Plata", "Salta", "Santa Fé"],
    RepúblicaDominicana: ["Punta Cana", "La Romana", "Puerto Plata", "Puerto Santo Domingo", "Puerto Río Haina", "Puerto Caucedo", "Puerto Manzanillo"],
    PuertoRico: ["San Juan", "Bayamón", "Carolina", "Ponce", "Caguas", "Guaynabo", "Arecibo", "Mayagüez", "Trujillo Alto"]
  };
  
  // EXPORT SIMULADO
  const products =
    JSON.parse(localStorage.getItem("products")) || demoProducts;
