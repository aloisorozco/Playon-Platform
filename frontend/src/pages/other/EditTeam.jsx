import React, { useEffect, useState, useContext } from 'react'

import { useNavigate, useParams } from 'react-router-dom'

import 'firebase/compat/firestore'

import AuthContext from '../../context/AuthContext'

function EditTeam() {

  const { firestore } = useContext(AuthContext)

  const [teamNameLoading, setTeamNameLoading] = useState(true)
  const [teamName, setTeamName] = useState()
  const [error, setError] = useState()

  const navigate = useNavigate()

  const { leagueId, teamId } = useParams()

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
        setTeamNameLoading(false)
      }
    }).catch((e) => {

    })
  }

  useEffect(() => {
    getTeam()
  }, [])

  const updateTeam = async () => {

    firestore.collection('leagues').doc(leagueId).collection('teams').doc(teamId).update({
      name: teamName
    }).then((ref) => {
      navigate(`/league/${leagueId}/team/${teamId}`)
    }).catch((e) => {
      setError('Error while updating name')
    })

  }

  const handleTeamNameChange = (e) => {
    setTeamName(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    updateTeam()
  }

  return (
    <div className='grid place-items-center'>
      <div className="card w-60 bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title mb-2">Edit Team</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-control space-y-4">
              {(!teamNameLoading) &&
                <>
                  <input type='text' value={teamName} className="input w-full text-center max-w-xs" id='teamName' key='teamName' onChange={handleTeamNameChange} />
                  <button type='submit' className='btn btn-ghost'>
                    Submit
                  </button>
                </>
              }
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

export default EditTeam