import React, { useContext, useEffect, useState } from 'react'
import { Navigate, Outlet, useParams } from 'react-router-dom';

import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { useAuthState } from 'react-firebase-hooks/auth'

import AuthContext from '../context/AuthContext';

function ProtectedEditLeague() {
  const {auth, firestore} = useContext(AuthContext)
  const [user, loading] = useAuthState(auth)
  const [managerId, setManagerId] = useState()

  const {id} = useParams()

  useEffect(() => {
    firestore.collection('leagues').doc(id).get().then((snapshot) => {
      setManagerId(snapshot.data().managerId)
    }).catch((e) => {
      //console.log(e)
    })
  }, [])

  if (loading || !managerId) {
    return <></>
  }
  else if (!user) {
    return <Navigate to='/login' />
  }
  else {
    return (
      (user.uid == managerId) ? <Outlet /> : <Navigate to='/' />
    )
  }
}

export default ProtectedEditLeague