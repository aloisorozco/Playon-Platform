import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import 'firebase/compat/firestore';
import { useAuthState } from 'react-firebase-hooks/auth'

import AuthContext from '../../context/AuthContext'

function Main() {
  const { auth, firestore } = useContext(AuthContext)
  const [user, loading] = useAuthState(auth)
  const [leagues, setLeagues] = useState([])

  const fetchLeagues = async () => {
    firestore.collection('leagues').onSnapshot((snapshot) => {

      snapshot.forEach((item) => {
        firestore.collection(`leagues/${item.id}/teams`).onSnapshot((snap) => {
          snap.forEach((team) => {
            const teamInfo = team.data()
            if (teamInfo.managerId === user.uid && leagues[item.id] == null) {
              setLeagues({ [item.id]: { id: item.id, ...item.data() }, ...leagues })
            }
          })
        })
      })
    })
  }

  useEffect(() => {
    fetchLeagues()
  }, [])

  return (
    <div className='grid place-items-center'>
      <div className="card w-60 bg-base-100 shadow-xl">
        <table className="table text-lg w-full text-center">
          {/* head */}
          <thead>
            <tr>
              <th className='text-lg'>Leagues</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(leagues).map((league) => (
              <LeagueItem league={league} key={league.id} />
            ))}
          </tbody>
        </table>
        <Link to='/joinleague' className='link link-hover text-center px-4 mb-2'>Got a league code? Join league</Link>
      </div>
    </div>
  )
}

function LeagueItem({ league }) {

  return (
    <tr className='hover' id={league.id}>
      <Link to={`/league/${league.id}`}>
        <td>{league.name}</td>
      </Link>
    </tr>
  )
}

export default Main