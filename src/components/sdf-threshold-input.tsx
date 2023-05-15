'use client'

import * as React from 'react'

export interface SDFThresholdInputProps {
  initialThreshold: number
  onChange: (newThreshold: number) => void
}

export default function SDFThresholdInput({
  initialThreshold,
  onChange
}: SDFThresholdInputProps) {
  const [threshold, setThreshold] = React.useState<number>(initialThreshold)

  React.useEffect(() => {
    onChange(threshold)
  }, [
    threshold
  ])

  return (
    <>
      <fieldset>
      <h3>Threshold (0.0 - 1.0)</h3>
      <p>Pixels darker than this value are considered to be <em>inside</em> the SDF shape. Increase this value if there is too much noise in the signed distance field. Default: <strong>0.5</strong></p>
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
                setThreshold(parseFloat(e.target.value))
              }}
            ></input>
          </label>
        </li>
      </ul>
      </fieldset>
    </>
  )
}
