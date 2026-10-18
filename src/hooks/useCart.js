import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'cartItems';

function readSavedCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(stored) ? stored.map(String) : [];
  } catch {
    return [];
  }
}

/** Carrito persistido en localStorage. Guarda solo ids; los productos vienen del catálogo. */
export function useCart(products) {
  const [ids, setIds] = useState(readSavedCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [ids]);

  const byId = useMemo(() => new Map(products.map((product) => [String(product.id), product])), [products]);
  const items = ids
    .map((id, index) => ({ key: `${id}-${index}`, product: byId.get(id) }))
    .filter((item) => item.product);
  const total = items.reduce((sum, { product }) => sum + Number(product.price || 0), 0);

  return {
    count: ids.length,
    items,
    total,
    add: (productId) => setIds((current) => [...current, String(productId)]),
    remove: (productId) => setIds((current) => {
      const index = current.indexOf(String(productId));
      return index === -1 ? current : current.filter((_, i) => i !== index);
    }),
    clear: () => setIds([])
  };
}
