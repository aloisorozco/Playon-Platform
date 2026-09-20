import React, { useContext } from 'react'
import { IconButton, Tooltip } from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import AuthContext from '../context/AuthContext'
import 'firebase/compat/auth'

export default function SignOut() {
  const { auth, firebase } = useContext(AuthContext)
  if (!auth.currentUser) return null
  return <Tooltip title="Sign out"><IconButton onClick={() => firebase.auth().signOut()} aria-label="Sign out"><LogoutIcon /></IconButton></Tooltip>
}
