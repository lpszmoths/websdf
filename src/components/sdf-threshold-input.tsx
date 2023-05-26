'use client'

import * as React from 'react'

export interface SDFThresholdInputProps {
  threshold: number
  onChange: (newThreshold: number) => void
}

export default function SDFThresholdInput({
  threshold,
  onChange
}: SDFThresholdInputProps) {
  return (
    <>
      <fieldset>
      <h3>Threshold (0.0 - 1.0)</h3>
      <p className='small'>Pixels darker than this value are considered to be <em>inside</em> the SDF shape. Increase this value if the final image is too noisy. Default: <strong>0.5</strong></p>
      <ul className='no-bullets'>
        <li>
          <label>
            <input
              type='number'
              value={threshold}
              min={0.0}
              max={1.0}
              step={1.0/20.0}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                onChange(parseFloat(e.target.value))
              }}
            ></input>
          </label>
        </li>
      </ul>
      </fieldset>
    </>
  )
}
