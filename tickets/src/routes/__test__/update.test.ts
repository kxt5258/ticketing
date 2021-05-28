import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { natsWrapper } from '../../nats-wrapper';
it('returns 404 if provided id not exists', async () => {
  const fake_id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${fake_id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'Test',
      price: 56,
    })
    .expect(404);
});

it('returns 401 if user is not authenticated', async () => {
  const fake_id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${fake_id}`)
    .send({
      title: 'Test',
      price: 56,
    })
    .expect(401);
});

it('returns 401 if user is not ticket owner', async () => {
  //create a ticket
  const ticket = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'Teshsff',
      price: 64,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'ijjfsbkjfs',
      price: 533,
    })
    .expect(401);
});

it('returns 400 if user provides invalid title or price', async () => {
  const cookie = global.signin();
  const ticket = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Teshsff',
      price: 64,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${ticket.body.userId}`)
    .set('Cookie', cookie)
    .send({
      title: 'shjfhsf',
      price: 0,
    })
    .expect(400);
});

it('updates the ticket if everything is ok', async () => {
  const cookie = global.signin();
  const ticket = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Teshsff',
      price: 64,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'shjfhsf',
      price: 4,
    })
    .expect(200);

  const response = await request(app)
    .get(`/api/tickets/${ticket.body.id}`)
    .send();

  expect(response.body.title).toEqual('shjfhsf');
  expect(response.body.price).toEqual(4);
});

it('publishes an event if ticket is updated', async () => {
  const cookie = global.signin();
  const ticket = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Teshsff',
      price: 64,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${ticket.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'shjfhsf',
      price: 4,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
