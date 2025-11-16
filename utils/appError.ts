import { HttpCode } from '../constants/httpCode.js';

class AppError extends Error {
  public readonly statusCode: HttpCode;

  constructor(message: string, statusCode: HttpCode) {
    super(message);
    this.statusCode = statusCode;

    // Ensures the 'name' property of the error is 'Error'
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;