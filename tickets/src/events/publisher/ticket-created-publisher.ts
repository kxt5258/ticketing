import { Publisher, Subjects, TicketCreatedEvent } from '@kxt5258/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
