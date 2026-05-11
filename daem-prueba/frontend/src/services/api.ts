import type { Empresa, ResumenFinanciero } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

/**
 * Interface for the login response to replace 'any'.
 * REP-08 Fix: Ensures type safety for authentication tokens.
 */
interface LoginResponse {
  access_token: string;
}

function getToken(): string {
  return localStorage.getItem('token') ?? '';
}

/**
 * Handles user authentication.
 */
export async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    // Attempt to get a more specific error message from the body
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Credenciales inválidas');
  }

  // REP-08 Fix: Type the response correctly instead of using 'any'
  const data: LoginResponse = await res.json();
  localStorage.setItem('token', data.access_token);
  return data.access_token;
}

/**
 * Retrieves the list of active companies.
 * REP-09 Fix: Proper HTTP error handling to prevent silent failures.
 */
export async function fetchEmpresas(): Promise<Empresa[]> {
  const res = await fetch(`${BASE_URL}/empresas`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  // REP-09 Fix: If the response is not 2xx, throw an error. 
  // Returning an empty array mask the problem (e.g., expired tokens).
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login'; // Redirect to login on expired session
    }
    throw new Error(`Error ${res.status}: Fallo al recuperar empresas`);
  }

  return res.json() as Promise<Empresa[]>;
}

export async function fetchResumen(
  empresaId: string,
  ejercicio: number,
  mes: number,
): Promise<ResumenFinanciero> {
  const params = new URLSearchParams({
    ejercicio: String(ejercicio),
    mes: String(mes),
  });

  const res = await fetch(
    `${BASE_URL}/empresas/${empresaId}/resumen?${params}`,
    { headers: { Authorization: `Bearer ${getToken()}` } },
  );

  if (!res.ok) {
    throw new Error(`Error ${res.status}: No se pudo obtener el resumen financiero`);
  }
  
  return res.json() as Promise<ResumenFinanciero>;
}