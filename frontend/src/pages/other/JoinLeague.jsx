import React, { useState, useContext, useEffect } from 'react'

import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { useAuthState } from 'react-firebase-hooks/auth'

import AuthContext from '../../context/AuthContext'

import { useNavigate } from 'react-router-dom';

function JoinLeague() {

  const { auth, firestore } = useContext(AuthContext)

  const [code, setCode] = useState('')
  const [error, setError] = useState()
  const [user, loading] = useAuthState(auth);

  const navigate = useNavigate()

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError(null)
      }, 5000)
    }
  }, error)

  // const generalRef = collection(db, `users/${user.id}/general`);
  // const general = awaitDoc(generalRef, {
  //   data: 'new document in sub-collection general'
  // });

  const addTeam = async (leagueId) => {
    while (loading);
    firestore.collection(`leagues/${leagueId}/teams`).add({
      managerId: user.uid,
      name: `${user.displayName}'s Team`,
    }).then((ref) => {
      //console.log(ref.data())
      navigate(`/league/${leagueId}`)
    }).catch((e => {
      setError('Unable to add team')
    }))
  }

  const isInLeague = (async (leagueId) => {
    firestore.collection(`leagues/${leagueId}/teams`).get().then((querySnapshot) => {

      let inLeague = false

      querySnapshot.forEach((doc) => {
        while (loading);
        if (user.uid == doc.data().managerId) {
          inLeague = true
        }
      })

      if (!inLeague) {
        addTeam(leagueId)
      }
      else {
        setError('Team already exists')
      }

    }).catch((e) => {

    })
    return false
  })

  const leagueExists = (async (leagueId) => {
    firestore.collection('leagues').doc(leagueId).get().then((snapshot) => {
      if (snapshot.data()) {
        isInLeague(leagueId)
      }
    }).catch((e) => {

    })

  })

  const joinLeague = (async (leagueId) => {
    leagueExists(leagueId)
    //navigate(`/league/${leagueId}`)
  })

  const handleCodeChange = (e) => {
    setCode(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    joinLeague(code)
  }

  return (
    <div className='grid place-items-center'>
      <div className="card w-60 bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title mb-2">Join League</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-control space-y-4">
              <input type='text' placeholder='league code' className="input w-full text-center max-w-xs" id='code' key='code' onChange={handleCodeChange} />
              <button type='submit' className='btn btn-ghost'>
                Submit
              </button>
            </div>
          </form>

          {(error) &&
            <div className="alert alert-error shadow-lg">
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{error}</span>
              </div>
            </div>
          }

        </div>
      </div>
    </div>
  )
}

export default JoinLeague