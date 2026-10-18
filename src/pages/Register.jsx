import { BreadcrumbHeader, Footer } from '../components/Layout.jsx';
import { Field, TermsCheck, formValues } from '../components/FormFields.jsx';
import { ROUTES, navigate } from '../routes.js';
import { describeError, register } from '../services/api.js';

async function handleSubmit(event) {
  event.preventDefault();
  try {
    const { message } = await register(formValues(event.currentTarget));
    alert(message);
    navigate(ROUTES.login);
  } catch (error) {
    alert(describeError(error));
  }
}

export default function RegisterPage() {
  return (
    <>
      <BreadcrumbHeader page="Register" />
      <main>
        <section>
          <form className="form" onSubmit={handleSubmit}>
            <Field id="inputName" label="Name" type="text" name="name" autoComplete="given-name" required />
            <Field id="inputLastName" label="Last Name" type="text" name="lastname" autoComplete="family-name" required />
            <Field id="inputUsername" label="Username" type="text" name="username" autoComplete="username" required />
            <Field id="inputEmail" label="Email address" type="email" name="email" autoComplete="email" required />
            <Field id="inputPassword" label="Password" type="password" name="password" autoComplete="new-password" required />
            <TermsCheck />
            <button type="submit" id="btn-register">Register</button>
            <a href={ROUTES.login} className="link">Already have an account? Login</a>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}
