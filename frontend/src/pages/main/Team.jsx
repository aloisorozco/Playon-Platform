import React, { useContext, useEffect, useState } from 'react'

import { Link, useParams } from 'react-router-dom'

import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { useAuthState } from 'react-firebase-hooks/auth'

import AuthContext from '../../context/AuthContext'
import PlayerItem, { playerItemType } from '../../components/PlayerItem';
import { FirestoreProvider } from '../../context/FirestoreContext';

function TeamOuter() {
  return (
    <FirestoreProvider>
      <Team />
    </FirestoreProvider>
  )
}

function Team() {
  const { auth, firestore } = useContext(AuthContext)
  const [user, loading] = useAuthState(auth)

  const [players, setPlayers] = useState([])
  const [teamLoading, setTeamLoading] = useState(true)
  const [team, setTeam] = useState({})
  const [error, setError] = useState()

  const { id, teamId } = useParams()

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError(null)
      }, 5000)
    }
  }, [error])

  const getTeam = async () => {
    firestore.collection('leagues').doc(id).collection('teams').doc(teamId).get().then((snapshot) => {
      if (snapshot.data()) {
        setTeam(snapshot.data())
        setTeamLoading(false)
      }
    }).catch((e) => {

    })
  }

  const getPlayers = async () => {

    firestore.collection(`leagues/${id}/players`).where('teamId', '==', teamId).onSnapshot((snapshot) => {

      let temp = []
      snapshot.forEach((item) => {
        temp.push({ id: item.id, ...item.data() })
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
      <div className="card w-[60vw] bg-base-100 shadow-xl">
        <table className="table text-lg w-full text-center">
          {/* head */}
          <thead>
            {(teamLoading) ? <></> : <tr>
              <th className='text-lg flex flex-row justify-center'>
                {`${team?.name} (${user?.displayName})`}
                {(user.uid === team?.managerId) &&
                  <Link to='edit' className='pl-2 link link-hover text-center'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                    </svg>
                  </Link>
                }
              </th>
            </tr>}
          </thead>
        </table>
        <div className='flex flex-col space-y-4 mx-2 overflow-y-scroll h-[60vh]'>
          <div className='hover'>
            <div>
              <form>
                <div className='flex flex-row space-x-4 justify-center'>
                  <input type='text' id='team' key='team' value="Team" className='w-[6ch] focus:outline-none' readOnly />
                  <input type='text' id='position' key='position' value="Position" className='w-[10ch] focus:outline-none' readOnly />
                  <input type='text' id='name' key='name' value='Name' className={`w-[10ch] focus:outline-none`} readOnly />
                  <input type='text' id='pointsAccumulated' key='pointsAccumulated' value="Points Accumulated" className={`w-[20ch] focus:outline-none`} readOnly />
                </div>
              </form>
            </div>
          </div>
          {players.map((player) => (
            <PlayerItem player={player} key={player.id} playerType={playerItemType.team} />
          ))}
        </div>
      </div>
    </div>
  )
}

/*function PlayerItem({ player }) {

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
}*/

export default TeamOuter