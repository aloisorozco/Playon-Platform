import React, { createContext, useState, useEffect, useContext, useRef } from "react"

import { useParams } from 'react-router-dom'

import { useAuthState } from 'react-firebase-hooks/auth'

import isEmpty from 'lodash/isEmpty';

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
  const [timer, setTimer] = useState(null)
  const [clientInfo, setClientInfo] = useState(null)

  const { id } = useParams()

  const getLeague = async () => {
    firestore.collection('leagues').doc(id).onSnapshot((snapshot) => {
      if (snapshot.data()) {
        setLeague(snapshot.data())
      }
    })
  }

  const getTeams = () => {
    firestore.collection(`leagues/${id}/teams`).get().then((teams) => {
      let temp = []
      teams.forEach((item) => {
        temp.push({ id: item.id, ...item.data() })
      })
      setTeams(temp)
    })
  }

  const getDraftInfo = () => {
    ws.current = new WebSocket(`ws://localhost:8080/draft/${id}/${user.uid}`);
    ws.current.onopen = () => console.log("onopen");
    ws.current.onclose = () => console.log("onclose");
    ws.current.onmessage = e => {
      const message = JSON.parse(e.data);
      console.log("onmessage: ", message);
      if (message.remainingTime) {
        //TODO
        setTimer(message.remainingTime)
      } else if (message.clientInfo) {
        setClientInfo({ ...clientInfo, ...message.clientInfo })
      } else {
        setTimer(null)
        setCurTeamToDraft(message.curTeamToDraft)
        setLastDrafted(message.lastDrafted)
      }
    };
  }

  const draftPlayer = (playerId) => {
    ws.current.send(JSON.stringify({
      playerId: playerId
    }));
  }

  const getPlayers = async () => {
    firestore.collection(`leagues/${id}/players`).where('teamId', '==', '').limit(50).orderBy('avgFantasyPoints', 'desc').onSnapshot((snapshot) => {
      let temp = []
      snapshot.forEach((item) => {
        temp.push({ id: item.id, ...item.data() })
      })
      setPlayers(temp)
    })

    firestore.collection(`leagues/${id}/players`).where('teamId', '!=', '').onSnapshot((snapshot) => {
      let temp = []
      snapshot.forEach((item) => {
        temp.push({ id: item.id, ...item.data() })
      })
      setDraftedPlayers(temp)
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
    getPlayers()
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
      setLeague,
      draftPlayer,
      timer,
      clientInfo,
      setClientInfo
    }}
  >
    {children}
  </FirestoreContext.Provider>
})

export default FirestoreContext