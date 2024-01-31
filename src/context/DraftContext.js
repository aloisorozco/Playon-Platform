import React, { createContext, useState, useEffect, useContext } from "react"

import { useParams } from 'react-router-dom'

import AuthContext from './AuthContext'

const DraftContext = createContext()

export const DraftProvider = (({children}) => {
  
  const {firestore} = useContext(AuthContext)
  const [curTeamToDraft, setCurTeamToDraft] = useState()
  const [teams, setTeams] = useState([])
  const [players, setPlayers] = useState([])
  const [draftOrder, setDraftOrder] = useState([])

  const {id} = useParams()

  const getTeams = () => {
    firestore.collection(`leagues/${id}/teams`).onSnapshot((snapshot) => {

      let temp = []
      snapshot.forEach((item) => {
        temp.push({id: item.id, ...item.data()})
      })
      setTeams(temp)
    })
  }

  const getCurTeamToDraft = () => {
    firestore.collection('leagues').doc(id).onSnapshot((snapshot) => {
      setCurTeamToDraft(snapshot.data().curTeamToDraft)
    })
  }

  const getPlayers = async () => {

    firestore.collection(`leagues/${id}/players`).where('teamId', '==', '').orderBy('avgFantasyPoints').onSnapshot((snapshot) => {

      let temp = []
      snapshot.forEach((item) => {
        temp.push({id: item.id, ...item.data()})
      })
      temp.reverse()
      setPlayers(temp)
    })
  }

  const getDraftOrder = async() => {
    firestore.collection('leagues').doc(id).get().then((snapshot) => {
      setDraftOrder(snapshot.data().draftOrder)
    }) 
  }

  useEffect(() => {
    getCurTeamToDraft()
    getTeams()
    getPlayers()
    getDraftOrder()
  }, [])

  return <DraftContext.Provider 
    value={{
      curTeamToDraft,
      setCurTeamToDraft,
      getCurTeamToDraft,
      id,
      teams,
      setTeams,
      players,
      setPlayers,
      draftOrder,
      setDraftOrder,
    }}
  >
    {children}
  </DraftContext.Provider>
})

export default DraftContext