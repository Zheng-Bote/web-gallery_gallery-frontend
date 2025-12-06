// src/app/models/auth.model.ts
export interface LoginResponse {
  token: string; // Der Access Token
  refreshToken: string; // Der Long-Lived Token
}
