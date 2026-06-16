const { useState, useEffect } = React;

window.CartContext = React.createContext();

window.CartProvider = function CartProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cartItems")) || [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (productId) => {
    setCartItems((prev) => [...prev, productId]);
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => {
      const idx = prev.findIndex((id) => String(id) === String(productId));
      if (idx === -1) return prev;
      const copy = [...prev];
      copy.splice(idx, 1);
      return copy;
    });
  };

  const clearCart = () => setCartItems([]);

  return (
    <window.CartContext.Provider value={{ products, setProducts, cartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </window.CartContext.Provider>
  );
};
