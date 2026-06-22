import { jwtDecode } from 'https://cdn.jsdelivr.net/npm/jwt-decode@4.0.0/+esm';
const token = sessionStorage.getItem('token');
const div = document.getElementById('dashboard');

function tablePurchases(username) {
    div.innerHTML = `
        <h1>Welcome ${username} (Customer)</h1>
        <table>
            <thead>
                <tr>
                    <th>ID Purchase</th>
                    <th>Customer</th>
                    <th>Items Products</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td colspan="5" class="cart-empty">No purchases recorded yet.</td>
                </tr>
            </tbody>
        </table>
    `;
}

function crudProducts(username) {
    div.innerHTML = `
        <h1>Welcome ${username} (Admin)</h1>
        
        <div class="crud-actions">
            <button type="button" id="btn-mode-create">Mode: Add New</button>
            <button type="button" id="btn-mode-update">Mode: Update Selected</button>
            <button type="button" id="btn-delete">Delete Selected</button>
            <button type="button" id="btn-clear">Clear Form</button>
        </div>

        <div class="crud-layout">
            
            <div class="crud-form-side">
                <form class="form" id="form-product" enctype="multipart/form-data" onsubmit="return false;">
                    <div class="form-group">
                      <label for="inputId">ID (Read Only)</label>
                      <input type="number" id="inputId" name="id" placeholder="ID automatically" readonly>
                    </div>

                    <div class="form-group">
                      <label for="inputImage">Image Product</label>
                      <input type="file" id="inputImage" name="image" accept="image/*">
                    </div>

                    <div class="form-group">
                      <label for="inputCategory">Select Category</label>
                      <select id="inputCategory" name="category" required>
                        <option value="" selected disabled>Select the category</option>
                        <option value="men">Men</option>
                        <option value="women">Women</option>
                      </select>
                    </div>

                    <div class="form-group">
                      <label for="inputName">Product Name</label>
                      <input type="text" id="inputName" name="name" placeholder="Enter product name" required>
                    </div>

                    <div class="form-group">
                      <label for="inputDescription">Description</label>
                      <input type="text" id="inputDescription" name="description" placeholder="Enter product description" required>
                    </div>
                    
                    <div class="form-group">
                      <label for="inputSize">Size (Ej: 38,39,40)</label>
                      <input type="text" id="inputSize" name="size" placeholder="Enter sizes separated by commas" required>
                    </div>
                    
                    <div class="form-group">
                      <label for="inputPrice">Price</label>
                      <input type="number" id="inputPrice" name="price" placeholder="Enter product price" required>
                    </div>

                    <button type="button" id="btn-submit-crud">Save Product</button>
                </form>
            </div>

            <div class="crud-table-side">
                <h3>List of Products Availables</h3>
                <div id="products-table-container" class="products-table-scroll">Loading products...</div>
            </div>

        </div>
    `;

    const form = document.getElementById('form-product');
    const btnSubmit = document.getElementById('btn-submit-crud');
    const btnDelete = document.getElementById('btn-delete');
    const btnClear = document.getElementById('btn-clear');
    
    const modeCreate = document.getElementById('btn-mode-create');
    const modeUpdate = document.getElementById('btn-mode-update');

    let currentMode = 'CREATE'; 
    updateMode();

    modeCreate.addEventListener('click', () => { currentMode = 'CREATE'; updateMode(); form.reset(); });
    modeUpdate.addEventListener('click', () => { currentMode = 'UPDATE'; updateMode(); });
    btnClear.addEventListener('click', () => { form.reset(); document.getElementById('inputId').value = ''; });

    function updateMode() {
        if (currentMode === 'CREATE') {
            btnSubmit.innerText = "Add Product (POST)";
            modeCreate.outline = "2px solid var(--color-text)";
        } else {
            btnSubmit.innerText = "Update Product (PUT/POST)";
        }
    }

    // Create or update product
    btnSubmit.addEventListener('click', async () => {
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData(form);
        const url = '/api/products'; 

        const method = currentMode === 'CREATE' ? 'POST' : 'PUT';

        if (currentMode === 'UPDATE') {
            const imageInput = document.getElementById('inputImage');
            
            if (!imageInput || !imageInput.files || imageInput.files.length === 0) {
                formData.delete('image');
            }
            
            const idInput = document.getElementById('inputId').value;
            if (idInput) {
                formData.set('id', idInput);
            }
        }

        try {
            const response = await fetch(url, {
                method: method,
                body: formData 
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                form.reset();
                document.getElementById('inputId').value = '';
                currentMode = 'CREATE';
                updateMode();
                await loadProducts(); 
            } else {
                alert("Error: " + result.error);
            }
        } catch (error) {
            console.error("Error in CRUD request: ", error);
            alert("Could not connect to the server.");
        }
    });

    // Delete product
    btnDelete.addEventListener('click', async () => {
        const idInput = document.getElementById('inputId').value;
        if (!idInput) {
            alert("Please select a product from the right list to be able to delete it.");
            return;
        }

        if (!confirm(`Do you want to delete the product with ID: ${idInput}?`)) return;

        const formData = new FormData();
        formData.append("id", idInput);

        try {
            const response = await fetch('/api/products', {
                method: 'DELETE',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                form.reset();
                document.getElementById('inputId').value = '';
                currentMode = 'CREATE';
                updateMode();
                await loadProducts();
            } else {
                alert("Error: " + result.error);
            }
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    });

    // Load products table
    async function loadProducts() {
        const container = document.getElementById('products-table-container');
        try {
            const response = await fetch('/api/products'); 
            const data = await response.json();

            if (!response.ok || !data.products) {
                container.innerHTML = `<p class="form-hint">Error loading products.</p>`;
                return;
            }

            if (data.products.length === 0) {
                container.innerHTML = `<p class="cart-empty">No products registered.</p>`;
                return;
            }

            let htmlTable = `
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Category</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            data.products.forEach(prod => {
                htmlTable += `
                    <tr>
                        <td><strong>${prod.id}</strong></td>
                        <td>${prod.category}</td>
                        <td>${prod.name}</td>
                        <td>$${prod.price}</td>
                        <td>
                            <button type="button" class="btn-select-prod"
                                data-id="${prod.id}" 
                                data-category="${prod.category}" 
                                data-name="${prod.name}" 
                                data-description="${prod.description}" 
                                data-size="${prod.size || ''}" 
                                data-price="${prod.price}">
                                Select
                            </button>
                        </td>
                    </tr>
                `;
            });

            htmlTable += `</tbody></table>`;
            container.innerHTML = htmlTable;

            document.querySelectorAll('.btn-select-prod').forEach(button => {
                button.addEventListener('click', (e) => {
                    const btn = e.target;
                    
                    document.getElementById('inputId').value = btn.getAttribute('data-id');
                    document.getElementById('inputCategory').value = btn.getAttribute('data-category');
                    document.getElementById('inputName').value = btn.getAttribute('data-name');
                    document.getElementById('inputDescription').value = btn.getAttribute('data-description');
                    document.getElementById('inputSize').value = btn.getAttribute('data-size');
                    document.getElementById('inputPrice').value = btn.getAttribute('data-price');

                    currentMode = 'UPDATE';
                    updateMode();
                });
            });

        } catch (error) {
            console.error("Error loading products:", error);
            container.innerHTML = `<p class="form-hint">Error loading products.</p>`;
        }
    }

    loadProducts();
}

// Control of session access
if (!token) {
    alert("You don't have permission to access this page. Login to continue");
    window.location.href = '/src/pages/login.html';
} else {
    try {
        const decoded = jwtDecode(token);
        console.log("Token decoded successfully:", decoded);
        
        if (div) {
            if (decoded.type === 0) {
                tablePurchases(decoded.username || 'Customer');
            } else if (decoded.type === 1) {
                crudProducts(decoded.username || 'Admin');   
            }
        }
    } catch (error) {
        console.error("Error decoding the token:", error);
        sessionStorage.removeItem('token');
        window.location.href = '/src/pages/login.html';
    }
}