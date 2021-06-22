import { Publisher, PaymentCreatedEvent, Subjects } from '@kxt5258/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
