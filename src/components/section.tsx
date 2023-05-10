'use client'

import * as React from 'react'

import sdfConverterPageStyles from '../styles/sdf-converter-page.module.css'
import boxStyles from '../styles/boxes.module.css'
import imageStyles from '../styles/images.module.css'
import { SDFConverterOverflowMode } from '@/sdf/sdf-constants'
import { generateSDF } from '@/sdf/sdf-lib'
import { APP_NAME } from '@/app-constants'
import ImageUploader from '@/components/image-uploader'
import SDFOverflowModeSelector from '@/components/sdf-overflow-mode-selector'
import SDFRadiusInput from '@/components/sdf-radius-input'

export interface SectionProps extends React.PropsWithChildren {
  id?: string
  title?: string
  className?: string
  classNames?: string[]
  variant?: 'primary' | 'secondary' | 'tertiary'
  topLevel?: boolean
}

export default function Section({
  id,
  title,
  className,
  classNames,
  variant,
  topLevel,
  children,
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
  switch(variant) {
    case 'primary':
      classNamesActual.push(
        boxStyles.boxPrimary
      )
      break
    case 'secondary':
      classNamesActual.push(
        boxStyles.boxSecondary
      )
      break
    case 'tertiary':
      classNamesActual.push(
        boxStyles.boxTertiary
      )
      break
  }

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
        <div className={boxStyles.boxSection}>
          {children}
        </div>
      </section>
    </>
  )
}