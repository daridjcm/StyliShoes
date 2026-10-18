export interface User {
  id: number;
  username: string | null;
  email: string;
  password: string;
  /** 1 = administrador, 0 = cliente */
  admin: number;
}

export type NewUser = {
  name: string;
  lastname: string;
  username: string;
  email: string;
  passwordHash: string;
};
