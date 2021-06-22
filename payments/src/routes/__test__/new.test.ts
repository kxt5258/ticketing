import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Order } from '../../models/order';
import { OrderStatus } from '@kxt5258/common';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

//jest.mock('../../stripe');

it("it returns 404 when purchashing order that doesn't exist", async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'adadda',
      orderId: mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it("it returns 401 when purchashing order that doesn't belong to the user", async () => {
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 56,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'adadda',
      orderId: order.id,
    })
    .expect(401);
});

it('it returns 400 when purchashing order that is cancelled', async () => {
  const userId = mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: 56,
    status: OrderStatus.Cancelled,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'adadda',
      orderId: order.id,
    })
    .expect(400);
});

/* //USING THE MOCK FUNCTION
it('it returns 201 and calls stripe function with valid inputs', async () => {
  const userId = mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: 56,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201);

  const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  expect(chargeOptions.source).toEqual('tok_visa');
  expect(chargeOptions.amount).toEqual(56 * 100);
  expect(chargeOptions.currency).toEqual('usd');

}); */

it('it returns 201 and calls stripe function with valid inputs', async () => {
  const userId = mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 10000);

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201);

  const stripeCharges = await stripe.charges.list({
    limit: 30,
  });

  const stripeCharge = stripeCharges.data.find((charge) => {
    return charge.amount === price * 100;
  });

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge?.currency).toEqual('usd');

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge?.id,
  });

  expect(payment).not.toBeNull();
});
