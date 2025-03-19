import React from 'react'
import Draft from '../pages/main/Draft'
import { DraftProvider } from '../context/DraftContext'

function DraftOuter() {
  return (
    <DraftProvider>
      <Draft />
    </DraftProvider>
  )
}

export default DraftOuter