'use client'

import * as React from 'react'

export interface SelectSelectorProps<T extends string> {
  title: React.ReactNode
  value: T
  options: Record<T, string>
  onChange: (newValue: T) => void
  disabled?: boolean
}

export function SelectSelector<T extends string>({
  title,
  value,
  options,
  onChange,
  disabled
}: SelectSelectorProps<T>) {
  return (
    <>
      <label>
        <p>{title}</p>
        <div className='select-container'>
          <select
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
                    selected={
                      value == key
                    }
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
