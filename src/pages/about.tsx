'use client'

import * as React from 'react'
import Section from '@/components/section'
import SiteNav, { PAGES } from '@/components/site-nav'

export default function AboutPage({}: {}) {
  return (
    <>
      <SiteNav current={PAGES.ABOUT} />
      <main className='single-column'>
        <div>
          <Section
            id="input-section"
            title={
              <>
                <i
                  className='question'
                ></i>
                <span>About</span>
              </>
            }
            variant='primary'
            topLevel
            subSections={[
              <>
                <h3>What's an SDF or distance field?</h3>
                <p className='small'>
                  Distance fields (usually _signed_
                  distance fields) are maps that store
                  the distance from any point in the
                  map to a given shape.
                </p>
              </>,
              <>
                <h3>What are they for?</h3>
                <p className='small'>
                  3D programs, such as videogames,
                  use them to render text and other
                  geometric shapes faster at a distance.
                </p>
                <p className='small'>
                  For more information, see{' '}
                  <a
                    href='https://en.wikipedia.org/wiki/Signed_distance_function#Applications'
                    target='_blank'
                  >this Wikipedia section on
                  applications of SDFs</a>.
                </p>
              </>,
              <>
                <h3>What makes this tool different from other SDF generators?</h3>
                <p className='small'>
                  Most SDF generators create distance
                  fields from vector images or fonts.
                  This tool takes in raster images
                  (.jpg, .png), which allows you to
                  create distance fields out of
                  any black-and-white image.
                </p>
              </>
            ]}
          >
          </Section>
          <Section
            id="credits-section"
            title={
              <>
                <i
                  className='text'
                ></i>
                <span>Credits</span>
              </>
            }
            variant='tertiary'
            topLevel
            subSections={[
              <>
                <ul>
                  <li>
                    <a
                      href='https://fontlibrary.org/en/font/chicagoflf'
                      target='_blank'
                    >
                      ChicagoFLF font by Robin Casady
                    </a>
                    {' '}
                    (public domain)
                  </li>
                  <li>
                    <a
                      href='https://lospec.com/palette-list/ayy4'
                      target='_blank'
                    >
                      AYY4 palette by Polyducks
                    </a>{' '}
                    (modified for accessibility)
                  </li>
                </ul>
              </>
            ]}
          >
          </Section>
        </div>
      </main>
    </>
  )
}