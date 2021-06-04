import {
  Listener,
  TicketCreatedEvent,
  Subjects,
  TicketUpdatedEvent,
} from '@kxt5258/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TickerUpdated;
  queueGroup: string = queueGroupName;

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const { id, title, price } = data;
    const ticket = await Ticket.findById(id);

    if (!ticket) throw new Error('Ticket not found');

    ticket.set({ title, price });
    await ticket.save();

    msg.ack();
  }
}
