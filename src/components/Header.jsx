window.Header = function Header({ onOpenCart }) {
  const { cartItems } = React.useContext(window.CartContext);
  const [currentHash, setCurrentHash] = React.useState(window.location.hash);

  React.useEffect(() => {
    const handleHashChange = () => setCurrentHash(window.location.hash);
    
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const showCart = window.location.pathname.includes("products.html") || currentHash === "#/products";

  return (
    <header className="header-container">
      <h1>
        <a href="./index.html" id="title">StyliShoes</a>
      </h1>
      <nav aria-label="Main navigation">
        <ul>
          <li><a href="#/">Home</a></li>
          <li><a href="#/about">About Us</a></li>
          <li><a href="#/products">Products</a></li>
          <li><a href="#/contact">Contact</a></li>
        </ul>
      {showCart ? (
        <div>
          <button id="cart-btn" onClick={onOpenCart} aria-label="Open shopping cart">
            Cart (<span id="cart-count">{cartItems.length}</span>)
          </button>
        </div>
      ) : null}
      </nav>
    </header>
  );
};