import { useEffect, useState } from 'react';
import type { Empresa, FreshnessStatus } from '../types';
import { fetchEmpresas } from '../services/api';

/**
 * Calculates freshness status based on last sync time.
 * REP-10 Fix: Corrected logic gates and thresholds.
 */
function getFreshness(ultima_sync: string): FreshnessStatus {
  const diff = (Date.now() - new Date(ultima_sync).getTime()) / 1000 / 60;
  
  if (diff < 5) return 'ok';        // < 5 min: Green
  if (diff <= 30) return 'warning'; // 5 - 30 min: Amber
  return 'stale';                   // > 30 min: Red
}

const freshnessColor: Record<FreshnessStatus, string> = {
  ok: 'bg-green-100 text-green-800 border-green-300',
  warning: 'bg-amber-100 text-amber-800 border-amber-300',
  stale: 'bg-red-100 text-red-800 border-red-300',
};

const freshnessLabel: Record<FreshnessStatus, string> = {
  ok: 'Actualizado',
  warning: 'Con retraso',
  stale: 'Desactualizado',
};

interface EmpresaSelectorProps {
  onSelect: (empresa: Empresa) => void;
}

export function EmpresaSelector({ onSelect }: EmpresaSelectorProps) {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmpresas()
      .then(data => {
        setEmpresas(data);
        setError(null);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Error al cargar las empresas';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  // REP-11 Fix: UI for error states
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-medium text-red-800">Error: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-3 text-xs font-semibold text-red-600 underline hover:text-red-800"
        >
          Reintentar cargar datos
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-28 animate-pulse rounded-lg bg-gray-200" />
        ))}
      </div>
    );
  }

  // Handle empty state
  if (empresas.length === 0) {
    return <p className="text-center text-gray-500">No hay empresas disponibles.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {empresas.map(empresa => {
        const freshness = getFreshness(empresa.ultima_sync);
        return (
          <button
            key={empresa.id}
            onClick={() => onSelect(empresa)}
            className="group rounded-lg border p-4 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-blue-700">{empresa.nombre}</p>
                <p className="text-sm text-gray-500">{empresa.nif}</p>
                <span className="mt-1 inline-block rounded px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-100">
                  {empresa.programa}
                </span>
              </div>
              <span className={`rounded border px-2 py-0.5 text-xs font-medium ${freshnessColor[freshness]}`}>
                {freshnessLabel[freshness]}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}