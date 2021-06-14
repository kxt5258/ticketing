import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedEvent } from '@kxt5258/common';

import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { TicketUpdatedListener } from '../ticket-updated-listener';

const setup = async () => {
  // create an instance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  //create and save a ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'new ticket',
    price: 56,
  });

  await ticket.save();

  // create fake data event
  const data: TicketUpdatedEvent['data'] = {
    version: ticket.version + 1,
    id: ticket.id,
    price: 40,
    userId: new mongoose.Types.ObjectId().toHexString(),
    title: 'updated ticket',
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it('updates and saves a ticket successfully', async () => {
  const { listener, data, msg } = await setup();
  // call the onMessage function
  await listener.onMessage(data, msg);

  // write assertion to see if ticket is created
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();

  expect(ticket?.title).toEqual(data.title);
  expect(ticket?.price).toEqual(data.price);
  expect(ticket?.version).toEqual(data.version);
});

it('acks the message when ticket is updated', async () => {
  const { listener, data, msg } = await setup();
  // call the onMessage function
  await listener.onMessage(data, msg);

  // ack is called
  expect(msg.ack).toBeCalled();
});

it('does not call ack function if event has skipped version', async () => {
  const { listener, data, msg } = await setup();

  data.version = 30;

  try {
    await listener.onMessage(data, msg);
  } catch (error) {}

  //const updatedTicket = await Ticket.findById(data.id);

  expect(msg.ack).not.toHaveBeenCalled();
});
