import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';

import Header from '../component/header';

const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div className='container'>
      <Header currentUser={currentUser} />
      <Component {...pageProps} />
    </div>
  );
};

AppComponent.getInitialProps = async (appContext) => {
  const axios = buildClient(appContext.ctx);
  const { data } = await axios.get('/api/users/currentuser');

  let pageProps = {};

  //call getInitialProps defined in respective pages
  if (appContext.Component.getInitialProps)
    pageProps = await appContext.Component.getInitialProps(appContext.ctx);

  return { pageProps, ...data };
};

export default AppComponent;
