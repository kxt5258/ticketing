import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

it('Throws a unauthorized error if user accesses others order', async () => {
  const ticket = Ticket.build({
    title: 'Concert',
    price: 20,
  });

  await ticket.save();

  const user1 = global.signin();

  const order = await request(app)
    .post('/api/orders')
    .set('Cookie', user1)
    .send({ ticketId: ticket.id })
    .expect(201);

  const user2 = global.signin();

  await request(app)
    .get(`/api/orders/${order.body.id}`)
    .set('Cookie', user2)
    .expect(401);
});

it('fetches the order if users own the order', async () => {
  const ticket = Ticket.build({
    title: 'Concert',
    price: 20,
  });

  await ticket.save();

  const user1 = global.signin();

  const order = await request(app)
    .post('/api/orders')
    .set('Cookie', user1)
    .send({ ticketId: ticket.id })
    .expect(201);

  const fetchedOrder = await request(app)
    .get(`/api/orders/${order.body.id}`)
    .set('Cookie', user1)
    .expect(200);

  expect(fetchedOrder.body.id).toEqual(order.body.id);
});
