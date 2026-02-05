const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  user: User | null;
  session?: {
    access_token: string;
    refresh_token: string;
  };
  error?: string;
}

export async function signUp(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    return { user: null, error: data.error || 'Sign up failed' };
  }

  return data;
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    return { user: null, error: data.error || 'Sign in failed' };
  }

  return data;
}

export async function getGoogleOAuthUrl(redirectTo: string): Promise<string> {
  const response = await fetch(
    `${API_URL}/auth/google/url?redirect_to=${encodeURIComponent(redirectTo)}`
  );
  const data = await response.json();
  return data.url;
}
