import { jwtDecode } from 'https://cdn.jsdelivr.net/npm/jwt-decode@4.0.0/+esm';
const forms = document.querySelectorAll('form');
forms.forEach(form => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formId = form.id; 
    const formData = new FormData(form);
    
    const asociativesData = Object.fromEntries(formData.entries());
 
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

        const userVerified = jwtDecode(result.token);
        console.log(userVerified);
        sessionStorage.setItem('username', userVerified.username);
      }
      
      if (route === '/api/login') setTimeout(() => window.location.href = '/src/pages/dashboard.html', 1000);
      if (route === '/api/register') setTimeout(() => window.location.href = '/src/pages/login.html', 1000);
      if (route === '/api/contact') setTimeout(() => window.location.href = '/index.html', 1000);
    }
  } catch (error) {
    console.error("Error to send data:", error);
    alert("We cannot connect to the server.");
  }
}