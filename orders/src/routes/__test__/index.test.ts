import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'Concert',
    price: 20,
  });

  await ticket.save();
  return ticket;
};

it('returns all orders successfully', async () => {
  // create three tickets
  const ticket1 = await buildTicket();
  const ticket2 = await buildTicket();
  const ticket3 = await buildTicket();

  // create one order as user1
  const user1 = global.signin();
  await request(app)
    .post('/api/orders')
    .set('Cookie', user1)
    .send({
      ticketId: ticket1.id,
    })
    .expect(201);

  //create two orders as user2
  const user2 = global.signin();
  const { body: order2 } = await request(app)
    .post('/api/orders')
    .set('Cookie', user2)
    .send({
      ticketId: ticket2.id,
    })
    .expect(201);

  const { body: order3 } = await request(app)
    .post('/api/orders')
    .set('Cookie', user2)
    .send({
      ticketId: ticket3.id,
    })
    .expect(201);

  //fetch all orders for user2
  const { body: orders } = await request(app)
    .get('/api/orders')
    .set('Cookie', user2)
    .expect(200);

  expect(orders.length).toEqual(2);

  expect(orders[0].id).toEqual(order2.id);
  expect(orders[1].id).toEqual(order3.id);
  expect(orders[0].ticket.id).toEqual(ticket2.id);
});
