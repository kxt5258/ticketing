import {
  Listener,
  Subjects,
  NotFoundError,
  OrderCancelledEvent,
} from '@kxt5258/common';
import { Message } from 'node-nats-streaming';
import { queueGroupname } from './queue-group-name';
import { Ticket } from '../../models/tickets';
import { TicketUpdatedPublisher } from '../publisher/ticket-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  readonly queueGroup = queueGroupname;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    // get the ticket the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);

    // if no ticket, throw error
    if (!ticket) {
      throw new NotFoundError();
    }

    // mark ticket as reserved by updating ticket's OrderCreatedListener
    ticket.set({ orderId: undefined });

    // save ticket
    await ticket.save();

    // publish an TicketUpdatedEvent
    new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      orderId: ticket.orderId,
      version: ticket.version,
    });

    // ack msg
    msg.ack();
  }
}
