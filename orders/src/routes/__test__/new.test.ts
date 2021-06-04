import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('returns error if ticket not exist', async () => {
  const ticketId = mongoose.Types.ObjectId();
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId })
    .expect(404);
});

it('returns error if ticket already reserved', async () => {
  const ticket = Ticket.build({
    id: 'djsdkjsd',
    title: 'Test Ticket',
    price: 30,
  });

  await ticket.save();

  const order = Order.build({
    ticket,
    userId: 'dsfsfsfsf',
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });

  await order.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it('reswerves a ticket', async () => {
  const ticket = Ticket.build({
    id: 'djsdkjsd',
    title: 'Test Ticket',
    price: 30,
  });

  await ticket.save();

  const order = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(order.body.ticket.title).toEqual('Test Ticket');
});

it('emits a order event', async () => {
  const ticket = Ticket.build({
    id: 'djsdkjsd',
    title: 'Test Ticket',
    price: 30,
  });

  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
