window.MainRouter = function MainRouter() {
  const [route, setRoute] = React.useState(window.location.hash.replace('#', '') || '/');
  const [cartOpen, setCartOpen] = React.useState(false);
  const { setProducts } = React.useContext(window.CartContext);

  React.useEffect(() => {
    function onHash() {
      setRoute(window.location.hash.replace('#', '') || '/');
    }
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  React.useEffect(() => {
    async function preload() {
      try {
        const res = await fetch('/src/pages/products.json');
        if (!res.ok) return;
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.products || [];
        setProducts(list);
      } catch (e) {
        console.warn(e);
      }
    }
    preload();
  }, []);

  const openCart = () => setCartOpen(true);
  const closeCart = () => setCartOpen(false);

  return (
    <>
      <window.Header onOpenCart={openCart} />
      <main className="page-container">
        {route === '/' && <window.Home />}
        {route === '/products' && <window.Products />}
        {route === '/about' && <window.About />}
        {route === '/contact' && <window.Contact />}
      </main>
      <window.CartModal open={cartOpen} onClose={closeCart} />
    </>
  );
};

window.App = function App() {
  return (
    <window.CartProvider>
      <window.MainRouter />
    </window.CartProvider>
  );
};
