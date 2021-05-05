import { CustomError } from './custom-errors';

export class BadRequestError extends CustomError {
  statusCode = 400;

  constructor(private msg: string) {
    super(msg);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeErrors() {
    return [
      {
        message: this.msg,
      },
    ];
  }
}
