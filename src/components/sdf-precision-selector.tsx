'use client'

import * as React from 'react'

import { SDFPrecisionMode, SDFSamplingMode } from '@/sdf/sdf-types'
import RadioSelector from './radio-selector'
import { CustomSelect } from './primitives/custom-select'

const PRECISION_MODE_OPTIONS = {
  [SDFPrecisionMode.APPROXIMATE]: 'Approximate',
  [SDFPrecisionMode.EXACT]: 'Exact',
}

const SAMPLING_MODE_OPTIONS: Record<SDFSamplingMode, string> = {
  [SDFSamplingMode.BESTEST]: '200% (smooth)',
  [SDFSamplingMode.BEST]: '100% (accurate)',
  [SDFSamplingMode.BALANCED]: '50% (balanced)',
  [SDFSamplingMode.FAST]: '25% (fast)',
  [SDFSamplingMode.FASTER]: '12.5% (fastest)',
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
        <p className='small'>
          Determines what percentage of pixels will be sampled.
        </p>
        {/* forcing exact mode */}
        {/* <RadioSelector
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
        /> */}
        
        <CustomSelect
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
        <p className='small'>
          Values under 100% skip some pixels.
          Values over 100% interpolate between pixels.
        </p>
      </fieldset>
    </>
  )
}