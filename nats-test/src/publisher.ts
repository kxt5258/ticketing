import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';

console.clear();

const stan = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222',
});

stan.on('connect', async () => {
  console.log('Publisher connected to nats');

  const publisher = new TicketCreatedPublisher(stan);

  const data = {
    id: '42742984',
    title: 'Concert',
    price: 405,
  };

  try {
    await publisher.publish(data);
  } catch (err) {
    console.log('ERROR', err);
  }
});
