import { useEffect } from 'react';
import { ROUTES } from './routes.js';
import AboutPage from './pages/About.jsx';
import ContactPage from './pages/Contact.jsx';
import DashboardPage from './pages/Dashboard.jsx';
import HomePage from './pages/Home.jsx';
import LoginPage from './pages/Login.jsx';
import ProductsPage from './pages/Products.jsx';
import RegisterPage from './pages/Register.jsx';
import TermsPage from './pages/Terms.jsx';

const pages = {
  [ROUTES.home]: { title: 'StyliShoes', Page: HomePage },
  [ROUTES.about]: { title: 'About Us - StyliShoes', Page: AboutPage },
  [ROUTES.products]: { title: 'Products - StyliShoes', Page: ProductsPage },
  [ROUTES.contact]: { title: 'Contact - StyliShoes', Page: ContactPage },
  [ROUTES.login]: { title: 'Login - StyliShoes', Page: LoginPage },
  [ROUTES.register]: { title: 'Register - StyliShoes', Page: RegisterPage },
  [ROUTES.terms]: { title: 'Terms and Conditions - StyliShoes', Page: TermsPage },
  [ROUTES.dashboard]: { title: 'Dashboard - StyliShoes', Page: DashboardPage }
};

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || ROUTES.home;
  const { title, Page } = pages[path] ?? pages[ROUTES.home];

  useEffect(() => {
    document.title = title;
  }, [title]);

  return <Page />;
}
