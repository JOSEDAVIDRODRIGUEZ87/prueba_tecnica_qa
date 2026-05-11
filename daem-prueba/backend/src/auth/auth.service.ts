import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/**
 * Interface for the JWT Payload to ensure type safety.
 * Only non-sensitive identification data should be included.
 */
interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private jwtService: JwtService) {}

  /**
   * Validates user credentials and generates a secure JWT.
   * REP-07 Fix: Sensitive data (password) removed from the token payload.
   */
  login(email: string, password: string): { access_token: string } {
    // Simulated validation - In a real scenario, this would check against a hashed password in DB
    if (email !== 'admin@daem.es' || password !== 'test1234') {
      this.logger.warn(`Failed login attempt for email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // REP-07 Fix: Define a safe payload without sensitive information.
    // JWTs are not encrypted, only signed; anyone can decode the base64 and see the data.
    const payload: JwtPayload = {
      sub: 1,
      email: email,
      role: 'admin', // Changed 'rol' to 'role' for English naming standards
    };

    return { 
      access_token: this.jwtService.sign(payload) 
    };
  }
}