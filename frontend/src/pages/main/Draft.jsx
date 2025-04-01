import React, { useContext, useState, useEffect, useRef } from 'react'

import 'firebase/compat/firestore'
import 'firebase/compat/auth'
import { useAuthState } from 'react-firebase-hooks/auth'

import Snackbar from '@mui/material/Snackbar';
import { Alert } from '@mui/material';

import AuthContext from '../../context/AuthContext'
import FirestoreContext, { FirestoreProvider } from '../../context/FirestoreContext'
import PlayerItem, { playerItemType } from '../../components/PlayerItem';

const activeTab = 'tab tab-lg tab-lifted tab-active'
const disabledTab = 'tab tab-lg tab-lifted'
const siblings = n => [...n.parentElement.children].filter(c => c !== n)

function DraftOuter() {
  return (
    <FirestoreProvider>
      <Draft />
    </FirestoreProvider>
  )
}

function Draft() {

  const { firestore } = useContext(AuthContext)
  const { teams, draftedPlayers, lastDrafted, curTeamToDraft, timer, clientInfo, setClientInfo } = useContext(FirestoreContext)

  const [tab, setTab] = useState('draftOrder')
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [draftedPlayerName, setDraftedPlayerName] = useState(false)
  const [curTeamToDraftName, setCurTeamToDraftName] = useState(null)

  //const {id} = useParams()

  const findTeam = (teamId) => {
    return teams?.find((team) => team.id === teamId)
  }

  useEffect(() => {
    console.log(lastDrafted) // LEAVE THIS CONSOLE LOG SNACKBAR DOESNT POP UP SOMETIMES IF NOT HERE
    if (lastDrafted == null) {
      return;
    }

    const temp = draftedPlayers.find((draftedPlayer) => {
      return draftedPlayer.id === lastDrafted.player;
    })?.name

    if (temp == null) {
      return;
    }
    setDraftedPlayerName(temp)
    setOpenSnackbar(true)
  }, [lastDrafted])

  useEffect(() => {
    if (curTeamToDraft == null) {
      return;
    }

    setCurTeamToDraftName(findTeam(curTeamToDraft)?.name || null)
  }, [curTeamToDraft])

  const onTabClick = (e) => {
    e.target.classList = activeTab
    siblings(e.target).forEach((s) => {
      s.classList = disabledTab
    })
    setTab(e.currentTarget.id)
  }

  return (
    <>
      <div className='grid place-items-center'>
        <div className='card w-[60vw] max-w-[800px] bg-base 100 shadow-xl'>
          {/* {<div className='card-title p-2 justify-center'>
          Draft
        </div>} */}
          <div className='card-body p-2 justify-center'>

            <div className='text-left pl-4'>
              {(tab === 'players') && <Players />}
              {(tab === 'draftOrder') && <DraftOrder />}
              {(tab === 'teams') && <Teams />}
            </div>
            {
              timer &&
              <div className='m-5' style={{ backgroundColor: "#ddd", height: 20 }}>
                <div
                  style={{
                    width: `${timer / 30 * 100}%`,
                    height: "100%",
                    backgroundColor: "#0070f3",
                  }}
                />
              </div>
            }
            <div className="tabs justify-center">
              <p className={disabledTab} id='players' onClick={onTabClick}>Players</p>
              <p className={activeTab} id='draftOrder' onClick={onTabClick}>Draft</p>
              <p className={disabledTab} id='teams' onClick={onTabClick}>Teams</p>
            </div>

          </div>
        </div>
      </div>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={5000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert severity="success">
          {`${draftedPlayerName} was drafted by ${findTeam(lastDrafted?.team)?.name}`}
        </Alert>
      </Snackbar>
      {
        timer ?
          <Snackbar
            open={true}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >

            <Alert severity="info">
              {`It's your turn to draft! ${timer} seconds remaining`}
            </Alert>
          </Snackbar>
          :
          curTeamToDraftName &&
          <Snackbar
            open={true}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >

            <Alert severity="info">
              {`Currently drafting: ${findTeam(curTeamToDraft)?.name}`}
            </Alert>
          </Snackbar>
      }
      {
        <Snackbar
          open={Boolean(clientInfo?.disconnected)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          autoHideDuration={5000}
          onClose={() => setClientInfo({ ...clientInfo, disconnected: null })}
        >
          <Alert severity="warning">
            {`${findTeam(clientInfo?.disconnected, teams)?.name} left the draft room.`}
          </Alert>
        </Snackbar>
      }
    </>

  )
}

function Players() {
  const { auth, firestore } = useContext(AuthContext)
  const { players, teams, curTeamToDraft, id, draftPlayer, timer } = useContext(FirestoreContext)

  const [user, loading] = useAuthState(auth)

  const [canDraft, setCanDraft] = useState()
  const [playerId, setPlayerId] = useState()

  useEffect(() => {
    if (playerId != null) {
      draftPlayer(playerId)
    }
  }, [playerId])

  useEffect(() => {
    setCanDraft(timer)
  }, [timer])

  return (
    <div>
      <div className='card-title p-2 justify-center text-2xl mb-4'>Available Players</div>
      <div className='flex flex-col space-y-4 mx-2 overflow-y-scroll h-[60vh]'>
        <div className='hover'>
          <div>
            <form>
              <div className='flex flex-row space-x-4 justify-center'>
                <input type='text' id='team' key='team' value="Team" className='w-[6ch] focus:outline-none' readOnly />
                <input type='text' id='position' key='position' value="Position" className='w-[10ch] focus:outline-none' readOnly />
                <input type='text' id='name' key='name' value='Name' className={`w-[20ch] focus:outline-none`} readOnly />
                <input type='text' id='avgFantasyPoints' key='avgFantasyPoints' value="Average Fantasy Points" className={`w-[25ch] focus:outline-none`} readOnly />
              </div>
            </form>
          </div>
        </div>
        {players.map((player) => (
          <PlayerItem player={player} key={player.id} canDraft={canDraft} setPlayerId={setPlayerId} playerType={playerItemType.undrafted} />
        ))}
      </div>
    </div>
  )
}

function DraftOrder() {

  const { firestore } = useContext(AuthContext)
  const { id, teams, draftOrder, draftedPlayers } = useContext(FirestoreContext)

  const findTeam = (teamId) => {
    return teams?.find((team) => team.id === teamId)
  }

  const findDraftedPlayer = (draftedPlayerId) => {
    return draftedPlayers.find((draftedPlayer) => {
      return draftedPlayer.id === draftedPlayerId;
    })
  }

  return (
    <div>
      <div className='card-title p-2 justify-center text-2xl mb-4'>Draft Order</div>
      <div className='flex flex-col space-y-4 mx-2 overflow-y-scroll h-[60vh]'>
        {draftOrder?.map((draftOrderValue, index) => (
          <DraftOrderItem draftOrderItem={{
            name: findTeam(draftOrderValue.team, teams)?.name,
            player: findDraftedPlayer(draftOrderValue.player)?.name,
            index: ++index, //make sure it works
          }} key={index++} />
        ))}
      </div>
    </div>
  )
}

function DraftOrderItem({ draftOrderItem }) {
  const { teams } = useContext(FirestoreContext)

  const handleNothing = (e) => {
    e.target.preventDefault()
  }

  return (
    <div className='hover' id={draftOrderItem.index} key={draftOrderItem.index}>
      <div>
        <form onSubmit={handleNothing}>
          {((draftOrderItem.index - 1) % teams.length) === 0 &&
            <div className='justify-center text-center text-xs py-4'>Round {((draftOrderItem.index - 1) / (teams.length)) + 1}</div>
          }
          <div className='flex flex-row space-x-4 justify-center'>
            <input type='text' id='position' key='position' value={draftOrderItem.index} className='w-[2ch] focus:outline-none' readOnly />
            <input type='text' id='name' key='name' value={draftOrderItem.player ? `${draftOrderItem.name} (${draftOrderItem.player})` : draftOrderItem.name} className={draftOrderItem.player ? `w-[50ch] focus:outline-none` : `w-[30ch] focus:outline-none`} readOnly />
          </div>
        </form>
      </div>
    </div>
  )
}

function Teams() {

  const { id, teams, players } = useContext(FirestoreContext)
  const { firestore } = useContext(AuthContext)

  const selectRef = useRef(null)

  const [teamPlayers, setTeamPlayers] = useState([])

  const handleChange = (e) => {
    getTeamPlayers(e.target.value)
  }

  const getTeamPlayers = async (index) => {
    firestore.collection('leagues').doc(id).collection('players').where('teamId', '==', teams[index].id).get().then((snapshot) => {
      if (snapshot.empty) {
        setTeamPlayers([])
      }
      else {
        let temp = []
        snapshot.forEach((item) => {
          temp.push({ id: item.id, ...item.data() })
        })
        setTeamPlayers(temp)
      }
    })
  }

  useEffect(() => {
    getTeamPlayers(selectRef.current.value)
  }, [players])

  useEffect(() => {
    getTeamPlayers(0)
  }, [])

  return (
    <div>
      <div className='card-title p-2 justify-center text-2xl mb-4'>
        <div className="form-control w-full max-w-xs">
          <select className="select select-bordered text-xl text-center" defaultValue={0} onChange={handleChange} ref={selectRef}>
            {teams.map((team, index) => (
              <option value={index} key={index}>{team.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className='flex flex-col space-y-4 mx-2 overflow-y-scroll h-[60vh]'>
        <div className='hover'>
          <div>
            <form>
              <div className='flex flex-row space-x-4 justify-center'>
                <input type='text' id='team' key='team' value="Team" className='w-[6ch] focus:outline-none' readOnly />
                <input type='text' id='position' key='position' value="Position" className='w-[10ch] focus:outline-none' readOnly />
                <input type='text' id='name' key='name' value='Name' className={`w-[20ch] focus:outline-none`} readOnly />
                <input type='text' id='avgFantasyPoints' key='avgFantasyPoints' value="Average Fantasy Points" className={`w-[20ch] focus:outline-none`} readOnly />
              </div>
            </form>
          </div>
        </div>
        {teamPlayers?.map((player) => (
          <PlayerItem player={player} key={player.id} playerType={playerItemType.drafted} />
        ))}
      </div>
    </div>
  )
}

function TeamPlayerItem({ player }) {

  const handleNothing = (e) => {
    e.preventDefault()
  }

  return (
    <div className='hover' id={player.id} key={player.id}>
      <div>
        <form onSubmit={handleNothing}>
          <div className='flex flex-row space-x-4 justify-center'>
            <input type='text' id='team' key='team' value={player.team} className='w-[8ch] focus:outline-none bold' readOnly />
            <input type='text' id='position' key='position' value={player.position} className='w-[5ch] focus:outline-none' readOnly />
            <input type='text' id='name' key='name' value={player.name} className={`w-[30ch] focus:outline-none`} readOnly />
            <input type='text' id='avgFantasyPoints' key='avgFantasyPoints' value={player.avgFantasyPoints.toFixed(1)} className={`w-[15ch] focus:outline-none`} readOnly />
          </div>
        </form>
      </div>
    </div>
  )
}

export default DraftOuter