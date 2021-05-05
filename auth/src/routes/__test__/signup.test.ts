import request from 'supertest';
import { app } from '../../app';

it('returns a 201 on successful signup', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);
});

it('returns a 400 wit invalid email', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test',
      password: 'password',
    })
    .expect(400);
});

it('returns a 400 wit invalid password', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'q',
    })
    .expect(400);
});

it('returns a 400 with missing emaila dn password', async () => {
  await request(app).post('/api/users/signup').send({}).expect(400);
});

it('disallows duplicate emails', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'qdfsfsf',
    })
    .expect(201);

  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'qdfsfsf',
    })
    .expect(400);
});

it('sets a cookir after successful signip', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'qdfsfsf',
    })
    .expect(201);

  expect(response.get('Set-Cookie')).toBeDefined();
});
