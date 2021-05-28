import buildClient from '../api/build-client';

const LandingPage = ({ currentUser }) => {
  return currentUser ? (
    <h1>You're signed in {currentUser.email}</h1>
  ) : (
    <h1>Please signin</h1>
  );
};

//NextJS will call this when rendering on server
//and pass it to component as prop
// http://SVC-NAME.NS.svc.cluster.local
LandingPage.getInitialProps = async (context) => {
  const axios = buildClient(context);
  const { data } = await axios.get('/api/users/currentuser');
  return data;
};

export default LandingPage;
