'use client'

import * as React from 'react'

import { SDFConverterOverflowMode } from '@/sdf/sdf-constants'

export interface SDFOverflowModeSelectorProps {
  onChange: (newOverflowMode: SDFConverterOverflowMode) => void
}

export default function SDFOverflowModeSelector({ onChange }: SDFOverflowModeSelectorProps) {
  const [overflowMode, setOverflowMode] = React.useState<SDFConverterOverflowMode>(
    SDFConverterOverflowMode.CLIP
  )

  React.useEffect(() => {
    onChange(overflowMode)
  }, [
    overflowMode
  ])

  return (
    <>
      <fieldset>
        <h3>Overflow</h3>
        <ul className='no-bullets'>
          <li>
            <label>
              <input
                type="radio"
                name="texture-overflow-mode"
                value={SDFConverterOverflowMode.CLIP}
                checked={
                  overflowMode === SDFConverterOverflowMode.CLIP
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setOverflowMode(e.target.value as SDFConverterOverflowMode)
                }}
              ></input>
              <span>
                Clip to image bounds
              </span>
            </label>
          </li>
          <li>
            <label>
              <input
                type="radio"
                name="texture-overflow-mode"
                value={SDFConverterOverflowMode.WRAP}
                checked={
                  overflowMode === SDFConverterOverflowMode.WRAP
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setOverflowMode(e.target.value as SDFConverterOverflowMode)
                }}
              ></input>
              <span>
                Wrap around
              </span>
            </label>
          </li>
          <li>
            <label>
              <input
                type="radio"
                name="texture-overflow-mode"
                value={SDFConverterOverflowMode.EXPAND_AS_NECESSARY}
                checked={
                  overflowMode === SDFConverterOverflowMode.EXPAND_AS_NECESSARY
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setOverflowMode(e.target.value as SDFConverterOverflowMode)
                }}
              ></input>
              <span>
                Expand image as necessary
              </span>
            </label>
          </li>
        </ul>
      </fieldset>
    </>
  )
}