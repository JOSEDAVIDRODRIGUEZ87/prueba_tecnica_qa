import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  /**
   * List of sensitive fields that should be masked in logs.
   */
  private readonly SENSITIVE_FIELDS = ['password', 'token', 'access_token', 'secret', 'credit_card'];

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') ?? '';
    const start = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - start;
      
      // Sanitizamos el body para cumplir con auditoría sin comprometer seguridad
      const sanitizedBody = this.sanitize(req.body);

      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${duration}ms — ${ip} — ${userAgent} | Body: ${JSON.stringify(sanitizedBody)}`
      );
    });

    next();
  }

  /**
   * Recursively masks sensitive fields in an object.
   */
  private sanitize(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const cleanData = { ...data };
    for (const key in cleanData) {
      if (this.SENSITIVE_FIELDS.includes(key.toLowerCase())) {
        cleanData[key] = '********'; // Mask sensitive data
      } else if (typeof cleanData[key] === 'object') {
        cleanData[key] = this.sanitize(cleanData[key]);
      }
    }
    return cleanData;
  }
}