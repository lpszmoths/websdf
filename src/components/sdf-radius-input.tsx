'use client'

import * as React from 'react'

export interface SDFOverflowModeSelectorProps {
  onChange: (newRadiusX: number, newRadiusY: number) => void
}

export default function SDFRadiusInput({ onChange }: SDFOverflowModeSelectorProps) {
  const [radiusX, setRadiusX] = React.useState<number>(64)
  const [radiusY, setRadiusY] = React.useState<number>(64)

  React.useEffect(() => {
    onChange(radiusX, radiusY)
  }, [
    radiusX,
    radiusY
  ])

  return (
    <>
      <fieldset>
      <h3>Radius</h3>
      <ul className='no-bullets'>
        <li>
          <label>
            <input
              type='number'
              value={radiusX}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setRadiusX(parseInt(e.target.value))
              }}
            ></input>
            Horizontal
          </label>
        </li>
        <li>
          <label>
            <input
              type='number'
              value={radiusY}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setRadiusY(parseInt(e.target.value))
              }}
            ></input>
            Vertical
          </label>
        </li>
      </ul>
      </fieldset>
    </>
  )
}
