import { useState, useMemo } from 'react';
import type { ResumenFinanciero } from '../types';

/**
 * Props for the Financial Chart.
 * DAEM-201: Connected to real data types and exercise context.
 */
interface ResumenChartProps {
  datos: ResumenFinanciero[];
  isLoading?: boolean;
}

export function ResumenChart({ datos, isLoading = false }: ResumenChartProps) {
  const [mesSeleccionado, setMesSeleccionado] = useState<number | null>(null);

  // DAEM-201 Fix: Memoize max value calculation for performance
  const maxValor = useMemo(() => {
    if (!datos || datos.length === 0) return 100;
    return Math.max(...datos.flatMap(d => [d.total_ingresos, d.total_gastos]), 100);
  }, [datos]);

  if (isLoading) {
    return (
      <div className="h-[180px] w-full animate-pulse rounded-lg border bg-gray-50" />
    );
  }

  if (!datos || datos.length === 0) {
    return (
      <div className="flex h-[180px] items-center justify-center rounded-lg border border-dashed text-gray-400">
        Sin datos para mostrar
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Evolución Mensual</h3>
        {/* Legend */}
        <div className="flex gap-3 text-[10px] font-medium uppercase tracking-wider">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-500" /> Ingresos
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-400" /> Gastos
          </div>
        </div>
      </div>

      <div className="flex items-end gap-3" style={{ height: 120 }}>
        {datos.map(d => (
          <div
            key={d.mes}
            className="group relative flex flex-1 flex-col items-center gap-1"
          >
            {/* Tooltip on Hover */}
            <div className="pointer-events-none absolute -top-8 z-10 hidden rounded bg-gray-800 px-2 py-1 text-[10px] text-white group-hover:block">
              {d.total_ingresos}€ / {d.total_gastos}€
            </div>

            <div className="flex w-full gap-1" style={{ height: 100 }}>
              <div
                className="flex-1 rounded-t bg-blue-500 transition-all duration-300 hover:bg-blue-600"
                style={{ 
                  height: `${(d.total_ingresos / maxValor) * 100}%`, 
                  alignSelf: 'flex-end' 
                }}
              />
              <div
                className="flex-1 rounded-t bg-red-400 transition-all duration-300 hover:bg-red-500"
                style={{ 
                  height: `${(d.total_gastos / maxValor) * 100}%`, 
                  alignSelf: 'flex-end' 
                }}
              />
            </div>
            <span className="text-[10px] font-medium text-gray-400">Mes {d.mes}</span>
          </div>
        ))}
      </div>
    </div>
  );
}