let productMap = new Map();
let cartItems = (JSON.parse(localStorage.getItem("cartItems")) || []).map(String);
let lastPurchaseResult = null;

const DOM = {
  list: document.getElementById("cart-items"),
  count: document.getElementById("cart-count"),
  price: document.getElementById("cart-total-price"),
  modal: document.getElementById("cart-modal"),
  btnCart: document.getElementById("cart-btn"),
  btnClose: document.getElementById("cart-close-btn"),
  btnInvoice: document.getElementById("invoice-btn"),
  productGrid: document.getElementById("product-list"),
  checkoutBtn: document.getElementById("checkout-btn")
};

function syncCartUI(shouldRender = true) {
  localStorage.setItem("cartItems", JSON.stringify(cartItems));
  if (DOM.count) DOM.count.textContent = cartItems.length;
  
  const total = cartItems.reduce((acc, id) => {
    const p = productMap.get(id);
    return acc + (p?.price ? Number(p.price) : 0);
  }, 0);
  
  if (DOM.price) DOM.price.textContent = total.toFixed(2);
  
  if (!shouldRender || !DOM.list) return;
  if (!cartItems.length) {
    DOM.list.innerHTML = `<li class="cart-empty">Your cart is empty.</li>`;
    return;
  }
  
  DOM.list.innerHTML = cartItems.map(id => {
    const p = productMap.get(id);
    return p ? `
    <li class="cart-item">
      <img src="../images/${p.img}" alt="${p.name}" loading="lazy" />
      <div class="cart-item-info"><h4>${p.name}</h4><span>$${Number(p.price).toFixed(2)}</span></div>
      <button class="cart-item-remove" data-id="${p.id}">Remove</button>
    </li>` : '';
  }).join('');
}

function renderStoreProducts() {
  if (!DOM.productGrid) return;
  if (productMap.size === 0) {
    DOM.productGrid.innerHTML = `<p>No products available at the moment.</p>`;
    return;
  }
  
  let html = '';
  productMap.forEach(p => {
    html += `
    <div class="product-card">
      <img src="../images/${p.img}" alt="${p.name}" loading="lazy" />
      <div class="product-card-info">
        <p>${p.name}</p><p>${p.description}</p><p>$${Number(p.price).toFixed(2)}</p>
        <button class="btn-add-to-cart" data-id="${p.id}">Add <i class="fa-solid fa-cart-plus"></i></button>
      </div>
    </div>`;
  });
  DOM.productGrid.innerHTML = html;
}

DOM.productGrid?.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-add-to-cart');
  if (btn) addToCart(btn.dataset.id);
});

DOM.list?.addEventListener('click', (e) => {
  const btn = e.target.closest('.cart-item-remove');
  if (btn) removeFromCart(btn.dataset.id);
});

const toggleCart = (open) => {
  if (!DOM.modal) return;
  if (open) syncCartUI();
  DOM.modal.classList.toggle("active", open);
  DOM.modal.setAttribute("aria-hidden", !open);
};

function addToCart(productId) { 
  cartItems.push(String(productId).trim()); 
  syncCartUI(); 
}

function removeFromCart(productId) {
  const idx = cartItems.findIndex(id => id === String(productId).trim());
  if (idx !== -1) { 
    cartItems.splice(idx, 1); 
    syncCartUI(); 
  }
}

const checkAuth = () => {
  const token = sessionStorage.getItem('token');
  const customer = sessionStorage.getItem('username');
  const id_customer = sessionStorage.getItem('id_customer');
  return (token && customer && id_customer) ? { id_customer, customer, token } : null;
};

DOM.btnCart?.addEventListener("click", () => toggleCart(true));
DOM.btnClose?.addEventListener("click", () => toggleCart(false));
DOM.checkoutBtn?.addEventListener("click", clearCart);
document.addEventListener("click", (e) => e.target === DOM.modal && toggleCart(false));
document.addEventListener("keydown", (e) => e.key === "Escape" && toggleCart(false));

DOM.btnInvoice?.addEventListener("click", async () => {
  const user = checkAuth();
  if (!user) return alert("Please log in.");

  if (lastPurchaseResult?.id_purchase) {
    return downloadInvoiceFromAPI(lastPurchaseResult.id_purchase);
  }

  try {
    const res = await fetch(`/api/purchases/latest?id_customer=${user.id_customer}`, {
      headers: { 'Authorization': `Bearer ${user.token}` }
    });
    
    const data = await res.json();
    if (res.ok && data.id_purchase) {
      downloadInvoiceFromAPI(data.id_purchase);
    } else {
      alert("No purchases found.");
    }
  } catch (error) {
    alert("Error connecting to server.");
  }
});

async function clearCart() {
  if (!cartItems.length) return alert("Your cart is already empty.");
  
  const user = checkAuth();
  if (!user) {
    alert("Please log in to complete your purchase. Your cart items will be saved!");
    window.location.href = '/src/pages/login.html';
    return;
  }
  
  if (!confirm(`Proceed to checkout with ${cartItems.length} item(s)?`)) return;
  
  const orderItems = cartItems.reduce((acc, id) => {
    const p = productMap.get(id);
    if (p) acc.push({ id_product: p.id, name: p.name, price: Number(p.price) });
    return acc;
  }, []);
  
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
    
    lastPurchaseResult = result;
    alert(result.message || "Thank you for your purchase!");

    if (confirm("Download invoice now?")) downloadInvoiceFromAPI(result.id_purchase);
    
    cartItems.length = 0;
    syncCartUI();
    toggleCart(false);
  } catch (error) {
    console.error("Error connecting to purchase API:", error);
    alert("Could not connect to the server. Please try again.");
  }
}

async function downloadInvoiceFromAPI(purchaseId) {
  const user = checkAuth();
  if (!user) return alert("Authentication required.");

  try {
    const response = await fetch(`/api/purchases/invoice?id=${purchaseId}&id_customer=${user.id_customer}`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${user.token}` 
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Server error");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_${purchaseId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (error) {
    console.error("Download failed:", error);
    alert("Could not download the official invoice. Please try again.");
  }
}

async function init() {
  try {
    const res = await fetch('/api/products');
    const data = await res.json();
    const productArray = data.products || data || [];
    
    productArray.forEach(p => {
      productMap.set(String(p.id).trim(), { 
        ...p, 
        img: p.image_url ? p.image_url.split('/').pop() : '' 
      });
    });

    renderStoreProducts(); 
    syncCartUI();
  } catch (err) { 
    console.error("Error fetching products:", err); 
  }
}

init();