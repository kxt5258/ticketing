import { app } from './app';
import mongoose from 'mongoose';
import { natsWrapper } from './nats-wrapper';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';
import { OrderCreatedListener } from './events/listeners/order-created-event';
import { PaymentCreatedListener } from './events/listeners/payment-created-listener';

const start = async () => {
  console.log('starting payments service');
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }

  if (!process.env.NATS_URI) {
    throw new Error('MONGO_URL must be defined');
  }

  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined');
  }

  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined');
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URI,
    );

    natsWrapper.client.on('close', () => {
      console.log('NATS CLosing');
      process.exit();
    });

    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new OrderCancelledListener(natsWrapper.client).listen();
    new OrderCreatedListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI!, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log('TICKETS: Connected to Mongo');
  } catch (error) {
    console.log(error);
  }

  app.listen(3000, () => {
    console.log('Tickets Listening on 3000!');
  });
};

start();
