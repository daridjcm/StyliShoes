const btnProducts = document.getElementById("btn-products");
const btnContact = document.getElementById("btn-about");

btnProducts?.addEventListener("click", () => {
  window.location.href = "./src/pages/products.html";
});

btnContact?.addEventListener("click", () => {
  window.location.href = "./src/pages/aboutUS.html";
});

// Fetch Products
async function fetchProducts() {
  try {
    const response = await fetch("./products.json");

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}



// Render Products
function renderProducts(data) {
  const productList = document.getElementById("product-list");
  
  if (!productList) return;

  productList.innerHTML = "";

  products = Array.isArray(data) ? data : data.products || [];

  products.forEach((product) => {
    const productItem = document.createElement("div");
    productItem.classList.add("product-card");
    
    productItem.innerHTML = `
    <img src="./images/${product.image}" alt="${product.name}">
    
    <div class="product-card-info">
    <p>${product.name}</p>
    <p>${product.description}</p>
    <p><strong>Price:</strong> $${product.price}</p>
    <p><strong>Sizes:</strong> ${product.size.join(", ")}</p>
    
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
    console.log(data);
    renderProducts(data);
  });
}