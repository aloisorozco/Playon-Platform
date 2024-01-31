import React, { useContext, useState, useEffect, useRef, createContext } from 'react'

import 'firebase/compat/firestore'
import 'firebase/compat/auth'
import { useAuthState } from 'react-firebase-hooks/auth'

import AuthContext from '../../context/AuthContext'
import { useParams } from 'react-router-dom'
import DraftContext from '../../context/DraftContext'

const activeTab = 'tab tab-lg tab-lifted tab-active'
const disabledTab = 'tab tab-lg tab-lifted'
const siblings = n => [...n.parentElement.children].filter(c=>c!=n)

function Draft() {

  const {firestore} = useContext(AuthContext)
  const {players} = useContext(DraftContext)

  const [tab, setTab] = useState('draftOrder')
  
  
  const {id} = useParams()

  const onTabClick = (e) => {
    e.target.classList = activeTab
    siblings(e.target).forEach((s) => {
      s.classList = disabledTab
    })
    setTab(e.currentTarget.id)
    
  }

  return (
    <div className='grid place-items-center'>
      <div className='card w-[60vh] bg-base 100 shadow-xl'>
        {/* {<div className='card-title p-2 justify-center'>
          Draft
        </div>} */}
        <div className='card-body p-2 justify-center'>    
          
          <div className='text-left pl-4'>
            {(tab === 'players') && <Players players={players} />}
            {(tab === 'draftOrder') && <DraftOrder />}
            {(tab === 'teams') && <Teams />}
          </div>
          
          <div className="tabs justify-center">
            <a className={disabledTab} id='players' onClick={onTabClick}>Players</a> 
            <a className={activeTab} id='draftOrder' onClick={onTabClick}>Draft</a> 
            <a className={disabledTab} id='teams' onClick={onTabClick}>Teams</a>
          </div>
        </div>
      </div>
    </div>
  )
}

function Players({players}) {

  return (
    <div>
      <div className='card-title p-2 justify-center text-2xl mb-4'>Available Players</div>
      <div className='flex flex-col space-y-4 mx-2 overflow-scroll h-80'>
        { players.map( (player) => (
              <PlayerItem player={player} key={player.id} />
            )) }
      </div>
    </div>
  )
}

function PlayerItem({player}) {

  const {auth, firestore} = useContext(AuthContext)
  const {id, curTeamToDraft} = useContext(DraftContext)

  const [user, loading] = useAuthState(auth)

  const draft = async (draftedPlayer) => {

    firestore.collection('leagues').doc(id).collection('teams').where('managerId', '==', user.uid).get().then((snapshot) => {
      let teamId = snapshot.id
      firestore.collection('leagues').doc(id).collection('players').where('name', '==', draftedPlayer.name).update({
        teamId: teamId //check to make sure it works
      }).then((ref) => {
        //TODO (partly on firebase): set curTeamToDraft to next team id
      }).catch((e) => {
        
      })
    })
    
  }

  const handleDraft = (e) => {
    e.preventDefault()

    const draftedPlayer = {
      'name': e.target.name,
    }

    draft(draftedPlayer)
  }

  return (
    <div className='hover' id={player.id} key={player.id}>
      <div>
        <form onSubmit={handleDraft}>
          <div className='flex flex-row space-x-4 justify-center'>
            <input type='text' id='position' key='position' value={player.position} className='w-[2ch] focus:outline-none' readOnly/>
            <input type='text' id='name' key='name' value={player.name} className={`w-[${player.name.length}ch] focus:outline-none`} readOnly/>
            <input type='text' id='avgFantasyPoints' key='avgFantasyPoints' value={player.avgFantasyPoints.toFixed(1)} className={`w-[5ch] focus:outline-none`} readOnly/>
            {(/*todo*/ user.uid == curTeamToDraft) ? 
              <div className='pr-4'>
                <button className='btn btn-sm'>Draft</button>
              </div>
            :
            <div className='pr-4'>
              <button className='btn btn-sm btn-disabled'>Draft</button>
            </div>
            }
          </div>
        </form>
      </div>
    </div>
  )
}

function DraftOrder() {

  const {firestore} = useContext(AuthContext)
  const {id, teams, draftOrder} = useContext(DraftContext)  

  const findTeam = (teams, teamId) => {
    return teams.find((team) => {
      return team.id === teamId;
    })
  }

  return (
    <div>
      <div className='card-title p-2 justify-center text-2xl mb-4'>Draft Order</div>
      <div className='flex flex-col space-y-4 mx-2 overflow-scroll h-80'>
        { draftOrder?.map( (draftOrderTeamId, index) => (
              <DraftOrderItem draftOrderItem={{
                name: findTeam(teams, draftOrderTeamId).name,
                index: ++index, //make sure it works
              }} key={index++} />
            )) }
      </div>
    </div>
  )
}

function DraftOrderItem({draftOrderItem}) {

  const {teams} = useContext(DraftContext)

  const handleNothing = (e) => {
    e.target.preventDefault()
  }

  return (
    <div className='hover' id={draftOrderItem.index} key={draftOrderItem.index}>
      <div>
        <form onSubmit={handleNothing}>
          {((draftOrderItem.index - 1) % teams.length) == 0 &&
            <div className='justify-center text-center text-xs py-4'>Round {((draftOrderItem.index - 1) / (teams.length)) + 1}</div>
          }
          <div className='flex flex-row space-x-4 justify-center'>
            <input type='text' id='position' key='position' value={draftOrderItem.index} className='w-[2ch] focus:outline-none' readOnly/>
            <input type='text' id='name' key='name' value={draftOrderItem.name} className={`w-[30ch] focus:outline-none`} readOnly/>
          </div>
        </form>
      </div>
    </div>
  )
}

function Teams() {

  const {id, teams, players} = useContext(DraftContext)
  const {firestore} = useContext(AuthContext)

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
          temp.push({id: item.id, ...item.data()})
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
            { teams.map( (team, index) => (
              <option value={index} key={index}>{team.name}</option>
            )) }
          </select>
        </div>
      </div>
      <div className='flex flex-col space-y-4 mx-2 overflow-scroll h-80'>
        { teamPlayers?.map( (player) => (
              <TeamPlayerItem player={player} key={player.id} />
            )) }
      </div>
    </div>
  )
}

function TeamPlayerItem({player}) {

  const handleNothing = (e) => {
    e.preventDefault()
  }

  return (
    <div className='hover' id={player.id} key={player.id}>
      <div>
        <form onSubmit={handleNothing}>
          <div className='flex flex-row space-x-4 justify-center'>
            <input type='text' id='position' key='position' value={player.position} className='w-[2ch] focus:outline-none' readOnly/>
            <input type='text' id='name' key='name' value={player.name} className={`w-[${player.name.length}ch] focus:outline-none`} readOnly/>
            <input type='text' id='avgFantasyPoints' key='avgFantasyPoints' value={player.avgFantasyPoints.toFixed(1)} className={`w-[5ch] focus:outline-none`} readOnly/>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Draft