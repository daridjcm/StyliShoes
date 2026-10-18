import { useEffect, useRef, useState } from 'react';
import { Field } from './FormFields.jsx';
import { deleteProduct, describeError, getProducts, saveProduct } from '../services/api.js';

const FORM_FIELDS = ['id', 'category', 'name', 'description', 'size', 'price'];
const SIZE_FORMAT = /^\d+(,\d+)*$/;

export default function AdminDashboard({ user }) {
  const [products, setProducts] = useState([]);
  const [mode, setMode] = useState('CREATE');
  const [loadError, setLoadError] = useState('');
  const formRef = useRef(null);

  async function loadProducts() {
    try {
      setProducts(await getProducts());
      setLoadError('');
    } catch (error) {
      console.error(error);
      setLoadError('Error loading products.');
    }
  }

  useEffect(() => { loadProducts(); }, []);

  function resetForm() {
    formRef.current.reset();
    setMode('CREATE');
  }

  function selectProduct(product) {
    const { elements } = formRef.current;
    FORM_FIELDS.forEach((field) => { elements.namedItem(field).value = product[field] ?? ''; });
    setMode('UPDATE');
  }

  /** Ejecuta la operación, avisa del resultado y recarga la tabla. */
  async function submit(operation) {
    try {
      const result = await operation();
      alert(result.message);
      resetForm();
      await loadProducts();
    } catch (error) {
      alert(`Error: ${describeError(error)}`);
    }
  }

  function handleSave() {
    const form = formRef.current;
    if (!form.checkValidity()) return form.reportValidity();

    const formData = new FormData(form);
    if (!form.elements.namedItem('image').files.length) formData.delete('image');

    if (!SIZE_FORMAT.test(formData.get('size'))) return alert('Please enter a valid size format (e.g., 38,39,40).');
    if (!(Number(formData.get('price')) > 0)) return alert('Please enter a valid price greater than 0.');

    return submit(() => saveProduct(mode === 'CREATE' ? 'POST' : 'PUT', formData));
  }

  function handleDelete() {
    const id = formRef.current.elements.namedItem('id').value;
    if (!id) return alert('Please select a product from the right list to be able to delete it.');
    if (!confirm(`Do you want to delete the product with ID: ${id}?`)) return undefined;

    return submit(() => deleteProduct(id));
  }

  return (
    <>
      <h1>Welcome {user.username} (Admin)</h1>
      <div className="crud-actions">
        <button type="button" className={`crud-mode-btn${mode === 'CREATE' ? ' active-mode' : ''}`} onClick={resetForm}>
          <i className="fa-solid fa-user-pen" aria-hidden="true" /> Add Product <i className="fa-solid fa-square-plus" aria-hidden="true" />
        </button>
        <button type="button" className={`crud-mode-btn${mode === 'UPDATE' ? ' active-mode' : ''}`} onClick={() => setMode('UPDATE')}>
          <i className="fa-solid fa-user-pen" aria-hidden="true" /> Update Product <i className="fa-solid fa-floppy-disk" aria-hidden="true" />
        </button>
        <button type="button" onClick={handleDelete}>
          <i className="fa-solid fa-user-pen" aria-hidden="true" /> Delete Product <i className="fa-solid fa-trash" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => formRef.current.reset()}>Clear Form</button>
      </div>
      <div className="crud-layout">
        <div className="crud-form-side">
          <form className="form" ref={formRef} onSubmit={(event) => event.preventDefault()}>
            <Field id="inputId" label="ID (Read Only)" type="number" name="id" placeholder="ID automatically" readOnly />
            <Field id="inputImage" label="Image Product" type="file" name="image" accept="image/*" />
            <Field id="inputCategory" label="Select Category" as="select" name="category" required defaultValue="">
              <option value="" disabled>Select the category</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
            </Field>
            <Field id="inputName" label="Product Name" type="text" name="name" required />
            <Field id="inputDescription" label="Description" type="text" name="description" required />
            <Field id="inputSize" label="Size (Ej: 38,39,40)" type="text" name="size" required />
            <Field id="inputPrice" label="Price" type="number" name="price" required />
            <button type="button" id="btn-submit-crud" onClick={handleSave}>
              {mode === 'CREATE' ? 'Add New Product' : 'Update Product'}
            </button>
          </form>
        </div>
        <div className="crud-table-side">
          <h3>List of Products Available</h3>
          <div id="products-table-container" className="products-table-scroll">
            {loadError ? <p className="form-hint">{loadError}</p> : products.length ? (
              <table>
                <thead><tr><th>ID</th><th>Category</th><th>Name</th><th>Price</th><th>Action</th></tr></thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td><strong>{product.id}</strong></td>
                      <td>{product.category}</td>
                      <td>{product.name}</td>
                      <td>${product.price}</td>
                      <td><button type="button" className="btn-select-prod" onClick={() => selectProduct(product)}>Select</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="cart-empty">No products registered.</p>}
          </div>
        </div>
      </div>
    </>
  );
}
