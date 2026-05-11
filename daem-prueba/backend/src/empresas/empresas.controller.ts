import {
  Controller, Get, Param, Query, UseGuards,
  HttpException, HttpStatus, BadRequestException, Logger,
} from '@nestjs/common';
import { IsNumberString, IsOptional, Max, Min } from 'class-validator';
import { JwtGuard } from '../auth/jwt.guard';
import { EmpresasService } from './empresas.service';

/**
 * DTO with validation rules for range and type safety.
 * REP-08 Fix: Added Min/Max constraints for business logic.
 */
class ResumenQueryDto {
  @IsOptional()
  @IsNumberString()
  ejercicio?: string;

  @IsOptional()
  @IsNumberString()
  @Min(1)
  @Max(12)
  mes?: string;
}

@Controller('empresas')
@UseGuards(JwtGuard)
export class EmpresasController {
  private readonly logger = new Logger(EmpresasController.name);

  constructor(private empresasService: EmpresasService) {}

  @Get()
  async findAll() {
    try {
      return await this.empresasService.findAll();
    } catch (error: unknown) {
      // REP-06 Fix: Internal stack trace is logged but NOT exposed to the client.
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to retrieve companies: ${errorMessage}`, error instanceof Error ? error.stack : undefined);

      throw new HttpException(
        {
          message: 'Error al obtener empresas',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          // Detail removed for security compliance.
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/resumen')
  async getResumen(
    @Param('id') id: string,
    @Query() query: ResumenQueryDto,
  ) {
    const now = new Date();
    const ejercicio = query.ejercicio
      ? parseInt(query.ejercicio, 10)
      : now.getFullYear();
    const mes = query.mes
      ? parseInt(query.mes, 10)
      : now.getMonth() + 1;

    // REP-08 Fix: Validation for business rules (Month range).
    if (mes < 1 || mes > 12) {
      throw new BadRequestException('El mes debe estar entre 1 y 12');
    }

    try {
      return await this.empresasService.getResumen(id, ejercicio, mes);
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      
      this.logger.error(`Error in getResumen for company ${id}: ${error}`);
      throw new HttpException(
        'Error interno al procesar el resumen',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}