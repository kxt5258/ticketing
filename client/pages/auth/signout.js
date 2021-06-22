import { useEffect } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const Signout = () => {
  const [doRequest, errors] = useRequest({
    url: '/api/users/signout',
    method: 'post',
    body: {},
    onSuccess: () => Router.push('/'),
  });

  useEffect(async () => {
    await doRequest();
  }, []);

  return <div>Logging you out</div>;
};

export default Signout;
