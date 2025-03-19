import React, { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth'

import AuthContext from '../context/AuthContext';

function Protected() {

  const {auth} = useContext(AuthContext)
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <></>
  }
  else {
    return (
      (user) ? <Outlet /> : <Navigate to='/login' />
    )
  }
}

export default Protected