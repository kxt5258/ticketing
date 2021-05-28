import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { validateRequest, BadRequestError } from '@kxt5258/common';

import { User } from '../models/user';
import { Password } from '../services/password';

const router = express.Router();

router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').trim().notEmpty().withMessage('Missing password'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw new BadRequestError('Invalid credentials');
    }

    const passMatch = await Password.compare(user.password, password);

    if (!passMatch) {
      throw new BadRequestError('Invalid credentials');
    }

    //generate jwt and store on session obj
    // - ! = force typescript to not chekc
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY!,
    );

    //store
    req.session = {
      jwt: userJwt,
    };

    res.status(200).send(user);
  },
);

export { router as signinRouter };
