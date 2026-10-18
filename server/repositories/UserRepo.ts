import { query, run } from "../database";
import type { NewUser, User } from "../models/User";

export const UserRepository = {
  async create(user: NewUser): Promise<void> {
    await run(
      "INSERT INTO users (name, lastname, username, email, password) VALUES (?, ?, ?, ?, ?)",
      [user.name, user.lastname, user.username, user.email, user.passwordHash],
    );
  },

  async findByEmail(email: string): Promise<User | null> {
    const rows = await query<User>(
      "SELECT id, username, email, password, admin FROM users WHERE email = ?",
      [email],
    );
    return rows[0] ?? null;
  },
};
