let products = [];
const cartItems = (JSON.parse(localStorage.getItem("cartItems")) || []).map(String);

const DOM = {
  list: document.getElementById("cart-items"),
  count: document.getElementById("cart-count"),
  price: document.getElementById("cart-total-price"),
  modal: document.getElementById("cart-modal"),
  btnCart: document.getElementById("cart-btn"),
  btnClose: document.getElementById("cart-close-btn"),
  productGrid: document.getElementById("product-list") 
};

const findProd = (id) => {
  const p = products.find(prod => String(prod.id).trim() === String(id).trim());
  return p ? { ...p, img: p.image_url ? p.image_url.split('/').pop() : '' } : null;
};

function syncCartUI(shouldRender = true) {
  localStorage.setItem("cartItems", JSON.stringify(cartItems));
  if (DOM.count) DOM.count.textContent = cartItems.length;

  const total = cartItems.reduce((acc, id) => acc + (findProd(id)?.price ? Number(findProd(id).price) : 0), 0);
  if (DOM.price) DOM.price.textContent = total.toFixed(2);

  if (!shouldRender || !DOM.list) return;
  if (!cartItems.length) return DOM.list.innerHTML = `<li class="cart-empty">Your cart is empty.</li>`;

  DOM.list.innerHTML = cartItems.map(id => {
    const p = findProd(id);
    return p ? `
      <li class="cart-item">
        <img src="../images/${p.img}" alt="${p.name}" />
        <div class="cart-item-info"><h4>${p.name}</h4><span>$${Number(p.price).toFixed(2)}</span></div>
        <button class="cart-item-remove" data-id="${p.id}">Remove</button>
      </li>` : '';
  }).join('');

  DOM.list.querySelectorAll('.cart-item-remove').forEach(b => b.addEventListener('click', () => removeFromCart(b.dataset.id)));
}

function renderStoreProducts() {
  if (!DOM.productGrid) return;
  if (!products.length) return DOM.productGrid.innerHTML = `<p>No products available at the moment.</p>`;

  DOM.productGrid.innerHTML = products.map(p => {
    const img = p.image_url ? p.image_url.split('/').pop() : '';
    return `
      <div class="product-card">
        <img src="../images/${img}" alt="${p.name}" />
        <div class="product-card-info">
          <p>${p.name}</p><p>${p.description}</p><p>$${Number(p.price).toFixed(2)}</p>
          <button class="btn-add-to-cart" data-id="${p.id}">Add <i class="fa-solid fa-cart-plus"></i></button>
        </div>
      </div>`;
  }).join('');

  DOM.productGrid.querySelectorAll('.btn-add-to-cart').forEach(b => b.addEventListener('click', () => addToCart(b.dataset.id)));
}

const toggleCart = (open) => {
  if (!DOM.modal) return;
  if (open) syncCartUI();
  DOM.modal.classList.toggle("active", open);
  DOM.modal.setAttribute("aria-hidden", !open);
};

DOM.btnCart?.addEventListener("click", () => toggleCart(true));
DOM.btnClose?.addEventListener("click", () => toggleCart(false));
document.getElementById("checkout-btn")?.addEventListener("click", clearCart);
document.getElementById("invoice-btn")?.addEventListener("click", downloadInvoice);
document.addEventListener("click", (e) => e.target === DOM.modal && toggleCart(false));
document.addEventListener("keydown", (e) => e.key === "Escape" && toggleCart(false));

function addToCart(productId) { cartItems.push(String(productId).trim()); syncCartUI(); }

function removeFromCart(productId) {
  const idx = cartItems.findIndex(id => id.trim() === String(productId).trim());
  if (idx !== -1) { cartItems.splice(idx, 1); syncCartUI(); }
}

// Helper rápido para verificar la sesión de forma limpia
const checkAuth = () => {
  const token = sessionStorage.getItem('token');
  const customer = sessionStorage.getItem('username');
  const id_customer = sessionStorage.getItem('id_customer');
  return (token && customer && id_customer) ? { id_customer, customer, token } : null;
};

async function clearCart() {
  if (!cartItems.length) return alert("Your cart is already empty.");

  const user = checkAuth();
  
  if (!user) {
    alert("Please log in to complete your purchase. Your cart items will be saved!");
    window.location.href = '/src/pages/login.html';
    return;
  }

  if (!confirm(`Proceed to checkout with ${cartItems.length} item(s)?`)) return;

  const orderItems = cartItems
    .map(id => {
      const p = findProd(id);
      return p ? { id_product: p.id, name: p.name, price: Number(p.price) } : null;
    })
    .filter(Boolean);

  const totalOrder = orderItems.reduce((acc, item) => acc + item.price, 0);

  try {
    const response = await fetch('/api/purchases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify({
        id_customer: user.id_customer,
        customer: user.customer,      
        items: orderItems,
        total: totalOrder
      })
    });

    const result = await response.json();
    if (!response.ok) return alert("Error processing purchase: " + result.error);

    alert(result.message || "Thank you for your purchase!");
    cartItems.length = 0;
    syncCartUI();
    toggleCart(false);

  } catch (error) {
    console.error("Error connecting to purchase API:", error);
    alert("Could not connect to the server. Please try again.");
  }
}

function downloadInvoice() {
  alert(cartItems.length ? "Invoice download feature coming soon!" : "Your cart is empty. Add items before downloading an invoice.");
}

async function init() {
  try {
    const res = await fetch('/api/products');
    const data = await res.json();
    products = data.products || data || [];
    renderStoreProducts(); syncCartUI();
  } catch (err) { console.error("Error fetching products:", err); }
}

init();