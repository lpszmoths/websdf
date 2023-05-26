'use client'

import * as React from 'react'

export interface SDFRadiusInputProps {
  initialRadius: number
  onChange: (
    newRadius: number,
  ) => void
}

export default function SDFRadiusInput({
  initialRadius,
  onChange
}: SDFRadiusInputProps) {
  const [radius, setRadius] = React.useState<number>(initialRadius)

  React.useEffect(() => {
    onChange(radius)
  }, [
    radius,
  ])

  return (
    <>
      <fieldset>
        <h3>Radius</h3>
        <p>
          <label>
            <input
              type='number'
              value={radius}
              min={0}
              size={4}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setRadius(parseInt(e.target.value))
              }}
            ></input>
          </label>
        </p>
      </fieldset>
    </>
  )
}
