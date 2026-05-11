import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../common/db.module';
import { Empresa, ResumenFinanciero } from './empresas.types';

@Injectable()
export class EmpresasService {
  private readonly logger = new Logger(EmpresasService.name);

  constructor(@Inject(PG_POOL) private pool: Pool) { }

  /**
   * Retrieves active companies.
   * REP-04 Fix: Filtering is now performed at the Database level for scalability.
   */
  async findAll(): Promise<Empresa[]> {
    // REP-04 Fix: Added WHERE clause to prevent loading inactive records into memory.
    // This reduces memory heap usage and network traffic significantly.
    const result = await this.pool.query<Empresa>(
      `SELECT id, nombre, nif, programa, activa, ultima_sync
       FROM empresas
       WHERE activa = true
       ORDER BY nombre`
    );

    return result.rows;
  }

  /**
   * Calculates financial summary using secure parameterized queries.
   * REP-05 Fix: Implemented parameterized queries to prevent SQL Injection.
   */
  async getResumen(
    empresaId: string,
    ejercicio: number,
    mes: number,
  ): Promise<ResumenFinanciero> {
    // 1. Verify existence using parameters
    const empresaResult = await this.pool.query(
      'SELECT id FROM empresas WHERE id = $1',
      [empresaId],
    );

    if (empresaResult.rows.length === 0) {
      throw new NotFoundException(`Empresa ${empresaId} no encontrada`);
    }

    // REP-05 Fix: Avoided string interpolation. Used placeholders ($1, $2, $3)
    // for safe data binding handled by the pg driver.
    const query = `
      SELECT 
        tipo, 
        SUM(importe) as total
      FROM apuntes
      WHERE empresa_id = $1
        AND ejercicio = $2
        AND mes = $3
      GROUP BY tipo
    `;

    const result = await this.pool.query(query, [empresaId, ejercicio, mes]);

    let total_ingresos = 0;
    let total_gastos = 0;

    for (const row of result.rows) {
      if (row.tipo === 'INGRESO') total_ingresos = parseFloat(row.total);
      if (row.tipo === 'GASTO') total_gastos = parseFloat(row.total);
    }

    return {
      empresa_id: empresaId,
      ejercicio,
      mes,
      total_ingresos,
      total_gastos,
      resultado: total_ingresos - total_gastos,
    };
  }
}