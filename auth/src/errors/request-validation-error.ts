import { ValidationError } from 'express-validator';
import { CustomError } from './custom-errors';

export class RequestvalidationError extends CustomError {
  statusCode = 400;
  constructor(public errors: ValidationError[]) {
    super('Invalid request data');

    //for extending a builtin class
    Object.setPrototypeOf(this, RequestvalidationError.prototype);
  }

  serializeErrors() {
    return this.errors.map((error) => {
      return { message: error.msg, field: error.param };
    });
  }
}
