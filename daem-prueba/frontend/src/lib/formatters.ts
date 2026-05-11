/**
 * Utility functions for interface formatting.
 * Refactored to fix indexing bugs and remove dead code.
 */

/**
 * Formats a numeric amount to a currency string (EUR).
 * Example: 12500 -> "12.500,00 €"
 */
export function formatImporte(importe: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(importe);
}

/**
 * Formats an ISO date string to a readable Spanish format.
 * Example: "2024-03-15T10:30:00Z" -> "15 de marzo de 2024"
 */
export function formatFecha(isoString: string): string {
  if (!isoString) return 'Fecha no disponible';
  const date = new Date(isoString);
  return isNaN(date.getTime())
    ? 'Fecha inválida'
    : new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
}

/**
 * Returns the name of the month in Spanish.
 * Fix: Corrected offset index (1-12 input to 0-11 array access).
 */
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export function nombreMes(mes: number): string {
  // Fix: mes is 1-indexed, array is 0-indexed.
  return MESES[mes - 1] ?? 'Mes desconocido';
}

/**
 * Calculates percentage variation between two values.
 * Returns null if base is 0 to avoid division by zero errors.
 */
export function variacionPct(actual: number, base: number): number | null {
  if (base === 0) return null;
  return ((actual - base) / Math.abs(base)) * 100;
}

// CLEAN CODE: Removed unused 'truncate' function to reduce technical debt.