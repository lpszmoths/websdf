'use client'

import * as React from 'react'

export interface DownloadBtnProps {
  href: string
  destinationFilename: string
}

export default function DownloadBtn({
  href,
  destinationFilename
}: DownloadBtnProps) {
  return (
    <a
      className='button'
      href={href}
      download={destinationFilename}
    >Download</a>
  )
}