import { BreadcrumbHeader, Footer } from '../components/Layout.jsx';
import { Field, TermsCheck, formValues } from '../components/FormFields.jsx';
import { ROUTES, navigate } from '../routes.js';
import { countries } from '../data/countries.js';
import { describeError, sendContact } from '../services/api.js';

async function handleSubmit(event) {
  event.preventDefault();
  try {
    const { message } = await sendContact(formValues(event.currentTarget));
    alert(message);
    navigate(ROUTES.home);
  } catch (error) {
    alert(describeError(error));
  }
}

export default function ContactPage() {
  return (
    <>
      <BreadcrumbHeader page="Contact" />
      <main>
        <section>
          <form className="form" onSubmit={handleSubmit}>
            <Field id="inputFullname" label="Full Name" type="text" name="fullname" autoComplete="name" required />
            <Field id="inputCountry" label="Select your country" as="select" name="country" defaultValue="">
              <option value="" disabled>Select the country</option>
              {countries.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
            </Field>
            <Field
              id="inputEmail" label="Email address" type="email" name="email" autoComplete="email" required
              hint="We'll never share your email with anyone else."
            />
            <Field id="inputMessage" label="Message" as="textarea" name="message" rows="4" required />
            <TermsCheck />
            <button type="submit">Submit</button>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}
