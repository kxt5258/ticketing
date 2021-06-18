import { Listener, OrderCreatedEvent, Subjects } from '@kxt5258/common';
import { Message } from 'node-nats-streaming';
import { queueGroupname } from './queue-group-name';
import { expirationQueue } from '../../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  readonly queueGroup = queueGroupname;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log(
      `Will wait for ${delay}  seconds to publish the expiration event`,
    );

    await expirationQueue.add(
      {
        orderId: data.id,
      },
      {
        delay: delay,
      },
    );

    msg.ack();
  }
}
