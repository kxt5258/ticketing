import { Publisher, Subjects, TicketUpdatedEvent } from '@kxt5258/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TickerUpdated;
}
