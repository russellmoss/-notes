// src/types/auth.types.ts
export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface AuthSession {
  user: User | null;
  access_token: string | null;
}
