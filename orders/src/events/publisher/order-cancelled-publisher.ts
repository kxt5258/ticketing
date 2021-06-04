import { Publisher, OrderCancelledEvent, Subjects } from '@kxt5258/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
