import {
  OrderCancelledEvent,
  Listener,
  Subjects,
  OrderStatus,
} from '@kxt5258/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './que-group-name';
import { Order } from '../../models/order';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  readonly queueGroup = queueGroupName;
  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1,
    });

    console.log('CANCELLED: ', data);
    if (!order) {
      throw new Error('Order not found');
    }

    order.set({ status: OrderStatus.Cancelled });

    await order.save();

    msg.ack();
  }
}
