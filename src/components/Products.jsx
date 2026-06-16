window.Products = function Products() {
  const { products, setProducts, addToCart } = React.useContext(window.CartContext);

  React.useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/src/pages/products.json');
        if (!res.ok) throw new Error(res.status);
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.products || [];
        setProducts(list);
      } catch (e) {
        console.error('Failed to fetch products', e);
        setProducts([]);
      }
    }
    load();
  }, []);

  return (
    <section>
      <h2>Products</h2>
      <div id="product-list" className="product-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <img src={`/src/pages/images/${product.image}`} alt={product.name} />
            <div className="product-card-info">
              <p>{product.name}</p>
              <p>{product.description}</p>
              <p><strong>Price:</strong> ${product.price}</p>
              <p><strong>Sizes:</strong> {product.size.join(', ')}</p>
              <button onClick={() => addToCart(product.id)}>Add to Cart</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
