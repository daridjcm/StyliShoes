// Global Variables
let products = [];
const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
const cartList = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const priceElement = document.getElementById("cart-total-price");

// Buttons
const btnCart = document.getElementById("cart-btn");
const btnClear = document.getElementById("checkout-btn");
const btnInvoice = document.getElementById("invoice-btn"); // NOTE: Not implemented yet

// Modal Cart
function openCart() {
  document.getElementById("cartModal")?.classList.add("active");
}

function closeCart() {
  document.getElementById("cartModal")?.classList.remove("active");
}

btnCart?.addEventListener("click", () => {
  renderCartItems();
  openCart();
});

btnClear?.addEventListener("click", () => {
  clearCart();
});

btnInvoice?.addEventListener("click", () => {
  downloadInvoice();
});

// Cart Functions
function updateCartCount() {
  if (cartCount) {
    cartCount.textContent = cartItems.length;
  }
}
updateCartCount();

function updateTotalPrice() {
  let totalPrice = 0;
  if (!priceElement) return;
  
  cartItems.forEach((productId) => {
    const product = products.find((p) => String(p.id) === String(productId));
    if (!product) return;
    
    totalPrice += product.price;
  });
  priceElement.innerHTML = totalPrice;
}
updateTotalPrice();

function addToCart(productId) {
  cartItems.push(productId);
  localStorage.setItem("cartItems", JSON.stringify(cartItems));
  updateCartCount();
  updateTotalPrice();
}

function removeFromCart(productId) {
  const index = cartItems.findIndex((id) => String(id) === String(productId));

  if (index !== -1) {
    cartItems.splice(index, 1);
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }
  updateCartCount();
  renderCartItems();
  updateTotalPrice();
}

function downloadInvoice() {
  // TODO: Implement download functionality in text format
  alert("Invoice download not implemented yet.");
}

function clearCart() {
  if (cartItems.length === 0) {
    return alert("Your cart is already empty.");
  } else {
    if (confirm("Buy all products?")) {
      cartItems.splice(0, cartItems.length);
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
      updateCartCount();
      renderCartItems();
      updateTotalPrice();
      downloadInvoice();
    }
  }
}

function renderCartItems() {
  if (!cartList) return;
  cartList.innerHTML = "";
    
  if (cartItems.length === 0) {
    cartList.innerHTML = "<li>Your cart is empty.</li>";
    return;
  }
  
  cartItems.forEach((productId) => {
    const product = products.find((p) => String(p.id) === String(productId));
    if (!product) return;
    const cartItem = document.createElement("li");
    cartItem.innerHTML = `
    <div class="cart-item">
      <img src="./images/${product.image}" alt="${product.name}" />

      <div class="cart-item-info">
        <h4>${product.name}</h4>
        <span>$${product.price}</span>
      </div>
      <button onclick="removeFromCart('${product.id}')">
        Remove
      </button>
    </div>
  `;  
  cartList.appendChild(cartItem);
  });
  updateTotalPrice();
}