import { ROUTES } from '../routes.js';

/** Campo con label. `as` permite usar select o textarea. */
export function Field({ id, label, hint, as: Tag = 'input', children, ...props }) {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <Tag id={id} {...props}>{children}</Tag>
      {hint && <small className="form-hint">{hint}</small>}
    </div>
  );
}

export function TermsCheck() {
  return (
    <div className="form-group form-check-group">
      <input type="checkbox" id="check" name="terms" required />
      <label htmlFor="check">Accept <a href={ROUTES.terms}>terms and conditions</a></label>
    </div>
  );
}

/** Valores de un formulario como objeto, sin el checkbox de términos. */
export function formValues(form) {
  const { terms, ...values } = Object.fromEntries(new FormData(form));
  return values;
}
