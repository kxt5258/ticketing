import express, { Response, Request } from 'express';
import { requireAuth, validateRequest, NotFoundError } from '@kxt5258/common';
import { body } from 'express-validator';
import { Ticket } from '../models/tickets';

const router = express.Router();

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    throw new NotFoundError();
  }
  res.status(200).send(ticket);
});

export { router as showTicketRouter };
