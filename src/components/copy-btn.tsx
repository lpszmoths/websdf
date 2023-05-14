'use client'

import * as React from 'react'

export interface CopyBtnProps {
  value?: string
}

export default function CopyBtn({ value }: CopyBtnProps) {
  const [hasSuccess, setHasSuccess] = React.useState<boolean>(false)
  const [timeoutHandle, setTimeoutHandle] = React.useState<number>(0)

  const onCopy = (e: React.MouseEvent<any>) => {
    navigator.clipboard.writeText(value!)
      .then(() => {
        if (timeoutHandle) {
          clearTimeout(timeoutHandle)
        }

        setHasSuccess(true)

        // typing workaround because of nodejs
        const newTimeoutHandle = (setTimeout(() => {
          setHasSuccess(false)
        }, 3000) as unknown) as number

        setTimeoutHandle(newTimeoutHandle)
      })
      .catch(
        ((rejectReason: any) => {
          throw new Error('Unable to copy to clipboard: ' + rejectReason)
        })
      )
  }

  return (
    <div className='columns centered'>
      <div
        className='align-right'
        aria-live='assertive'
      >
        {
          hasSuccess ? 'Copied!' : null
        }
      </div>
      <div>
        <button
          type='button'
          onClick={onCopy}
          disabled={!value}
        >Copy to clipboard</button>
      </div>
    </div>
  )
}