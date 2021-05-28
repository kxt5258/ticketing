import request from 'supertest';
import { app } from '../../app';

const createTicket = () => {
  return request(app).post('/api/tickets').set('Cookie', global.signin()).send({
    title: 'Test',
    price: 10,
  });
};

it('fetch all the tickets', async () => {
  await createTicket();
  await createTicket();
  await createTicket();

  const response = await request(app).get('/api/tickets').send({});

  expect(response.status).toEqual(200);
  expect(response.body.length).toEqual(3);
});
