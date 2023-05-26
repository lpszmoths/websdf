'use client'

import * as React from 'react'

import boxStyles from '../styles/boxes.module.css'

export interface SectionProps extends React.PropsWithChildren {
  id?: string
  title?: React.ReactNode
  className?: string
  classNames?: string[]
  variant?: 'primary' | 'secondary' | 'tertiary'
  topLevel?: boolean
  subSections?: React.ReactNode[]
}

export default function Section({
  id,
  title,
  className,
  classNames,
  variant,
  topLevel,
  children,
  subSections,
}: SectionProps) {
  const optionalProps: any = {}
  if (id) {
    optionalProps['id'] = id
  }

  let classNamesActual: string[] = []
  if (className) {
    classNamesActual.push(className)
  }
  if (classNames) {
    classNamesActual = classNamesActual.concat(classNames)
  }
  
  variant = variant || 'primary'
  classNamesActual.push(`colors-${variant}`)
  classNamesActual.push(boxStyles.box)

  if (topLevel) {
    classNamesActual.push(
      boxStyles.topLevel
    )
  }

  return (
    <>
      <section
        {...optionalProps}
        className={classNamesActual.join(' ')}
      >
        {
          title ? (
            <h2 className={boxStyles.boxTitle}>{title}</h2>
          ) : null
        }
        {
          subSections ? (
            subSections.map((ss: React.ReactNode, i: number) => (
              <div
                className={boxStyles.boxSection}
                key={i}
              >
                {ss}
              </div>
            ))
          ) : (
            <div className={boxStyles.boxSection}>
              {children}
            </div>
          )
        }
      </section>
    </>
  )
}