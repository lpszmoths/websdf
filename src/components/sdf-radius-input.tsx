'use client'

import * as React from 'react'

export interface SDFRadiusInputProps {
  initialRadiusX: number
  initialRadiusY: number
  onChange: (
    newRadiusX: number,
    newRadiusY: number,
  ) => void
}

export default function SDFRadiusInput({
  initialRadiusX,
  initialRadiusY,
  onChange
}: SDFRadiusInputProps) {
  const [radiusX, setRadiusX] = React.useState<number>(initialRadiusX)
  const [radiusY, setRadiusY] = React.useState<number>(initialRadiusY)

  React.useEffect(() => {
    onChange(radiusX, radiusY)
  }, [
    radiusX,
    radiusY,
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
              min={0}
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
              min={0}
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
