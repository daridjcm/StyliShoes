const btnProducts = document.getElementById("btn-products");
const btnContact = document.getElementById("btn-about");

btnProducts?.addEventListener("click", () => {
  window.location.href = "./src/pages/products.html";
});

btnContact?.addEventListener("click", () => {
  window.location.href = "./src/pages/aboutUS.html";
});

async function fetchProducts() {
  try {
    const response = await fetch("/api/products");

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

function renderProducts(data) {
  const productList = document.getElementById("product-list");
  
  if (!productList) return;

  productList.innerHTML = "";

  const productsListToRender = Array.isArray(data) ? data : (data.products || []);

  productsListToRender.forEach((product) => {
    const productItem = document.createElement("div");
    productItem.classList.add("product-card");
    
    const sizesArray = typeof product.size === 'string' 
      ? product.size.split(',') 
      : (Array.isArray(product.size) ? product.size : []);

    const imageSource = product.image_url ? product.image_url : `/src/images/${product.image}`;
    
    productItem.innerHTML = `
      <img src="${imageSource}" alt="${product.name}">
      
      <div class="product-card-info">
        <p>${product.name}</p>
        <p>${product.description}</p>
        <p><strong>Price:</strong> $${product.price}</p>
        <p><strong>Sizes:</strong> ${sizesArray.join(", ")}</p>
        
        <button onclick="addToCart('${product.id}')">
          Add to Cart
        </button>
      </div>
    `;
    productList.appendChild(productItem);
  });
}

if (window.location.pathname.includes("products.html")) {
  fetchProducts().then(data => {
    renderProducts(data);
  });
}