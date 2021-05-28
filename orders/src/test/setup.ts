import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
  namespace NodeJS {
    interface Global {
      signin(): string[];
    }
  }
}

//make jest redirect the import for nats-wrapper to this mock implementation
jest.mock('../nats-wrapper.ts');

let mongo: MongoMemoryServer;
beforeAll(async () => {
  process.env.JWT_KEY = 'qwerty';
  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  //reset all data before each test
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = () => {
  //build a JWT payload
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com',
  };
  //create jwt
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  //build session object: {jwt: JWT}
  const session = { jwt: token };

  // tuen session to JSON
  const sessionJSON = JSON.stringify(session);

  //take JSONa nd encode using base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  //return the cookie
  return [`express:sess=${base64}`];
};
