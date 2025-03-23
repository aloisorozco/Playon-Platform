import React, { useContext, useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { useAuthState } from 'react-firebase-hooks/auth'

import { Button } from '@mui/material';

import AuthContext from '../../context/AuthContext'
import FirestoreContext, { FirestoreProvider } from '../../context/FirestoreContext';

function LeagueOuter() {
  return (
    <FirestoreProvider>
      <League />
    </FirestoreProvider>
  )
}

function League() {

  const { league, teams } = useContext(FirestoreContext)

  const { auth, firestore } = useContext(AuthContext)
  const [user, loading] = useAuthState(auth)
  const navigate = useNavigate()

  return (
    <div className='grid place-items-center'>
      <div className="card w-60 bg-base-100 shadow-xl">
        <table className="table text-lg w-full text-left">
          {/* head */}
          <thead>
            <tr>
              <th className='text-lg flex flex-row justify-center'>
                {league?.name}
                {(user.uid == league?.managerId) &&
                  <Link to='edit' className='pl-2 link link-hover text-center'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                    </svg>
                  </Link>
                }
              </th>
            </tr>
          </thead>
          <tbody className='flex flex-col'>
            {league?.draftOrder &&
              <div className='flex flex-col items-center'>
                <button className='btn btn-md m-2' onClick={() => navigate('draft')}>Enter Draft Room</button>
              </div>
            }
            {teams.map((team, index) => (
              <TeamItem team={team} index={index} key={team.id} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TeamItem({ team, index }) {
  return (
    <Link to={`team/${team.id}`}>
      <tr className='hover flex flex-row' id={team.id}>
        <th>{index + 1}</th>
        <td className='grow'>{team.name}</td>
      </tr>
    </Link>
  )
}

export default LeagueOuter