import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

/**
 * Interface to avoid the use of ': any' for the request object.
 * Defines the structure of a request that includes an authenticated user.
 */
interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    email: string;
    // Add other relevant JWT payload fields here
  };
}

@Injectable()
export class JwtGuard implements CanActivate {
  private readonly logger = new Logger(JwtGuard.name);

  constructor(private jwtService: JwtService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers['authorization'];

    // REP-01 Fix: Avoid exposing internal data (Path/IP) in the error response.
    // Standardized message to prevent information leakage.
    if (!authHeader) {
      this.logger.warn(`Unauthorized access attempt on path: ${request.path}`);
      throw new UnauthorizedException('Authentication token is required');
    }

    const [type, token] = authHeader.split(' ') ?? [];

    // Ensure the token follows the Bearer schema
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization format');
    }

    try {
      // REP-02 & REP-07 Fix: Verify token and extract payload safely.
      const payload = await this.jwtService.verifyAsync(token);

      // Assign payload to the request object using the custom interface instead of ': any'
      request.user = payload;

      return true;
    } catch (error: unknown) { // TypeScript asigna 'unknown' por seguridad

      // 1. Verificamos si es una instancia del objeto Error
      const message = error instanceof Error ? error.message : 'Unknown error';

      // 2. Ahora ya puedes usarlo sin error de compilación
      this.logger.error(`JWT Verification failed: ${message}`);

      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}