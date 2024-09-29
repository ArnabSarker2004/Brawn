import { Login } from '../components/ui/login';
import React, { useState } from 'react';

const Signup = () => {
  // State to manage the logged-in user
  const [loggedInUser, setLoggedInUser] = useState(null);

  return (
    <Login setLoggedInUser={setLoggedInUser} />
  );
};

export default Signup;
