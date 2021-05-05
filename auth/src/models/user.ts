import mongoose from 'mongoose';
import { Password } from '../services/password';

//An interface describing the user Atributes
interface UserAttrs {
  email: string;
  password: string;
}

//An interface that describes user properties
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

//interface for user document
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

//toJSON is used to transform the return values of json object
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
      },
      versionKey: false,
    },
  },
);

userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hash = await Password.toHash(this.get('password'));
    this.set('password', hash);
  }
  done();
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
