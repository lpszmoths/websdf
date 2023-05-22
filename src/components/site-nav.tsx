'use client'

import { APP_NAME, APP_VERSION } from '@/app-constants'
import Link from 'next/link'
import * as React from 'react'

export enum PAGES {
  SDFGEN = 'sdfgen',
  KERNELGEN = 'kernelgen',
}

export interface SiteNavProps {
  current?: string
}

export default function SiteNav({ current }: SiteNavProps) {
  return (
    <>
      <div className='site-nav-container'>
        <nav className='site-nav'>
          <ul>
            <li>
              <label
                className='button flat'
                aria-label='Menu'
                htmlFor='nav-menu-toggle-checkbox'
              >
                <i className='icon hamburger'></i>
              </label>
            </li>
            <li>
              <h1>
                {APP_NAME}
                <small>v{APP_VERSION}</small>
              </h1>
            </li>
            <li className='spacer'></li>
            <li>
              <button>Help</button>
            </li>
          </ul>
        </nav>
      </div>
      <input
        type='checkbox'
        id='nav-menu-toggle-checkbox'
        className='toggle-checkbox hidden-input'
        aria-hidden
      />
      <div
        id='nav-menu-container'
        className='overlay-container toggle-content'
      >
        <ul className='menu colors-primary'>
          <li>
            <Link href='/'>Home</Link>
          </li>
          <li>
            <Link href='/sdfgen'>SDF generator</Link>
          </li>
          <li>
            <Link href='/kernelgen'>Convolution kernel generator</Link>
          </li>
        </ul>
      </div>
    </>
  )
}