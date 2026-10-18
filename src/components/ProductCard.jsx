export default function ProductCard({ product, onAdd }) {
  return (
    <div className="product-card">
      <img src={product.image_url || undefined} alt={product.name} loading="lazy" />
      <div className="product-card-info">
        <p>{product.name}</p>
        <p>{product.description}</p>
        <p>${Number(product.price).toFixed(2)}</p>
        <button type="button" className="btn-add-to-cart" onClick={() => onAdd(product.id)}>
          Add <i className="fa-solid fa-cart-plus" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
