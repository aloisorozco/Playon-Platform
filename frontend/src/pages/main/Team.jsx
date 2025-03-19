import React, { useContext, useEffect, useState } from 'react'

import { Link, useParams } from 'react-router-dom'

import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { useAuthState } from 'react-firebase-hooks/auth'

import AuthContext from '../../context/AuthContext'

function Team() {

  const {auth, firestore} = useContext(AuthContext)
  const [user, loading] = useAuthState(auth)

  const [players, setPlayers] = useState([])
  const [teamNameLoading, setTeamNameLoading] = useState(true)
  const [teamName, setTeamName] = useState()
  const [managerId, setManagerId] = useState()
  const [error, setError] = useState()

  const {leagueId, teamId} = useParams()

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError(null)
      }, 5000)
    }
  }, error)

  const getTeam = async () => {
    firestore.collection('leagues').doc(leagueId).collection('teams').doc(teamId).get().then((snapshot) => {
      if (snapshot.data()) {
        setTeamName(snapshot.data().name)
        setManagerId(snapshot.data().managerId)
        setTeamNameLoading(false)
      }
    }).catch((e) => {

    })
  }

  const getPlayers = async () => {

    firestore.collection(`leagues/${leagueId}/players`).where('teamId', '==', teamId).onSnapshot((snapshot) => {

      let temp = []
      snapshot.forEach((item) => {
        temp.push({id: item.id, ...item.data()})
      })
      setPlayers(temp)
    })
  }

  useEffect(() => {
    getTeam()
    getPlayers()
  }, [])

  return (
    <div className='grid place-items-center'>
      <div className="card w-60 bg-base-100 shadow-xl">
        <table className="table text-lg w-full text-center">
          {/* head */}
          <thead>
            {(teamNameLoading) ? <></> : <tr>
              <th className='text-lg'>
                {teamName}
                {(user.uid == managerId) && 
                  <Link to='edit' className='pl-2 link link-hover text-center'>
                    {/* todo: fix css so its all on one line */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                    </svg>    
                  </Link>            
                }
              </th>
            </tr>}
          </thead>
          <tbody>
            { players.map( (player) => (
              <PlayerItem player={player} key={player.id} />
            )) }
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PlayerItem({player}) {

  return (
    <tr className='hover' id={player.id} key={player.id}>
      <td>
        <div className='flex flex-row space-x-4 justify-center'>
          <p>{player.position}</p>
          <p>{player.name}</p>
          <p>{player.fantasyPoints}</p>
        </div>
      </td>
    </tr>
  )
}

export default Team