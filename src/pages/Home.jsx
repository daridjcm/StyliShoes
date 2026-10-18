import { Footer, LOGO } from '../components/Layout.jsx';
import { ROUTES, navigate } from '../routes.js';

const services = [
  { icon: 'fa-globe icon-primary', title: 'International Shipping', text: 'We deliver worldwide with secure and fast shipping options.' },
  { icon: 'fa-headset icon-primary', title: '24/7 Customer Support', text: 'Our team is here for you at any time.' },
  { icon: 'fa-truck-fast icon-primary', title: 'Easy Returns', text: 'Hassle-free returns and exchanges within 30 days.' },
  { icon: 'fa-trophy icon-trophy', title: 'Loyalty Rewards', text: 'Earn points with every purchase.' }
];

export default function HomePage() {
  return (
    <>
      <header className="header-container">
        <img src={LOGO} alt="StyliShoes" id="logo" />
        <nav aria-label="Main navigation">
          <ul>
            <li><a href={ROUTES.home}>Home</a></li>
            <li><a href={ROUTES.about}>About Us</a></li>
            <li><a href={ROUTES.products}>Products</a></li>
            <li><a href={ROUTES.contact}>Contact</a></li>
          </ul>
        </nav>
        <a href={ROUTES.login}>Login <i className="fa-solid fa-right-to-bracket" aria-hidden="true" /></a>
        <a href={ROUTES.register}>Register <i className="fa-solid fa-user-plus" aria-hidden="true" /></a>
      </header>
      <main>
        <section id="hero">
          <div id="container-hero">
            <img src={LOGO} alt="StyliShoes" id="logo-hero" />
            <h2>Shoes designed for lovers of fashion!</h2>
            <h3>Providing the best shoes for your style.</h3>
            <div id="btn">
              <button type="button" onClick={() => navigate(ROUTES.products)}>
                See Products <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => navigate(ROUTES.about)}>
                Learn more about us <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>
        <hr />
        <section id="services">
          <h2>Our Services</h2>
          <div className="services-wrapper">
            <div className="services-intro">
              <h3>We give you a better experience in the store</h3>
              <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugit exercitationem error repudiandae similique modi ipsam dicta?</p>
            </div>
            <div className="services-grid">
              {services.map(({ icon, title, text }) => (
                <div className="service-card" key={title}>
                  <p className="service-title"><i className={`fa-solid ${icon} fa-2xl`} aria-hidden="true" />{title}</p>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
