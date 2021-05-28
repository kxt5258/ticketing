import express, { Response, Request } from 'express';
import { requireAuth, validateRequest } from '@kxt5258/common';
import { body } from 'express-validator';
import { Ticket } from '../models/tickets';
import { TicketCreatedPublisher } from '../events/publisher/ticket-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/api/tickets',
  [requireAuth],
  [
    body('title').not().isEmpty().withMessage('Title is invalid'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;

    const ticket = Ticket.build({ title, price, userId: req.currentUser?.id! });

    await ticket.save();

    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });

    res.status(201).send(ticket);
  },
);

export { router as createTicketRouter };
