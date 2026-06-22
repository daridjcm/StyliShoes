import { jwtDecode } from 'https://cdn.jsdelivr.net/npm/jwt-decode@4.0.0/+esm';
const token = sessionStorage.getItem('token');
const div = document.getElementById('dashboard');

function tablePurchases() {
    const table = document.createElement('table');
    div.appendChild(table);
    table.innerHTML = `
        <table>
            <tbody>
                <tr>
                    <td>ID Purchase</td>
                    <td>Items Products</td>
                    <td>Date</td>
                    <td>Total</td>
                    <td>Status</td>
                </tr>

            </tbody>
        </table>
    `;

}

function crudProducts() {
    const form = document.createElement('form');
    // Add selection to CRUD (add, delete, modify and search)
    div.appendChild(form);
    form.innerHTML = `
        <div class="form-group">
          <label for="inputImage">Image Product</label>
          <input type="file" id="inputImage" name="image" accept="image/*">
        </div>
        
        <div class="form-group">
          <label for="inputId">ID</label>
          <input type="number" id="inputId" name="id" placeholder="ID" readonly>
        </div>

        <div class="form-group">
          <label for="inputCategory">Select Category</label>
          <select id="inputCategory" name="category">
            <option value="" selected disabled>Select the category</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
          </select>
        </div>

        <div class="form-group">
          <label for="inputName">Product Name</label>
          <input type="text" id="inputName" name="name" placeholder="Enter product name">
        </div>

        <div class="form-group">
          <label for="inputDescription">Description</label>
          <input type="text" id="inputDescription" name="description" placeholder="Enter product description">
        </div>
        
        <div class="form-group">
          <label for="inputSize">Size</label>
          <input type="number" id="inputSize" name="size" placeholder="Enter product size">
        </div>
        
        <div class="form-group">
          <label for="inputPrice">Price</label>
          <input type="number" id="inputPrice" name="price" placeholder="Enter product price">
        </div>

        <button type="submit" id="btn-add-product">Add Product</button>
    `;
}

if(!token) {
    alert("You don't have permission to access this page. Login to continue");
    window.location.href = '/src/pages/login.html';
} else {
    try {
        const decoded = jwtDecode(token);
        if (div) {
            div.innerHTML = `<h1>Welcome ${decoded.type === 0 ? `${decoded.username} (Customer)` : `${decoded.email} (Admin)`}</h1>`;
            if(decoded.type === 0) {
                tablePurchases();
            } else if (decoded.type === 1) {
                crudProducts();   
            }
        }
    } catch (error) {
        console.error("Error to decode the token:", error);
        sessionStorage.removeItem('token');
        window.location.href = '/src/pages/login.html';
    }
}

