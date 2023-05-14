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
import Section from '@/components/section'
import SDFThresholdInput from '@/components/sdf-threshold-input'
import CopyBtn from '@/components/copy-btn'

export interface SDFIfyPageProps { }

export default function SDFIfyPage({ }: SDFIfyPageProps) {
  const [inputImage, setInputImage] = React.useState<HTMLImageElement | null>()
  const [inputImageURL, setInputImageURL] = React.useState<string | null>()
  const [radiusX, setRadiusX] = React.useState<number>(64)
  const [radiusY, setRadiusY] = React.useState<number>(64)
  const [threshold, setThreshold] = React.useState<number>(0.2)
  const [overflowMode, setOverflowMode] = React.useState<SDFConverterOverflowMode>(
    SDFConverterOverflowMode.CLIP
  )
  const [outputImageURL, setOutputImageURL] = React.useState<string>()

  React.useEffect(() => {
    if (inputImage) {
      generateSDF(
        inputImage,
        {
          radiusX,
          radiusY,
          threshold,
          overflowMode,
        }
      ).then((newOutputImageURL: string) => {
        setOutputImageURL(newOutputImageURL)
      })
    }
    else {
      setOutputImageURL('')
    }
  }, [
    inputImageURL,
    radiusX,
    radiusY,
    overflowMode
  ])

  return (
    <>
      <nav className='site-nav'>
        <h1>
          {APP_NAME}
          <small>v0.1</small>
        </h1>
      </nav>
      <main>
        <form>
          <div className={sdfConverterPageStyles.sdfConverterGrid}>
            <Section
              id="input-section"
              title='Input image'
              variant='secondary'
              topLevel
            >
              <ImageUploader
                onChange={
                  (
                    newImage: HTMLImageElement | null,
                    newImageURL: string | null
                  ) => {
                    setInputImage(newImage)
                    setInputImageURL(newImageURL)
                  }
                }
              />
            </Section>
            <Section
              id="parameters-section"
              title='Parameters'
              variant='primary'
              topLevel
            >
              <SDFThresholdInput
                initialThreshold={threshold}
                onChange={(newThreshold: number) => {
                  setThreshold(newThreshold)
                }}
              />
              <SDFRadiusInput
                initialRadiusX={radiusX}
                initialRadiusY={radiusY}
                onChange={(newRadiusX: number, newRadiusY: number) => {
                  setRadiusX(newRadiusX)
                  setRadiusY(newRadiusY)
                }}
              />
              <SDFOverflowModeSelector
                onChange={(newOverflowMode: SDFConverterOverflowMode) => {
                  setOverflowMode(newOverflowMode)
                }}
              />
            </Section>
            <Section
              id="output-section"
              title='Result'
              variant='tertiary'
              topLevel
            >
              <div className='align-right'>
                <CopyBtn value="test" />
              </div>
              <div className={
                [
                  'align-center',
                  sdfConverterPageStyles.imagePreviewContainer,
                  sdfConverterPageStyles.outputContainer
                ].join(' ')
              }>
                {
                  outputImageURL ? (
                    <div className='card inline'>
                      <img
                        className={imageStyles.imagePreview}
                        src={outputImageURL}
                        alt="Output image"
                      />
                    </div>
                  ) : (
                    <p>Input image required</p>
                  )
                }
              </div>
            </Section>
          </div>
        </form>
      </main>
    </>
  )
}