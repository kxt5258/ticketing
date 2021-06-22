import { Listener, OrderCreatedEvent, Subjects } from '@kxt5258/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './que-group-name';
import { Order } from '../../models/order';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  readonly queueGroup = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const order = Order.build({
      id: data.id,
      userId: data.userId,
      status: data.status,
      version: data.version,
      price: data.ticket.price,
    });

    await order.save();

    msg.ack();
  }
}
