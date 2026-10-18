import { ROUTES } from '../routes.js';

export const LOGO = '/src/images/logo/stylishoes-imagotype.svg';

export function Footer() {
  return (
    <footer>
      <p>&copy; StyliShoes - {new Date().getFullYear()}</p>
      <a href={ROUTES.terms}>Terms and Conditions</a>
    </footer>
  );
}

/** Cabecera con migas de pan: Home > {page}. `children` se renderiza al final del nav. */
export function BreadcrumbHeader({ page, showLogo = true, children }) {
  return (
    <header className="header-container">
      <nav aria-label="breadcrumb">
        <a href="/">
          {showLogo && <img src={LOGO} alt="StyliShoes" id="logo" />}
        </a>
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href={ROUTES.home}>Home</a></li>
          <li className="breadcrumb-item active" aria-current="page">{page}</li>
        </ol>
        {children}
      </nav>
    </header>
  );
}
