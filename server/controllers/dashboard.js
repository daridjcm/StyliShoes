import { jwtDecode } from 'https://cdn.jsdelivr.net/npm/jwt-decode@4.0.0/+esm';
const token = sessionStorage.getItem('token');
const div = document.getElementById('dashboard');

async function tablePurchases(username) {
  try {
    const response = await fetch('/api/purchases');
    const data = await response.json();
    const purchases = data.purchases || data.orders || data || [];
    console.log("Compras recibidas del servidor:", purchases);

    if (!response.ok) {
      return div.innerHTML = `<h1>Welcome ${username} (Customer)</h1><p class="form-hint">Error loading purchases.</p>`;
    }

    const tbodyContent = purchases.length 
      ? purchases.map(p => {
          // Generamos una lista ordenada/desordenada limpia para los productos y sus precios
          let itemsHTML = '<span class="text-muted">No products listed</span>';
          
          if (Array.isArray(p.items) && p.items.length > 0) {
            itemsHTML = `
              <ul class="purchase-items-list" style="list-style: none; padding: 0; margin: 0; text-align: left;">
                ${p.items.map(i => {
                  const name = i.name || i.product_name || 'Unknown Product';
                  const price = i.price || i.item_price || 0;
                  return `
                    <li style="margin-bottom: 0.25rem; font-size: 0.9rem;">
                      • ${name} <span style="color: var(--color-text-secondary, #666); font-weight: 500;">($${Number(price).toFixed(2)})</span>
                    </li>`;
                }).join('')}
              </ul>`;
          }

          return `
            <tr>
              <td><strong>#${p.id_purchase || p.id}</strong></td>
              <td>${p.id_customer || 'N/A'}</td>
              <td>${p.customer}</td>
              <td>${itemsHTML}</td>
              <td>${p.date ? new Date(p.date).toLocaleDateString() : 'N/A'}</td>
              <td><strong>$${Number(p.total).toFixed(2)}</strong></td>
              <td><span class="status-${String(p.status).toLowerCase()}">${p.status}</span></td>
            </tr>`;
        }).join('')
      : `<tr><td colspan="7" class="cart-empty">No purchases recorded yet.</td></tr>`;

    div.innerHTML = `
      <h1>Welcome ${username} (Customer)</h1>
      <table>
        <thead>
          <tr>
            <th>ID Purchase</th>
            <th>ID Customer</th>
            <th>Customer</th>
            <th>Items Products</th>
            <th>Date</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>${tbodyContent}</tbody>
      </table>`;

  } catch (error) {
    console.error("Error loading purchases table:", error);
    if (div) div.innerHTML = `<p class="form-hint">Could not connect to the server.</p>`;
  }
}

function crudProducts(username) {
  div.innerHTML = `
    <h1>Welcome ${username} (Admin)</h1>
    <div class="crud-actions">
      <button type="button" id="btn-mode-create" class="crud-mode-btn"><i class="fa-solid fa-user-pen"></i> Add Product <i class="fa-solid fa-square-plus"></i></button>
      <button type="button" id="btn-mode-update" class="crud-mode-btn"><i class="fa-solid fa-user-pen"></i> Update Product <i class="fa-solid fa-floppy-disk"></i></button>
      <button type="button" id="btn-delete"><i class="fa-solid fa-user-pen"></i> Delete Product <i class="fa-solid fa-trash"></i></button>
      <button type="button" id="btn-clear">Clear Form</button>
    </div>
    <div class="crud-layout">
      <div class="crud-form-side">
        <form class="form" id="form-product" enctype="multipart/form-data" onsubmit="return false;">
          <div class="form-group"><label for="inputId">ID (Read Only)</label><input type="number" id="inputId" name="id" placeholder="ID automatically" readonly></div>
          <div class="form-group"><label for="inputImage">Image Product</label><input type="file" id="inputImage" name="image" accept="image/*"></div>
          <div class="form-group">
            <label for="inputCategory">Select Category</label>
            <select id="inputCategory" name="category" required>
              <option value="" selected disabled>Select the category</option>
              <option value="men">Men</option><option value="women">Women</option>
            </select>
          </div>
          <div class="form-group"><label for="inputName">Product Name</label><input type="text" id="inputName" name="name" required></div>
          <div class="form-group"><label for="inputDescription">Description</label><input type="text" id="inputDescription" name="description" required></div>
          <div class="form-group"><label for="inputSize">Size (Ej: 38,39,40)</label><input type="text" id="inputSize" name="size" required></div>
          <div class="form-group"><label for="inputPrice">Price</label><input type="number" id="inputPrice" name="price" required></div>
          <button type="button" id="btn-submit-crud"></button>
        </form>
      </div>
      <div class="crud-table-side">
        <h3>List of Products Available</h3>
        <div id="products-table-container" class="products-table-scroll">Loading products...</div>
      </div>
    </div>`;

  const form = document.getElementById('form-product');
  const idInput = document.getElementById('inputId');
  const btnSubmit = document.getElementById('btn-submit-crud');
  const container = document.getElementById('products-table-container');
  
  const btnCreate = document.getElementById('btn-mode-create');
  const btnUpdate = document.getElementById('btn-mode-update');
  let currentMode = 'CREATE';

  const setMode = (mode) => {
    currentMode = mode;
    btnSubmit.innerText = mode === 'CREATE' ? "Add New Product" : "Update Product";
    
    btnCreate.classList.remove('active-mode');
    btnUpdate.classList.remove('active-mode');

    if (mode === 'CREATE') btnCreate.classList.add('active-mode');
    if (mode === 'UPDATE') btnUpdate.classList.add('active-mode');
  };
  
  const resetCrud = () => {
    form.reset();
    idInput.value = '';
    setMode('CREATE');
  };

  setMode('CREATE');

  document.getElementById('btn-mode-create').addEventListener('click', resetCrud);
  document.getElementById('btn-mode-update').addEventListener('click', () => setMode('UPDATE'));
  document.getElementById('btn-clear').addEventListener('click', () => { form.reset(); idInput.value = ''; });

  // Helper to make HTTP requests
  async function apiRequest(method, body, isDelete = false) {
    try {
      const response = await fetch('/api/products', { method, body });
      const result = await response.json();
      if (!response.ok) return alert("Error: " + result.error);

      alert(result.message);
      resetCrud();
      await loadProducts();
    } catch (err) {
      console.error(err);
      alert("Could not connect to the server.");
    }
  }

  // Save / Update
  btnSubmit.addEventListener('click', async () => {
    if (!form.checkValidity()) return form.reportValidity();

    const formData = new FormData(form);
    if (currentMode === 'UPDATE') {
      const img = document.getElementById('inputImage');
      if (!img?.files?.length) formData.delete('image');
      if (idInput.value) formData.set('id', idInput.value);
    }
    await apiRequest(currentMode === 'CREATE' ? 'POST' : 'PUT', formData);
  });

  // Delete
  document.getElementById('btn-delete').addEventListener('click', async () => {
    if (!idInput.value) return alert("Please select a product from the right list to be able to delete it.");
    if (!confirm(`Do you want to delete the product with ID: ${idInput.value}?`)) return;

    const formData = new FormData();
    formData.append("id", idInput.value);
    await apiRequest('DELETE', formData);
  });

  // Load Table
  async function loadProducts() {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (!response.ok || !data.products) return container.innerHTML = `<p class="form-hint">Error loading products.</p>`;
      if (!data.products.length) return container.innerHTML = `<p class="cart-empty">No products registered.</p>`;

      container.innerHTML = `
        <table>
          <thead><tr><th>ID</th><th>Category</th><th>Name</th><th>Price</th><th>Action</th></tr></thead>
          <tbody>
            ${data.products.map(p => `
              <tr>
                <td><strong>${p.id}</strong></td><td>${p.category}</td><td>${p.name}</td><td>$${p.price}</td>
                <td>
                  <button type="button" class="btn-select-prod" data-prod='${JSON.stringify(p)}'>Select</button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>`;

      container.querySelectorAll('.btn-select-prod').forEach(btn => {
        btn.addEventListener('click', () => {
          const p = JSON.parse(btn.getAttribute('data-prod'));
          idInput.value = p.id;
          document.getElementById('inputCategory').value = p.category;
          document.getElementById('inputName').value = p.name;
          document.getElementById('inputDescription').value = p.description;
          document.getElementById('inputSize').value = p.size || '';
          document.getElementById('inputPrice').value = p.price;
          setMode('UPDATE');
        });
      });
    } catch (err) {
      console.error(err);
      container.innerHTML = `<p class="form-hint">Error loading products.</p>`;
    }
  }

  loadProducts();
}

// Session control
if (!token) {
  alert("You don't have permission to access this page. Login to continue");
  window.location.href = '/src/pages/login.html';
} else {
  try {
    const decoded = jwtDecode(token);
    if (div) decoded.type === 1 ? crudProducts(decoded.username || 'Admin') : tablePurchases(decoded.username || 'Customer');
  } catch {
    sessionStorage.removeItem('token');
    window.location.href = '/src/pages/login.html';
  }
}