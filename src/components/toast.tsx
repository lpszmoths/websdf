import { useEffect, useState } from 'react'
import toastStyles from '../styles/toast.module.css'

export class ToastEvent extends Event {
  constructor(public readonly message: string) {
    super('toast-event')
  }
}

export function ToastDisplayer() {
  const [message, setMessage] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState<boolean>(false)

  useEffect(() => {
    if (isMounted) {
      return
    }
    document.body.addEventListener(
      'toast-event',
      (event: Event) => {
        const msg = (event as ToastEvent).message
        setMessage(msg)

        setTimeout(
          () => {
            setMessage(' ')
          }
        )
      }
    )
    setIsMounted(true)
  }, [])

  return (
    <div className={toastStyles.toastDisplayer}>

    </div>
  )
}
