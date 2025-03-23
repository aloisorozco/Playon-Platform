import React, { useContext, useState, useEffect, useRef } from 'react'

import 'firebase/compat/firestore'
import 'firebase/compat/auth'
import { useAuthState } from 'react-firebase-hooks/auth'

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Snackbar from '@mui/material/Snackbar';

import AuthContext from '../../context/AuthContext'
import FirestoreContext from '../../context/FirestoreContext'
import { FirestoreProvider } from '../../context/FirestoreContext';
import { Alert } from '@mui/material';

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
  const { teams, draftedPlayers, lastDrafted } = useContext(FirestoreContext)

  const [tab, setTab] = useState('draftOrder')
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [draftedPlayerName, setDraftedPlayerName] = useState(false)

  //const {id} = useParams()

  const findTeam = (teamId) => {
    return teams.find((team) => team.id === teamId)
  }

  useEffect(() => {
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
          {`${draftedPlayerName} was drafted ${findTeam(lastDrafted?.team)?.name}`}
        </Alert>
      </Snackbar>
    </>

  )
}

function Players() {
  const { auth, firestore } = useContext(AuthContext)
  const { players, teams, curTeamToDraft, id } = useContext(FirestoreContext)

  const [user, loading] = useAuthState(auth)

  const [canDraft, setCanDraft] = useState()
  const [playerToDraft, setPlayerToDraft] = useState()

  const getPlayerId = async (draftedPlayer) => {
    firestore.collection('leagues').doc(id).collection('players').where('name', '==', draftedPlayer.name).get().then((snapshot) => {
      if (snapshot.empty) {
        setPlayerToDraft([])
      }
      else {
        let temp = []
        snapshot.forEach((item) => {
          temp.push({ id: item.id, ...item.data() })
        })
        setPlayerToDraft(temp)
      }
    })

  }

  const draftPlayer = async () => {
    const userTeam = teams.find((team) => {
      return team.managerId === user.uid
    })

    firestore.collection('leagues').doc(id).collection('players').doc(playerToDraft[0].id).update({
      teamId: userTeam.id
    }).then((ref) => {
      firestore.collection('leagues').doc(id).get().then((snapshot) => {
        let draftPlace = snapshot.data().draftPlace
        let draftOrder = snapshot.data().draftOrder
        draftOrder.splice(draftPlace, 1, {
          "team": draftOrder[draftPlace].team,
          "player": playerToDraft[0].id
        })

        firestore.collection('leagues').doc(id).update({
          draftPlace: draftPlace + 1,
          draftOrder: draftOrder
        })
      })
    }).catch((e) => {
      console.log(e)
    })
  }

  useEffect(() => {
    if (playerToDraft != null && playerToDraft.length !== 0) {
      draftPlayer()
    }
  }, playerToDraft)

  useEffect(() => {
    //console.log('reloaded players')
    const userTeam = teams.find((team) => {
      return team.managerId === user.uid
    })
    setCanDraft(userTeam.id === curTeamToDraft)
  }, [curTeamToDraft])
  //TODO: maybe we can just change to curTeamToDraft cuz we should be updating when we draft

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
          <PlayerItem player={player} key={player.id} canDraft={canDraft} getPlayerId={getPlayerId} />
        ))}
      </div>
    </div>
  )
}

function PlayerItem({ player, canDraft, getPlayerId }) {

  const { auth, firestore } = useContext(AuthContext)
  const { id, curTeamToDraft, teams } = useContext(FirestoreContext)

  const [user, loading] = useAuthState(auth)

  const [open, setOpen] = React.useState(false);

  const handleDraft = () => {
    getPlayerId({
      'name': player.name
    })
  }

  return (
    <>
      <div id={player.id} key={player.id} >
        <div>
          <form>
            <div className='flex flex-row space-x-4 justify-center'>
              <div className='hover:scale-105' onClick={() => setOpen(true)}>
                <input type='text' id='team' key='team' value={player.team} className='w-[8ch] focus:outline-none bold' readOnly />
                <input type='text' id='position' key='position' value={player.position} className='w-[5ch] focus:outline-none' readOnly />
                <input type='text' id='name' key='name' value={player.name} className={`w-[30ch] focus:outline-none cursor-pointer`} readOnly />
                <input type='text' id='avgFantasyPoints' key='avgFantasyPoints' value={player.avgFantasyPoints.toFixed(1)} className={`w-[5ch] focus:outline-none`} readOnly />
              </div>
              {(/*todo*/ canDraft) ?
                <div className='pr-4'>
                  <button type="button" className='btn btn-sm' onClick={handleDraft}>Draft</button>
                </div>
                :
                <div className='pr-4'>
                  <button type="button" className='btn btn-sm btn-disabled'>Draft</button>
                </div>
              }
            </div>
          </form>
        </div>
      </div>
      <PlayerPopup player={player} canDraft={canDraft} handleDraft={handleDraft} setOpen={setOpen} open={open} />
    </>

  )
}

function PlayerPopup({ player, canDraft, handleDraft, setOpen, open }) {

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {`${player.name}'s Regular Season Averages`}
      </DialogTitle>
      <DialogContent>
        <TableContainer>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="right">Points</TableCell>
                <TableCell align="right">Assists</TableCell>
                <TableCell align="right">Rebounds</TableCell>
                <TableCell align="right">Steals</TableCell>
                <TableCell align="right">Blocks</TableCell>
                <TableCell align="right">Turnovers</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow
                key={player.name}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell align="right">{player.avg_points}</TableCell>
                <TableCell align="right">{player.avg_assists}</TableCell>
                <TableCell align="right">{player.avg_rebounds}</TableCell>
                <TableCell align="right">{player.avg_steals}</TableCell>
                <TableCell align="right">{player.avg_blocks}</TableCell>
                <TableCell align="right">{player.avg_turnovers}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <button className='btn btn-sm' onClick={() => setOpen(false)}>Close</button>
        <button className='btn btn-sm' onClick={() => {
          setOpen(false)
          if (!canDraft) {
            return;
          }
          handleDraft()
        }} autoFocus disabled={!canDraft}>
          Draft
        </button>
      </DialogActions>
    </Dialog >
  );
}

function DraftOrder() {

  const { firestore } = useContext(AuthContext)
  const { id, teams, draftOrder, draftedPlayers } = useContext(FirestoreContext)

  const findTeam = (teamId) => {
    return teams.find((team) => {
      return team.id === teamId;
    })
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
            name: findTeam(draftOrderValue.team).name,
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
            <input type='text' id='name' key='name' value={draftOrderItem.player ? `${draftOrderItem.name} (${draftOrderItem.player})` : draftOrderItem.name} className={`w-[30ch] focus:outline-none`} readOnly />
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
  }, players)

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
                <input type='text' id='avgFantasyPoints' key='avgFantasyPoints' value="Average Fantasy Points" className={`w-[25ch] focus:outline-none`} readOnly />
              </div>
            </form>
          </div>
        </div>
        {teamPlayers?.map((player) => (
          <TeamPlayerItem player={player} key={player.id} />
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