import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'token';

export const getToken = () => sessionStorage.getItem(TOKEN_KEY);
export const saveSession = (token) => sessionStorage.setItem(TOKEN_KEY, token);
export const clearSession = () => sessionStorage.removeItem(TOKEN_KEY);

/** Usuario autenticado a partir del JWT guardado, o null si no hay sesión válida. */
export function getUser() {
  const token = getToken();
  if (!token) return null;

  try {
    const { id, username, email, type } = jwtDecode(token);
    return { id, username: username || email || 'User', isAdmin: type === 1 };
  } catch {
    clearSession();
    return null;
  }
}
