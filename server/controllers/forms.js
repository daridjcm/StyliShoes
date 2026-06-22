import { jwtDecode } from 'https://cdn.jsdelivr.net/npm/jwt-decode@4.0.0/+esm';

const FORM_CONFIG = {
  'form-login':    { route: '/api/login',    redirect: '/src/pages/dashboard.html' },
  'form-register': { route: '/api/register', redirect: '/src/pages/login.html' },
  'form-contact':  { route: '/api/contact',  redirect: '/index.html' }
};

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const data = Object.fromEntries(new FormData(form).entries());
      delete data.terms;
      if (form.id === 'form-login') delete data.username;

      const config = FORM_CONFIG[form.id] || { route: '/api/users', redirect: null };
      await enviarData(config.route, data, config.redirect);
    });
  });
});

async function enviarData(route, data, redirectUrl) {
  try {
    const response = await fetch(route, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (!response.ok) return alert(result.error);

    if (result.token) {
      sessionStorage.setItem('token', result.token);
      try {
        const payload = jwtDecode(result.token);
        console.log(payload);
        sessionStorage.setItem('username', payload.username || payload.email || 'User');
        sessionStorage.setItem('id_customer', payload.id);
      } catch (err) {
        console.error("Error decoding JWT:", err);
      }
    }

    alert(result.message);
    if (redirectUrl) setTimeout(() => window.location.href = redirectUrl, 500);

  } catch (error) {
    console.error("Error to send data:", error);
    alert("We cannot connect to the server.");
  }
}