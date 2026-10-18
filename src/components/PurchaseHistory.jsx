import { useEffect, useState } from 'react';
import { describeError, getPurchases } from '../services/api.js';

export default function PurchaseHistory({ user }) {
  const [purchases, setPurchases] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getPurchases(user.id).then(setPurchases).catch((err) => setError(describeError(err)));
  }, [user.id]);

  return (
    <>
      <h1>Welcome {user.username} (Customer)</h1>
      {error && <p className="form-hint">{error}</p>}
      {purchases && (
        <table>
          <thead>
            <tr><th>ID Purchase</th><th>ID Customer</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr>
          </thead>
          <tbody>
            {purchases.length ? purchases.map((purchase) => (
              <tr key={purchase.id_purchase}>
                <td><strong>#{purchase.id_purchase}</strong></td>
                <td>{purchase.id_customer}</td>
                <td>{purchase.customer}</td>
                <td>{new Date(purchase.date).toLocaleDateString()}</td>
                <td><strong>${purchase.total.toFixed(2)}</strong></td>
                <td>
                  <i className={purchase.status === 'Approved' ? 'fas fa-check' : 'fas fa-clock'} aria-label={purchase.status} />
                </td>
              </tr>
            )) : <tr><td colSpan="6" className="cart-empty">No purchases recorded yet.</td></tr>}
          </tbody>
        </table>
      )}
    </>
  );
}
