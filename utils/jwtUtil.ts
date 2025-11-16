import jwt from 'jsonwebtoken';

export const jwtUtil = {
  /**
   * Generate a JWT token
   */
  sign(payload: any, secret: string = process.env.JWT_SECRET || 'secret', options: any = {}): string {
    return jwt.sign(payload, secret, {
      expiresIn: '7d',
      ...options,
    });
  },

  /**
   * Verify a JWT token
   */
  verify(token: string, secret: string = process.env.JWT_SECRET || 'secret'): any {
    return jwt.verify(token, secret);
  },

  /**
   * Decode a JWT token without verification
   */
  decode(token: string): any {
    return jwt.decode(token);
  },
};
