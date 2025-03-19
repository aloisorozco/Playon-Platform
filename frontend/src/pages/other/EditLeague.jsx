import React, { useEffect, useState, useContext } from 'react'

import { useNavigate, useParams } from 'react-router-dom'

import 'firebase/compat/firestore'

import AuthContext from '../../context/AuthContext'

function EditLeague() {
  const {firestore} = useContext(AuthContext)

  const [leagueNameLoading, setLeagueNameLoading] = useState(true)
  const [leagueName, setLeagueName] = useState()
  const [error, setError] = useState()

  const navigate = useNavigate()

  const {id} = useParams()

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError(null)
      }, 5000)
    }
  }, error)

  const getLeague = async () => {
    firestore.collection('leagues').doc(id).get().then((snapshot) => {
      if (snapshot.data()) {
        setLeagueName(snapshot.data().name)
        setLeagueNameLoading(false)
      }
    }).catch((e) => {

    })
  }

  useEffect(() => {
    getLeague()
  }, [])

  const updateLeague = async () => {
    
    firestore.collection('leagues').doc(id).update({
      name: leagueName
    }).then((ref) => {
      navigate(`/league/${id}`)
    }).catch((e) => {
      setError('Error while updating name')
    })

  }

  const handleLeagueNameChange = (e) => {
    setLeagueName(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    updateLeague()
  }

  return (
    <div className='grid place-items-center'>
      <div className="card w-60 bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title mb-2">Edit league</h2>
        
          <form onSubmit={handleSubmit}>
            <div className="form-control space-y-4">
              {(!leagueNameLoading) && 
                <>
                  <input type='text' placeholder={leagueName} className="input w-full text-center max-w-xs" id='leagueName' key='leagueName' onChange={handleLeagueNameChange}/>
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

export default EditLeague