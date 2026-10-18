import { BreadcrumbHeader, Footer } from '../components/Layout.jsx';

const terms = [
  'In first instance, the terms and conditions of this website are valid and enforceable.',
  'You may use our website for personal or educative, non-commercial purposes only.',
  'You may not use our website for any illegal or unauthorized purpose.',
  'You may not modify, adapt, translate, or reverse engineer any part of our website.',
  'You must not use our website to engage in any activity that violates any applicable laws or regulations.',
  'We reserve the right to terminate your access to our website at any time without prior notice.',
  'We reserve the right to change, modify, or remove any part of our website at any time without prior notice.',
  'We reserve the right to suspend or terminate your account and any related services at any time without prior notice.'
];

export default function TermsPage() {
  return (
    <>
      <BreadcrumbHeader page="Terms and Conditions" />
      <main>
        <section>
          <h1>Terms and Conditions</h1>
          <p>Welcome to StyliShoes, a website that offers a variety of shoes for men and women. By using our website, you agree to be bound by these terms and conditions. If you do not agree with any part of these terms and conditions, please do not use our website.</p>
          <h2>1. Terms</h2>
          <ol>
            {terms.map((term) => <li key={term}>{term}</li>)}
          </ol>
        </section>
      </main>
      <Footer />
    </>
  );
}
