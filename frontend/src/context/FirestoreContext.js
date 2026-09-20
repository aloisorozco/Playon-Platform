import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import 'firebase/compat/firestore'
import firebase from 'firebase/compat/app'
import AuthContext from './AuthContext'
import { bestAvailablePlayer, canCommitPick } from './draftUtils'

const FirestoreContext = createContext()

function teamIdForUser(teams, uid) {
  return teams.find((team) => team.managerId === uid || team.userId === uid)?.id || null
}

function normalizedDraftOrder(league, teams) {
  const configured = Array.isArray(league?.draftOrder) ? league.draftOrder : []
  const order = configured.map((entry) => typeof entry === 'string' ? entry : entry.teamId || entry.team).filter(Boolean)
  return order.length ? order : teams.map((team) => team.id)
}

export const FirestoreProvider = ({ children }) => {
  const { auth, firestore } = useContext(AuthContext)
  const [user] = useAuthState(auth)
  const { id } = useParams()
  const [league, setLeague] = useState({})
  const [teams, setTeams] = useState([])
  const [players, setPlayers] = useState([])
  const [draftState, setDraftState] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return undefined
    const unsubs = [
      firestore.collection('leagues').doc(id).onSnapshot((snapshot) => setLeague(snapshot.data() || {})),
      firestore.collection(`leagues/${id}/teams`).onSnapshot((snapshot) => setTeams(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))),
      firestore.collection(`leagues/${id}/players`).onSnapshot((snapshot) => setPlayers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))),
      firestore.collection('leagues').doc(id).collection('draft').doc('state').onSnapshot((snapshot) => setDraftState(snapshot.exists ? { id: snapshot.id, ...snapshot.data() } : null)),
    ]
    return () => unsubs.forEach((unsubscribe) => unsubscribe())
  }, [firestore, id])

  const availablePlayers = useMemo(() => players.filter((player) => !player.teamId), [players])
  const draftedPlayers = useMemo(() => players.filter((player) => player.teamId), [players])
  const draftOrder = draftState?.draftOrder || normalizedDraftOrder(league, teams)
  const currentTeamId = draftOrder[draftState?.currentPickIndex || 0]
  const myTeamId = teamIdForUser(teams, user?.uid)
  const isMyTurn = Boolean(myTeamId && currentTeamId === myTeamId && draftState?.status !== 'complete')

  useEffect(() => {
    if (!id || !user || draftState || !teams.length) return
    const stateRef = firestore.collection('leagues').doc(id).collection('draft').doc('state')
    stateRef.set({ currentPickIndex: 0, draftOrder: normalizedDraftOrder(league, teams), pickDeadline: firebase.firestore.FieldValue.serverTimestamp(), picks: [], status: 'active' }, { merge: true }).catch((writeError) => setError(writeError.message))
  }, [draftState, firestore, id, league, teams, user])

  const advancePick = async ({ playerId = null, auto = false } = {}) => {
    if (!user || !draftState || draftState.status === 'complete') return false
    const stateRef = firestore.collection('leagues').doc(id).collection('draft').doc('state')
    const playerRef = playerId ? firestore.collection(`leagues/${id}/players`).doc(playerId) : null
    try {
      await firestore.runTransaction(async (transaction) => {
        const stateSnapshot = await transaction.get(stateRef)
        const current = stateSnapshot.data()
        if (!current || current.currentPickIndex !== draftState.currentPickIndex) throw new Error('This pick has already advanced.')
        const teamId = current.draftOrder[current.currentPickIndex]
        const expired = current.pickDeadline?.toMillis && Date.now() >= current.pickDeadline.toMillis()
        if (!canCommitPick(current, draftState.currentPickIndex, Date.now(), auto)) throw new Error(auto && !expired ? 'The timer has not expired.' : 'This pick has already advanced.')
        if (!auto && (teamId !== myTeamId || expired)) throw new Error(expired ? 'The timer expired.' : 'It is not your turn.')
        let player = null
        if (playerRef) {
          const playerSnapshot = await transaction.get(playerRef)
          player = { id: playerSnapshot.id, ...playerSnapshot.data() }
          if (!playerSnapshot.exists || player.teamId) throw new Error('That player is no longer available.')
        } else {
          player = bestAvailablePlayer(availablePlayers)
          if (!player) throw new Error('No players remain to draft.')
        }
        transaction.update(firestore.collection(`leagues/${id}/players`).doc(player.id), { teamId })
        const nextIndex = current.currentPickIndex + 1
        const historyEntry = { pickIndex: current.currentPickIndex, teamId, playerId: player.id, playerName: player.name, auto, createdAt: new Date() }
        transaction.update(stateRef, { currentPickIndex: nextIndex, pickDeadline: nextIndex >= current.draftOrder.length ? null : firebase.firestore.FieldValue.serverTimestamp(), picks: [...(current.picks || []), historyEntry], status: nextIndex >= current.draftOrder.length ? 'complete' : 'active' })
      })
      return true
    } catch (transactionError) {
      setError(transactionError.message)
      return false
    }
  }

  useEffect(() => {
    if (!draftState?.pickDeadline || draftState.status === 'complete') return undefined
    const deadline = draftState.pickDeadline.toMillis()
    const timer = setInterval(() => {
      if (Date.now() >= deadline) advancePick({ auto: true })
    }, 1000)
    return () => clearInterval(timer)
  }, [draftState])

  return <FirestoreContext.Provider value={{ id, user, league, teams, players, availablePlayers, draftedPlayers, draftState, draftOrder, currentTeamId, myTeamId, isMyTurn, makePick: (playerId) => advancePick({ playerId }), autoPick: () => advancePick({ auto: true }), error, setError }}>{children}</FirestoreContext.Provider>
}

export default FirestoreContext
