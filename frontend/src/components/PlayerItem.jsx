import React, { useContext, useState, useEffect, useRef } from 'react'

import 'firebase/compat/firestore'
import 'firebase/compat/auth'
import { useAuthState } from 'react-firebase-hooks/auth'

import AuthContext from '../context/AuthContext'

import { debounce } from "lodash"

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

import FirestoreContext from '../context/FirestoreContext'

export const playerItemType = {
    undrafted: 0,
    drafted: 1,
    team: 2
}

export default function PlayerItem({ player, playerType, canDraft = false, startDraftPlayer = null, setPlayerName = null }) {

    const { auth, firestore } = useContext(AuthContext)
    const { id, curTeamToDraft, teams } = useContext(FirestoreContext)

    const [user, loading] = useAuthState(auth)

    const [open, setOpen] = React.useState(false);

    const handleDraft = React.useCallback(
        debounce(() => {
            setPlayerName(player.name)
        }, 400)
        , [])

    return (
        <>
            {playerType === playerItemType.undrafted ?
                <div id={player.id} key={player.id} >
                    <div>
                        <form>
                            <div className='flex flex-row space-x-4 justify-center'>
                                <div className='hover:scale-105' onClick={() => setOpen(true)}>
                                    {
                                        window.innerWidth > 768 &&
                                        <>
                                            <input type='text' id='team' key='team' value={player.team} className='w-[8ch] focus:outline-none bold' readOnly />
                                            <input type='text' id='position' key='position' value={player.position} className='w-[5ch] focus:outline-none' readOnly />
                                        </>
                                    }
                                    <input type='text' id='name' key='name' value={player.name} className={`w-[50vw] lg:w-[30ch] focus:outline-none cursor-pointer`} readOnly />
                                    <input type='text' id='avgFantasyPoints' key='avgFantasyPoints' value={player.avgFantasyPoints.toFixed(1)} className={`w-[10vw] lg:w-[5ch] focus:outline-none`} readOnly />
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
                :
                playerType === playerItemType.drafted ?
                    <div id={player.id} key={player.id} >
                        <div>
                            <form>
                                <div className='flex flex-row space-x-4 justify-center'>
                                    <div className='hover:scale-105' onClick={() => setOpen(true)}>
                                        {
                                            window.innerWidth > 768 &&
                                            <>
                                                <input type='text' id='team' key='team' value={player.team} className='w-[8ch] focus:outline-none bold' readOnly />
                                                <input type='text' id='position' key='position' value={player.position} className='w-[5ch] focus:outline-none' readOnly />
                                            </>
                                        }
                                        <input type='text' id='name' key='name' value={player.name} className={`w-[50vw] lg:w-[30ch] focus:outline-none cursor-pointer`} readOnly />
                                        <input type='text' id='avgFantasyPoints' key='avgFantasyPoints' value={player.avgFantasyPoints.toFixed(1)} className={`w-[10vw] lg:w-[15ch] focus:outline-none`} readOnly />
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                    :
                    playerType === playerItemType.team ?
                        <div id={player.id} key={player.id} >
                            <div>
                                <form>
                                    <div className='flex flex-row space-x-4 justify-center'>
                                        <div className='hover:scale-105' onClick={() => setOpen(true)}>
                                            {
                                                window.innerWidth > 768 &&
                                                <>
                                                    <input type='text' id='team' key='team' value={player.team} className='w-[8ch] focus:outline-none bold' readOnly />
                                                    <input type='text' id='position' key='position' value={player.position} className='w-[5ch] focus:outline-none' readOnly />
                                                </>
                                            }
                                            <input type='text' id='name' key='name' value={player.name} className={`w-[50vw] lg:w-[30ch] focus:outline-none cursor-pointer`} readOnly />
                                            <input type='text' id='pointsAccumulated' key='pointsAccumulated' value={player?.pointsAccumulated?.toFixed(1) || 0.0.toFixed(1)} className={`w-[10vw] lg:w-[5ch] focus:outline-none`} readOnly />
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                        :
                        null
            }
            <PlayerPopup player={player} open={open} setOpen={setOpen} playerType={playerType} canDraft={canDraft} handleDraft={handleDraft} />
        </>
    )
}

function PlayerPopup({ player, open, setOpen, playerType, canDraft = false, handleDraft = null }) {
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
                    <Table>
                        <TableHead>
                            <TableRow>
                                {
                                    window.innerWidth > 768 ?
                                        <>
                                            <TableCell align="right">Points</TableCell>
                                            <TableCell align="right">Assists</TableCell>
                                            <TableCell align="right">Rebounds</TableCell>
                                            <TableCell align="right">Steals</TableCell>
                                            <TableCell align="right">Blocks</TableCell>
                                            <TableCell align="right">Turnovers</TableCell>
                                        </>
                                        :
                                        <>
                                            <TableCell align="right">Pts</TableCell>
                                            <TableCell align="right">Ast</TableCell>
                                            <TableCell align="right">Trb</TableCell>
                                            <TableCell align="right">Stl</TableCell>
                                            <TableCell align="right">Blk</TableCell>
                                            <TableCell align="right">Tov</TableCell>
                                        </>
                                }

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
                {
                    playerType === playerItemType.undrafted &&
                    <button className='btn btn-sm' onClick={() => {
                        setOpen(false)
                        if (!canDraft) {
                            return;
                        }
                        handleDraft()
                    }} autoFocus disabled={!canDraft}>
                        Draft
                    </button>
                }

            </DialogActions>
        </Dialog >
    );
}