import React, { createContext, useState } from "react"

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

const AuthContext = createContext()

export const AuthProvider = (({children}) => {

  firebase.initializeApp({
    apiKey: "AIzaSyABtPtClFZDW6jBwU7dHTkhxK0xR1SiX30",
    authDomain: "playon-fantasy.firebaseapp.com",
    projectId: "playon-fantasy",
    storageBucket: "playon-fantasy.appspot.com",
    messagingSenderId: "217713684679",
    appId: "1:217713684679:web:0ac2862b6b7bb564a34ee2",
    measurementId: "G-HD4XQKXM6Y"
  })
  
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