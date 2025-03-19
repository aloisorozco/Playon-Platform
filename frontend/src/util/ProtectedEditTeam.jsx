import React, { useContext, useEffect, useState } from 'react'
import { Navigate, Outlet, useParams } from 'react-router-dom';

import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { useAuthState } from 'react-firebase-hooks/auth'

import AuthContext from '../context/AuthContext';

function ProtectedEditTeam() {
  const {auth, firestore} = useContext(AuthContext)
  const [user, loading] = useAuthState(auth)
  const [managerId, setManagerId] = useState()

  const {leagueId, teamId} = useParams()

  useEffect(() => {
    firestore.collection('leagues').doc(leagueId).collection('teams').doc(teamId).get().then((snapshot) => {
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

export default ProtectedEditTeam