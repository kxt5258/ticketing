import {
  PaymentCreatedEvent,
  Listener,
  Subjects,
  OrderStatus,
} from '@kxt5258/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/order';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  readonly queueGroup = queueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) throw new Error('Order not found');

    console.log('ORDER COMPLETED FINAL ', data);
    order.set({ status: OrderStatus.Complete });

    await order.save();

    msg.ack();
  }
}
