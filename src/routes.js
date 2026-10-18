export const ROUTES = {
  home: '/',
  about: '/about',
  products: '/products',
  contact: '/contact',
  login: '/login',
  register: '/register',
  terms: '/terms',
  dashboard: '/dashboard'
};

export const navigate = (path) => window.location.assign(path);
