'use client'

import * as React from 'react'

import { SDFSignMode } from '@/sdf/sdf-constants'
import RadioSelector from './radio-selector'

export interface SDFSignModeSelectorProps {
  onChange: (newSignMode: SDFSignMode) => void
}

export default function SDFSignModeSelector({ onChange }: SDFSignModeSelectorProps) {
  const [signMode, setSignMode] = React.useState<SDFSignMode>(
    SDFSignMode.UNSIGNED
  )

  const options = {
    [SDFSignMode.UNSIGNED]: 'Unsigned',
    [SDFSignMode.SIGNED]: <><s>Signed</s> (NOT IMPLEMENTED)</>,
  }

  const isDisabled = (option: string) => option === SDFSignMode.SIGNED

  React.useEffect(() => {
    onChange(signMode)
  }, [
    signMode
  ])

  return (
    <>
      <fieldset>
        <h3>Signed/unsigned</h3>
        <RadioSelector
          name='sign-mode'
          options={options}
          initialOption={SDFSignMode.UNSIGNED}
          onChange={(option: string) => {
            setSignMode(option as SDFSignMode)
          }}
          isDisabled={isDisabled}
          compact
        />
      </fieldset>
    </>
  )
}