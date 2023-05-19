'use client'

import * as React from 'react'

import { SDFPrecisionMode } from '@/sdf/sdf-constants'
import RadioSelector from './radio-selector'

export interface SDFPrecisionModeSelectorProps {
  initialPrecisionMode: SDFPrecisionMode
  onChange: (newPrecisionMode: SDFPrecisionMode) => void
}

export default function SDFPrecisionModeSelector({
  initialPrecisionMode,
  onChange
}: SDFPrecisionModeSelectorProps) {
  const [precisionMode, setPrecisionMode] = React.useState<SDFPrecisionMode>(
    initialPrecisionMode
  )

  const options = {
    [SDFPrecisionMode.APPROXIMATE]: 'Approximate',
    [SDFPrecisionMode.EXACT]: 'Exact',
  }

  React.useEffect(() => {
    onChange(precisionMode)
  }, [
    precisionMode
  ])

  return (
    <>
      <fieldset>
        <h3>Precision</h3>
        <RadioSelector
          name='precision-mode'
          options={options}
          initialOption={precisionMode}
          onChange={(newOption: string) => {
            setPrecisionMode(newOption as SDFPrecisionMode)
          }}
          compact
        />
      </fieldset>
    </>
  )
}