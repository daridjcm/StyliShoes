import { jwtDecode } from 'https://cdn.jsdelivr.net/npm/jwt-decode@4.0.0/+esm';

document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('form');

  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formId = form.id; 
      const formData = new FormData(form);
      const asociativesData = Object.fromEntries(formData.entries());
   
      if (asociativesData.terms) delete asociativesData.terms;
      if (formId === 'form-login' && asociativesData.username) delete asociativesData.username;

      if (formId === 'form-login') {
        await enviarData('/api/login', asociativesData);
      } else if (formId === 'form-register') {
        await enviarData('/api/register', asociativesData);
      } else if (formId === 'form-contact') {
        await enviarData('/api/contact', asociativesData);
      } else {
        await enviarData('/api/users', asociativesData);
      }
    });
  });
});

async function enviarData(route, data) {
  try {
    const response = await fetch(route, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) {
      if (result.token) {
        sessionStorage.setItem('token', result.token);

        try {
          const userVerified = jwtDecode(result.token);
          const fallbackName = userVerified.username || userVerified.email || 'User';
          sessionStorage.setItem('username', fallbackName);
        } catch (jwtError) {
          console.error("Error decoding JWT:", jwtError);
        }
      }
      
      alert(result.message);

      if (route === '/api/login') {
        setTimeout(() => window.location.href = '/src/pages/dashboard.html', 500);
      } else if (route === '/api/register') {
        setTimeout(() => window.location.href = '/src/pages/login.html', 500);
      } else if (route === '/api/contact') {
        setTimeout(() => window.location.href = '/index.html', 500);
      }
    } else {
      alert(result.error);
    }
  } catch (error) {
    console.error("Error to send data:", error);
    alert("We cannot connect to the server.");
  }
}