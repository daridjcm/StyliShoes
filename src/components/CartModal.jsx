window.CartModal = function CartModal({ open, onClose }) {
  const { cartItems, products, removeFromCart, clearCart } = React.useContext(window.CartContext);

  const totalPrice = cartItems.reduce((sum, id) => {
    const p = products.find((x) => String(x.id) === String(id));
    return p ? sum + Number(p.price) : sum;
  }, 0);

  if (!open) return null;

  return (
    <div id="cart-modal" className="modal-overlay active" aria-hidden="false" role="dialog" aria-labelledby="cart-modal-title" onClick={(e) => { if (e.target.id === 'cart-modal') onClose(); }}>
      <div className="modal-dialog">
        <div className="modal-header">
          <h2 id="cart-modal-title">Your Cart</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close cart">&times;</button>
        </div>
        <div className="modal-body">
          <ul id="cart-items" className="cart-list">
            {cartItems.length === 0 && <li className="cart-empty">Your cart is empty.</li>}
            {cartItems.map((id, idx) => {
              const p = products.find((x) => String(x.id) === String(id));
              if (!p) return null;
              return (
                <li key={idx} className="cart-item">
                  <img src={`/src/pages/images/${p.image}`} alt={p.name} />
                  <div className="cart-item-info">
                    <h4>{p.name}</h4>
                    <span>${Number(p.price).toFixed(2)}</span>
                  </div>
                  <button className="cart-item-remove" onClick={() => removeFromCart(p.id)} aria-label={`Remove ${p.name} from cart`}>Remove</button>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="modal-footer">
          <button id="checkout-btn" onClick={() => { if (cartItems.length === 0) { alert('Your cart is empty.'); return; } if (confirm(`Proceed to checkout with ${cartItems.length} item(s)?`)) { clearCart(); onClose(); alert('Thank you for your purchase!'); } }}>Buy</button>
          <button id="invoice-btn" onClick={() => alert('Invoice download feature coming soon!')}>Download Invoice</button>
          <p>Total: $<span id="cart-total-price">{totalPrice.toFixed(2)}</span></p>
        </div>
      </div>
    </div>
  );
};
