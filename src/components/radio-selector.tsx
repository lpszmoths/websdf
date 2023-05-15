'use client'

import * as React from 'react'

export interface RadioSelectorProps {
  name: string
  options: {
    [key: string]: React.ReactNode
  }
  initialOption: string
  onChange: (selectedOption: string) => void
  compact?: boolean
  isDisabled?: (option: string) => boolean
}

export default function RadioSelector({
  name,
  options,
  initialOption,
  onChange,
  compact,
  isDisabled
}: RadioSelectorProps) {
  const [currentOption, setCurrentOption] = React.useState<string>(
    initialOption
  )

  React.useEffect(() => {
    onChange(currentOption)
  }, [
    currentOption
  ])

  const ulClassNames: string[] = ['no-bullets']
  if (compact) {
    ulClassNames.push('compact')
  }

  return (
    <>
      <ul className={ulClassNames.join(' ')}>
        {
          Object.keys(options).map(
            (option: string, i: number) => {
              const additionalProps: Partial<
                React.DetailedHTMLProps<
                  React.InputHTMLAttributes<HTMLInputElement>,
                  HTMLInputElement
                >
              > = {}
              if (isDisabled && isDisabled(option)) {
                additionalProps['disabled'] = true
              }
              else {
                additionalProps['onChange'] = (e: React.ChangeEvent<HTMLInputElement>) => {
                  setCurrentOption(e.target.value as string)
                }
              }
              return (
                <li key={i}>
                  <label>
                    <input
                      type="radio"
                      name={name}
                      value={option}
                      checked={
                        currentOption === option
                      }
                      {...additionalProps}
                    ></input>
                    <span>
                      {options[option]}
                    </span>
                  </label>
                </li>
              )
            }
          )
        }
      </ul>
    </>
  )
}