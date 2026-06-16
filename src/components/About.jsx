window.About = function About() {
  return (
    <section className="page-container">
      <div className="about-hero">
        <h1>About Us</h1>
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
            <li>Women's Shoes: sandals, heels, boots, sneakers, and more</li>
            <li>Men's Shoes: dress shoes, casual shoes, boots, sneakers, and more</li>
          </ul>
        </div>
        <div className="about-card about-card--light">
          <p>We strive to provide a seamless shopping experience, with easy navigation, secure payment options, and fast shipping.</p>
        </div>
      </div>
    </section>
  );
};
