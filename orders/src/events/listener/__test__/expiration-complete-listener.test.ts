import mongoose from 'mongoose';
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Order, OrderStatus } from '../../../models/order';
import { Ticket } from '../../../models/ticket';
import { ExpirationCompleteEvent } from '@kxt5258/common';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'ConCERT',
    price: 56,
  });

  await ticket.save();

  const order = Order.build({
    status: OrderStatus.Created,
    userId: 'dsfsf',
    expiresAt: new Date(),
    ticket,
  });

  await order.save();

  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { ticket, order, data, msg, listener };
};

it('it updates the order status to cancelled', async () => {
  const { ticket, order, data, msg, listener } = await setup();
  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);
});

it('emits an order cancelled event when expiration event is received', async () => {
  const { ticket, order, data, msg, listener } = await setup();
  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1],
  );

  expect(eventData.id).toEqual(order.id);
});

it('acks the message', async () => {
  const { ticket, order, data, msg, listener } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
