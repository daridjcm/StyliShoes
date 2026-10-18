import { BreadcrumbHeader, Footer } from '../components/Layout.jsx';
import { Field, TermsCheck, formValues } from '../components/FormFields.jsx';
import { ROUTES, navigate } from '../routes.js';
import { describeError, login } from '../services/api.js';
import { saveSession } from '../services/session.js';

async function handleSubmit(event) {
  event.preventDefault();
  try {
    const { message, token } = await login(formValues(event.currentTarget));
    saveSession(token);
    alert(message);
    navigate(ROUTES.dashboard);
  } catch (error) {
    alert(describeError(error));
  }
}

export default function LoginPage() {
  return (
    <>
      <BreadcrumbHeader page="Login" />
      <main>
        <section>
          <form className="form" onSubmit={handleSubmit}>
            <Field id="inputEmail" label="Email address" type="email" name="email" autoComplete="email" required />
            <Field id="inputPassword" label="Password" type="password" name="password" autoComplete="current-password" required />
            <TermsCheck />
            <button type="submit" id="btn-login">Login</button>
            <a href={ROUTES.register} className="link">Don&apos;t have an account? Register</a>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}
