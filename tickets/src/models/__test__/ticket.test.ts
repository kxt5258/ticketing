import { Ticket } from '../tickets';

it('implements the optimistic concurrency control', async (done) => {
  //create a ticekt
  const ticket = Ticket.build({
    title: 'Concert',
    price: 6,
    userId: '424rr',
  });

  //save the ticket to db
  await ticket.save();

  //fetch the ticket twice
  const firstTicket = await Ticket.findById(ticket.id);
  const secondTicket = await Ticket.findById(ticket.id);

  //make changes to the tickets instances
  firstTicket?.set({ price: 50 });
  secondTicket?.set({ price: 40 });

  //save the first ticket
  await firstTicket?.save();

  //save second ticket

  try {
    await secondTicket?.save();
  } catch (error) {
    return done();
  }

  //expect to fail
  throw new Error(' optimistic concurrency control is not working');
});

it('increments the version correctly', async () => {
  const ticket = Ticket.build({
    title: 'Concert',
    price: 6,
    userId: '424rr',
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);

  await ticket.save();
  expect(ticket.version).toEqual(1);

  await ticket.save();
  expect(ticket.version).toEqual(2);
});
