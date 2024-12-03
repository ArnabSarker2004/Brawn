import { Login } from '../components/ui/login';
import React, { useState } from 'react';

const Signup = () => {
  const [loggedInUser, setLoggedInUser] = useState(null);

  return (
    <Login setLoggedInUser={setLoggedInUser} />
  );
};

export default Signup;
