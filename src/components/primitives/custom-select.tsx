'use client'

import * as React from 'react'

export interface CustomSelectProps<T extends string>
extends Omit<HTMLSelectElement, 'options'> {
  heading: React.ReactNode
  value: T
  options: Record<T, string>
  onChange: (newValue: T) => void
}

export function CustomSelect<T extends string>({
  heading,
  value,
  options,
  onChange,
  disabled
}: CustomSelectProps<T>) {
  return (
    <>
      <label>
        {
          heading ? (
            <p>{heading}</p>
          ) : null
        }
        <div className='select-container'>
          <select
            value={value}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              onChange(e.target.value as T)
            }}
            disabled={disabled}
          >
            {
              Object.keys(options).map(
                (key: string, i: number) => (
                  <option
                    key={i}
                    value={key}
                  >{options[key as T]}</option>
                )
              )
            }
          </select>
          <div className='focus'></div>
        </div>
      </label>
    </>
  )
}
