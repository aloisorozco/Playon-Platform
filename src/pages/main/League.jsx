import React, { useContext, useEffect, useState } from 'react'

import { Link, useParams } from 'react-router-dom'

import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { useAuthState } from 'react-firebase-hooks/auth'

import AuthContext from '../../context/AuthContext'

function League() {

  const [teams, setTeams] = useState([])
  const [leagueNameLoading, setLeagueNameLoading] = useState(true)
  const [leagueName, setLeagueName] = useState()
  const [managerId, setManagerId] = useState()
  const {id} = useParams()

  const {auth, firestore} = useContext(AuthContext)
  const [user, loading] = useAuthState(auth)

  const fetchTeams = async () => {

    firestore.collection(`leagues/${id}/teams`).onSnapshot((snapshot) => {

      let temp = []
      snapshot.forEach((item) => {
        temp.push({id: item.id, ...item.data()})
      })
      setTeams(temp)
    })
  }

  const getLeague = async () => {
    firestore.collection('leagues').doc(id).get().then((snapshot) => {
      if (snapshot.data()) {
        setLeagueName(snapshot.data().name)
        setManagerId(snapshot.data().managerId)
        setLeagueNameLoading(false)
      }
    }).catch((e) => {

    })
  }

  useEffect(() => {
    fetchTeams()
    getLeague()
  }, [])
 
  return (
    <div className='grid place-items-center'>
      <div className="card w-60 bg-base-100 shadow-xl">
        <table className="table text-lg w-full text-left">
          {/* head */}
          <thead>
            {(leagueNameLoading) ? <></> : <tr>
              <th className='text-lg flex flex-row justify-center'>
                {leagueName}
                {(user.uid == managerId) && 
                  <Link to='edit' className='pl-2 link link-hover text-center'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                    </svg>    
                  </Link>            
                }
              </th>
            </tr>}
          </thead>
          <tbody className='flex flex-col'>
            {teams.map( (team, index) => (
              <TeamItem team={team} index={index} key={team.id} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TeamItem({team, index}) {
  return (
    <Link to={`team/${team.id}`}>
      <tr className='hover flex flex-row' id={team.id}>
        <th>{index + 1}</th>
        <td className='grow'>{team.name}</td>
      </tr>
    </Link>
  )
}

export default League