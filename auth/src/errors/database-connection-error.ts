import { ValidationError } from 'express-validator';
import { CustomError } from './custom-errors';

export class DatabaseConnectionError extends CustomError {
  reason = 'Error connecting to DB';
  statusCode = 503;
  constructor() {
    super('Error connecting to DB');

    //for extending a builtin class
    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }

  serializeErrors() {
    return [{ message: this.reason }];
  }
}
