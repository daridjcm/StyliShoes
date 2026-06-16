window.Home = function Home() {
  return (
    <section id="hero">
      <div id="container-hero">
        <i className="fa-solid fa-shop icon-hero" aria-hidden="true"></i>
        <h2>Shoes designed for lovers of fashion!</h2>
        <h3>Providing the best shoes for your style.</h3>

        <div id="btn">
          <button type="button" id="btn-products" onClick={() => (window.location.hash = '#/products')}>
            See Products
            <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
          </button>

          <button type="button" id="btn-about" onClick={() => (window.location.hash = '#/about')}>
            Learn more about us
            <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      <hr />

      <section id="services">
        <h2>Our Services</h2>
        <div className="services-wrapper">
          <div className="services-intro">
            <h3>We give you a better experience in the store</h3>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugit exercitationem error repudiandae similique modi ipsam dicta?</p>
          </div>
          <div className="services-grid">
            <div className="service-card">
              <p className="service-title">
                <i className="fa-solid fa-globe fa-2xl icon-primary" aria-hidden="true"></i>
                International Shipping
              </p>
              <p>We deliver worldwide with secure and fast shipping options.</p>
            </div>
            <div className="service-card">
              <p className="service-title">
                <i className="fa-solid fa-headset fa-2xl icon-primary" aria-hidden="true"></i>
                24/7 Customer Support
              </p>
              <p>Our team is here for you at any time.</p>
            </div>
            <div className="service-card">
              <p className="service-title">
                <i className="fa-solid fa-truck-fast fa-2xl icon-primary" aria-hidden="true"></i>
                Easy Returns
              </p>
              <p>Hassle-free returns and exchanges within 30 days.</p>
            </div>
            <div className="service-card">
              <p className="service-title">
                <i className="fa-solid fa-trophy fa-2xl icon-trophy" aria-hidden="true"></i>
                Loyalty Rewards
              </p>
              <p>Earn points with every purchase.</p>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
};
