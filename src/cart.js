// Global Variables
let products = [];
const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
const cartList = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const priceElement = document.getElementById("cart-total-price");

// DOM Elements
const btnCart = document.getElementById("cart-btn");
const btnCheckout = document.getElementById("checkout-btn");
const btnInvoice = document.getElementById("invoice-btn");

// ===== Modal Functions =====
function openCart() {
  const cartModal = document.getElementById("cart-modal");
  if (cartModal) {
    renderCartItems();
    cartModal.classList.add("active");
    cartModal.setAttribute("aria-hidden", "false");
  }
}

function closeCart() {
  const cartModal = document.getElementById("cart-modal");
  if (cartModal) {
    cartModal.classList.remove("active");
    cartModal.setAttribute("aria-hidden", "true");
  }
}

// Close modal when clicking outside
document.addEventListener("click", (event) => {
  const cartModal = document.getElementById("cart-modal");
  if (cartModal?.classList.contains("active") && event.target === cartModal) {
    closeCart();
  }
});

// Close modal on Escape key
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCart();
  }
});

// ===== Event Listeners =====
btnCart?.addEventListener("click", openCart);
btnCheckout?.addEventListener("click", clearCart);
btnInvoice?.addEventListener("click", downloadInvoice);

// ===== Cart Functions =====
function updateCartCount() {
  if (cartCount) {
    cartCount.textContent = cartItems.length;
  }
}

function updateTotalPrice() {
  let totalPrice = 0;
  if (!priceElement) return;

  cartItems.forEach((productId) => {
    const product = products.find((p) => String(p.id) === String(productId));
    if (product) {
      totalPrice += product.price;
    }
  });

  priceElement.textContent = totalPrice.toFixed(2);
}

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
    updateCartCount();
    renderCartItems();
    updateTotalPrice();
  }
}

function downloadInvoice() {
  if (cartItems.length === 0) {
    alert("Your cart is empty. Add items before downloading an invoice.");
    return;
  }
  // TODO: Implement invoice PDF generation
  alert("Invoice download feature coming soon!");
}

function clearCart() {
  if (cartItems.length === 0) {
    alert("Your cart is already empty.");
    return;
  }

  if (confirm(`Proceed to checkout with ${cartItems.length} item(s)?`)) {
    cartItems.splice(0, cartItems.length);
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    updateCartCount();
    renderCartItems();
    updateTotalPrice();
    closeCart();
    alert("Thank you for your purchase!");
  }
}

function renderCartItems() {
  if (!cartList) return;
  cartList.innerHTML = "";

  if (cartItems.length === 0) {
    cartList.innerHTML = `<li class="cart-empty">Your cart is empty.</li>`;
    return;
  }

  cartItems.forEach((productId) => {
    const product = products.find((p) => String(p.id) === String(productId));
    if (!product) return;

    const cartItem = document.createElement("li");
    cartItem.className = "cart-item";
    cartItem.innerHTML = `
      <img src="./images/${product.image}" alt="${product.name}" />
      <div class="cart-item-info">
        <h4>${product.name}</h4>
        <span>$${product.price.toFixed(2)}</span>
      </div>
      <button 
        class="cart-item-remove"
        onclick="removeFromCart('${product.id}')"
        aria-label="Remove ${product.name} from cart"
      >
        Remove
      </button>
    `;
    cartList.appendChild(cartItem);
  });

  updateTotalPrice();
}

// ===== Initialize =====
updateCartCount();
updateTotalPrice();
renderCartItems();