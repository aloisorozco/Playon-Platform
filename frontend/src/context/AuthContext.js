import React, { createContext, useState } from "react"

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { credentials } from "./credentials";

const AuthContext = createContext()

export const AuthProvider = (({ children }) => {

  firebase.initializeApp(credentials)

  const auth = firebase.auth();
  const firestore = firebase.firestore();

  return <AuthContext.Provider
    value={{
      auth,
      firebase,
      firestore,
    }}
  >
    {children}
  </AuthContext.Provider>
})

export default AuthContext