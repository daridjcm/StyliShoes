import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/UserRepo.ts";

export async function register({ name, lastname, username, email, password }) {
  await UserRepository.create({
    name,
    lastname,
    username,
    email,
    passwordHash: await Bun.password.hash(password),
  });
}

/** Devuelve un JWT si las credenciales son válidas; si no, null. */
export async function login(email, password) {
  const user = await UserRepository.findByEmail(email);
  if (!user || !(await Bun.password.verify(password, user.password))) return null;

  return jwt.sign(
    { id: user.id, username: user.username, email: user.email, type: user.admin },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );
}
