'use client'

import * as React from 'react'

import { SDFPrecisionMode, SDFSamplingMode } from '@/sdf/sdf-types'
import RadioSelector from './radio-selector'
import { SelectSelector } from './select-selector'

const PRECISION_MODE_OPTIONS = {
  [SDFPrecisionMode.APPROXIMATE]: 'Approximate',
  [SDFPrecisionMode.EXACT]: 'Exact',
}

const SAMPLING_MODE_OPTIONS: Record<SDFSamplingMode, string> = {
  [SDFSamplingMode.BESTEST]: '2x (bestest)',
  [SDFSamplingMode.BEST]: '1x (best)',
  [SDFSamplingMode.BALANCED]: '0.5x (balanced)',
  [SDFSamplingMode.FAST]: '1/4 (fast)',
  [SDFSamplingMode.FASTER]: '1/8 (fastest)',
  [SDFSamplingMode.FASTEST]: '1/16 (fastest)',
}

export interface SDFPrecisionModeSelectorProps {
  precisionMode: SDFPrecisionMode
  samplingMode: SDFSamplingMode
  onChange: (
    newPrecisionMode: SDFPrecisionMode,
    newSamplingMode: SDFSamplingMode
  ) => void
}

export default function SDFPrecisionModeSelector({
  precisionMode,
  samplingMode,
  onChange
}: SDFPrecisionModeSelectorProps) {
  return (
    <>
      <fieldset>
        <h3>Precision</h3>
        <RadioSelector
          name='precision-mode'
          options={PRECISION_MODE_OPTIONS}
          initialOption={precisionMode}
          onChange={(newOption: string) => {
            onChange(
              newOption as SDFPrecisionMode,
              samplingMode
            )
          }}
          compact
        />
        
        <SelectSelector
          title='Samples' 
          options={SAMPLING_MODE_OPTIONS}
          value={samplingMode}
          onChange={(newSamplingMode: SDFSamplingMode) => {
            onChange(
              precisionMode,
              newSamplingMode as SDFSamplingMode
            )
          }}
          disabled={
            precisionMode != SDFPrecisionMode.EXACT
          }
        />
        <p></p>
      </fieldset>
    </>
  )
}