import mongoose from 'mongoose';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { Order } from '../../../models/order';
import { OrderStatus, OrderCancelledEvent } from '@kxt5258/common';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    version: 2,
    price: 45,
    userId: 'fsfsffs',
    status: OrderStatus.Created,
  });

  await order.save();

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: order.version + 1,
    ticket: {
      id: 'sfasjdfhaf',
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, order };
};

it('cancels the order correctly', async () => {
  const { listener, data, msg, order } = await setup();
  await listener.onMessage(data, msg);

  const cancelledOrder = await Order.findById(order.id);

  expect(cancelledOrder?.status).toEqual(OrderStatus.Cancelled);
});

it('send the ack to the message', async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
