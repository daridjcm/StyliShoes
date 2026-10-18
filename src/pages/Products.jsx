import { useCallback, useEffect, useState } from 'react';
import CartModal from '../components/CartModal.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { BreadcrumbHeader, Footer } from '../components/Layout.jsx';
import { useCart } from '../hooks/useCart.js';
import { ROUTES, navigate } from '../routes.js';
import { createPurchase, describeError, downloadInvoice, getLatestPurchaseId, getProducts } from '../services/api.js';
import { getUser } from '../services/session.js';

/** Devuelve el usuario logueado o lo manda a iniciar sesión. */
function requireUser(message) {
  const user = getUser();
  if (!user) {
    alert(message);
    navigate(ROUTES.login);
  }
  return user;
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastPurchaseId, setLastPurchaseId] = useState(null);
  const cart = useCart(products);

  useEffect(() => {
    getProducts().then(setProducts).catch((error) => console.error('Error fetching products:', error));
  }, []);

  const closeCart = useCallback(() => setIsCartOpen(false), []);

  async function checkout() {
    if (!cart.count) return alert('Your cart is already empty.');

    const user = requireUser('Please log in to complete your purchase. Your cart items will be saved!');
    if (!user || !confirm(`Proceed to checkout with ${cart.count} item(s)?`)) return;

    try {
      const { message, id_purchase } = await createPurchase({
        id_customer: user.id,
        customer: user.username,
        total: cart.total,
        items: cart.items.map(({ product }) => ({
          id_product: product.id,
          name: product.name,
          quantity: 1,
          price: Number(product.price)
        }))
      });
      setLastPurchaseId(id_purchase);
      alert(message);
      if (confirm('Download invoice now?')) await downloadInvoice(id_purchase, user.id);
      cart.clear();
      closeCart();
    } catch (error) {
      alert(`Error processing purchase: ${describeError(error)}`);
    }
  }

  async function invoice() {
    const user = requireUser('Please log in.');
    if (!user) return;

    try {
      const purchaseId = lastPurchaseId ?? await getLatestPurchaseId(user.id);
      await downloadInvoice(purchaseId, user.id);
    } catch (error) {
      alert(`Could not download the invoice: ${describeError(error)}`);
    }
  }

  return (
    <>
      <BreadcrumbHeader page="Products">
        <button type="button" id="cart-btn" aria-label="Open shopping cart" onClick={() => setIsCartOpen(true)}>
          Cart ({cart.count})
        </button>
      </BreadcrumbHeader>
      <main>
        <section>
          <h2>Products</h2>
          <div id="product-list" className="product-grid">
            {products.length
              ? products.map((product) => <ProductCard key={product.id} product={product} onAdd={cart.add} />)
              : <p>No products available at the moment.</p>}
          </div>
        </section>
        <CartModal
          open={isCartOpen}
          items={cart.items}
          total={cart.total}
          onClose={closeCart}
          onRemove={cart.remove}
          onCheckout={checkout}
          onInvoice={invoice}
        />
      </main>
      <Footer />
    </>
  );
}
