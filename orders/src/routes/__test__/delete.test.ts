import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';

it('deletes the order as expected', async () => {
  const ticket = Ticket.build({
    title: 'Test',
    price: 20,
  });
  await ticket.save();

  const user = global.signin();
  const order = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.body.id}`)
    .set('Cookie', user)
    .send({})
    .expect(204);

  const deletedOrder = await Order.findById(order.body.id);

  expect(deletedOrder?.status).toEqual(OrderStatus.Cancelled);
});

it.todo('Emit OrderCancelled event');
