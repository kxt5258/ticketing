import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/tickets';
import {
  OrderCreatedEvent,
  OrderStatus,
  OrderCancelledEvent,
} from '@kxt5258/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCancelledListener } from '../order-cancelled-listener';

const setup = async () => {
  // craete an instance of listsner
  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId = mongoose.Types.ObjectId().toHexString();
  // create a ticket
  const ticket = Ticket.build({
    title: 'Concert',
    price: 90,
    userId: 'dsdfsf',
  });
  ticket.set({ orderId });
  await ticket.save();

  // create fake data object
  const data: OrderCancelledEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

it('unsets the orderId of ticket, acks the msg, and published event when order is cancelled', async () => {
  const { listener, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket?.orderId).toBeUndefined();

  // acknowledge the event
  expect(msg.ack).toHaveBeenCalled();

  // call the publish method -> publish TicketUpdatedEvent event
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
