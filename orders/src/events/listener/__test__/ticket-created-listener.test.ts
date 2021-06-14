import { TicketCreatedListener } from '../ticket-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketCreatedEvent } from '@kxt5258/common';

import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client);

  // create fake data event
  const data: TicketCreatedEvent['data'] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 34,
    userId: new mongoose.Types.ObjectId().toHexString(),
    title: 'new ticket',
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it('creates and saves a ticket', async () => {
  const { listener, data, msg } = await setup();
  // call the onMessage function
  await listener.onMessage(data, msg);

  // write assertion to see if ticket is created
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();

  expect(ticket?.title).toEqual('new ticket');
  expect(ticket?.price).toEqual(34);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();
  // call the onMessage function
  await listener.onMessage(data, msg);

  // write assertion to see if ack function is called
  expect(msg.ack).toBeCalled();
});
