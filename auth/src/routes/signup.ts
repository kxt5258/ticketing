import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { BadRequestError, validateRequest } from '@kxt5258/common';

import { User } from '../models/user';

const router = express.Router();

router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('Invalid Email'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Passwords must be between 4 and 20 charaters'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError('User already created');
    }

    const user = User.build({ email, password });
    await user.save();

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

    return res.status(201).send(user);
  },
);

export { router as signupRouter };
