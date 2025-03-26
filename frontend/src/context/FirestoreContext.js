import React, { createContext, useState, useEffect, useContext, useRef } from "react"

import { useParams } from 'react-router-dom'

import { useAuthState } from 'react-firebase-hooks/auth'

import AuthContext from './AuthContext'

const FirestoreContext = createContext()

export const FirestoreProvider = (({ children }) => {
  const ws = useRef(null);
  const { auth, firestore } = useContext(AuthContext)
  const [user, loading] = useAuthState(auth)
  const [curTeamToDraft, setCurTeamToDraft] = useState()
  const [lastDrafted, setLastDrafted] = useState()
  const [league, setLeague] = useState({})
  const [teams, setTeams] = useState([])
  const [players, setPlayers] = useState([])
  const [draftedPlayers, setDraftedPlayers] = useState([])
  const [draftOrder, setDraftOrder] = useState([])

  const { id } = useParams()

  const getLeague = async () => {
    firestore.collection('leagues').doc(id).onSnapshot((snapshot) => {
      if (snapshot.data()) {
        setLeague(snapshot.data())
      }
    })
  }

  const getTeams = () => {
    firestore.collection(`leagues/${id}/teams`).get().then((snapshot) => {
      let temp = []
      snapshot.forEach((item) => {
        temp.push({ id: item.id, ...item.data() })
      })
      setTeams(temp)
    })
  }

  const getDraftInfo = () => {
    ws.current = new WebSocket(`ws://localhost:8000/draft/${id}/${user.uid}`);
    ws.current.onopen = () => console.log("onopen");
    ws.current.onclose = () => console.log("onclose");
    ws.current.onmessage = e => {
      const message = JSON.parse(e.data);
      console.log("onmessage: ", message);
      setCurTeamToDraft(message.curTeamToDraft)
      setLastDrafted(message.lastDrafted)
    };
  }

  const getDraftedPlayers = async () => {
    firestore.collection(`leagues/${id}/players`).orderBy('avgFantasyPoints').onSnapshot((snapshot) => {
      let temp = []
      let temp2 = []
      snapshot.forEach((item) => {
        if (item.data().teamId === '') {
          temp2.push({ id: item.id, ...item.data() })
        }
        temp.push({ id: item.id, ...item.data() })
      })
      temp.reverse()
      temp2.reverse()
      setDraftedPlayers(temp)
      setPlayers(temp2)
    })
  }

  const getDraftOrder = async () => {
    firestore.collection('leagues').doc(id).onSnapshot((snapshot) => {
      setDraftOrder(snapshot.data().draftOrder)
    })
  }

  useEffect(() => {
    getLeague()
    getTeams()
    getDraftOrder()
    getDraftedPlayers()
    getDraftInfo();
    return () => {
      ws.current.close();
    };
  }, [])

  return <FirestoreContext.Provider
    value={{
      curTeamToDraft,
      setCurTeamToDraft,
      id,
      teams,
      setTeams,
      players,
      setPlayers,
      draftOrder,
      setDraftOrder,
      draftedPlayers,
      setDraftedPlayers,
      lastDrafted,
      setLastDrafted,
      league,
      setLeague
    }}
  >
    {children}
  </FirestoreContext.Provider>
})

export default FirestoreContext