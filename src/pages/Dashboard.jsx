import { useEffect, useState } from 'react';
import AdminDashboard from '../components/AdminDashboard.jsx';
import PurchaseHistory from '../components/PurchaseHistory.jsx';
import { Footer } from '../components/Layout.jsx';
import { ROUTES, navigate } from '../routes.js';
import { getUser } from '../services/session.js';

export default function DashboardPage() {
  const [user] = useState(getUser);

  useEffect(() => {
    if (user) return;
    alert("You don't have permission to access this page. Login to continue");
    navigate(ROUTES.login);
  }, [user]);

  return (
    <>
      <a href={ROUTES.home} style={{ margin: 30, display: 'flex', alignItems: 'center', gap: 10 }}>
        <i className="fa-solid fa-arrow-left" style={{ height: 30, width: 30 }} aria-hidden="true" /> Back
      </a>
      <div id="dashboard">
        {user && (user.isAdmin ? <AdminDashboard user={user} /> : <PurchaseHistory user={user} />)}
      </div>
      <Footer />
    </>
  );
}
