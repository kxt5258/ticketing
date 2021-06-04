import { Publisher, OrderCreatedEvent, Subjects } from '@kxt5258/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
