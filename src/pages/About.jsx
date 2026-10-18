import { BreadcrumbHeader, Footer, LOGO } from '../components/Layout.jsx';

export default function AboutPage() {
  return (
    <>
      <BreadcrumbHeader page="About Us" showLogo={true} />
      <main>
        <section className="page-container">
          <div className="about-hero">
            <img src={LOGO} alt="StyliShoes" id="logo-about" />
            <p>
              <span className="text-primary">StyliShoes</span> is a web e-commerce platform offering a diverse
              range of shoes for <span className="text-accent">women and men.</span> Our online store provides
              a vast selection of styles, sizes, and widths to cater to various needs and preferences.
            </p>
          </div>
          <div className="about-grid">
            <div className="about-card about-card--dark">
              <h2>Our Product Categories</h2>
              <ul>
                <li>Women&apos;s Shoes: sandals, heels, boots, sneakers, and more</li>
                <li>Men&apos;s Shoes: dress shoes, casual shoes, boots, sneakers, and more</li>
              </ul>
            </div>
            <div className="about-card about-card--light">
              <p>With this project we offer two interfaces (admin and client). The admin can do the CRUD operations for the products on the website, while the customer can see their purchase history.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
