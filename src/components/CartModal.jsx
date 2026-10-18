import { useEffect } from 'react';

export default function CartModal({ open, items, total, onClose, onRemove, onCheckout, onInvoice }) {
  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open, onClose]);

  return (
    <div
      id="cart-modal"
      className={`modal-overlay${open ? ' active' : ''}`}
      aria-hidden={!open}
      role="dialog"
      aria-labelledby="cart-modal-title"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="modal-dialog">
        <div className="modal-header">
          <h2 id="cart-modal-title">Your Cart</h2>
          <button type="button" id="cart-close-btn" className="modal-close" aria-label="Close cart" onClick={onClose}>
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>
        <div className="modal-body">
          <ul id="cart-items" className="cart-list">
            {items.length ? items.map(({ key, product }) => (
              <li className="cart-item" key={key}>
                <img src={product.image_url || undefined} alt={product.name} loading="lazy" />
                <div className="cart-item-info"><h4>{product.name}</h4><span>${Number(product.price).toFixed(2)}</span></div>
                <button type="button" className="cart-item-remove" onClick={() => onRemove(product.id)}>Remove</button>
              </li>
            )) : <li className="cart-empty">Your cart is empty.</li>}
          </ul>
        </div>
        <div className="modal-footer">
          <button type="button" id="checkout-btn" onClick={onCheckout}>Buy</button>
          <button type="button" id="invoice-btn" onClick={onInvoice}>Download Invoice <i className="fa-solid fa-download" aria-hidden="true" /></button>
          <p>Total: $<span id="cart-total-price">{total.toFixed(2)}</span></p>
        </div>
      </div>
    </div>
  );
}
