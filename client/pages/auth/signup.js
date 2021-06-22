import { useState } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';
import Signout from './signout';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [doRequest, errors] = useRequest({
    url: '/api/users/signup',
    method: 'post',
    body: { email, password },
    onSuccess: () => Router.push('/'),
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    await doRequest();
  };

  return (
    <form onSubmit={onSubmit}>
      <h1>Signup</h1>
      <div className='form-group'>
        <label htmlFor='email'>Email address</label>
        <input
          type='text'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='form-control'
        />
      </div>
      <div className='form-group'>
        <label htmlFor='password'>Password</label>
        <input
          type='password'
          alue={password}
          onChange={(e) => setPassword(e.target.value)}
          className='form-control'
        />
      </div>
      {errors}
      <button className='btn btn-primary'>Sign Up</button>
    </form>
  );
};

export default Signup;
