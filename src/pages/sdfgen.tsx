'use client'

import * as React from 'react'

import sdfConverterPageStyles from '../styles/sdf-converter-page.module.css'
import imageStyles from '../styles/images.module.css'
import { SDFChannelMode, SDFConverterOverflowMode, SDFPrecisionMode, SDF_EXTERNAL_LINK } from '@/sdf/sdf-constants'
import { generateSDF } from '@/sdf/sdf-lib'
import ImageUploader from '@/components/image-uploader'
import SDFOverflowModeSelector from '@/components/sdf-overflow-mode-selector'
import Section from '@/components/section'
import SDFThresholdInput from '@/components/sdf-threshold-input'
import DownloadBtn from '@/components/download-btn'
import SDFChannelModeSelector from '@/components/sdf-channel-mode-selector'
import SDFSignModeSelector from '@/components/sdf-sign-mode-selector'
import SDFPrecisionModeSelector from '@/components/sdf-precision-selector'
import SiteNav, { PAGES } from '@/components/site-nav'

export interface SDFIfyPageProps { }

export default function SDFIfyPage({ }: SDFIfyPageProps) {
  const [inputImage, setInputImage] = React.useState<HTMLImageElement | null>()
  const [inputImageURL, setInputImageURL] = React.useState<string | null>()
  const [radiusX, setRadiusX] = React.useState<number>(64)
  const [radiusY, setRadiusY] = React.useState<number>(64)
  const [precisionMode, setPrecisionMode] = React.useState<SDFPrecisionMode>(SDFPrecisionMode.APPROXIMATE)
  const [numSamples, setNumSamples] = React.useState<number>(8)
  const [threshold, setThreshold] = React.useState<number>(0.5)
  const [overflowMode, setOverflowMode] = React.useState<SDFConverterOverflowMode>(
    SDFConverterOverflowMode.CLIP
  )
  const [channelMode, setChannelMode] = React.useState<SDFChannelMode>(
    SDFChannelMode.MONOCHROME
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
          precisionMode,
          numSamples,
          channelMode,
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
    overflowMode,
    channelMode
  ])

  return (
    <>
      <SiteNav current={PAGES.SDFGEN} />
      <main>
        <form>
          <div className={sdfConverterPageStyles.sdfConverterGrid}>
            <Section
              id="input-section"
              title='Input image'
              variant='secondary'
              topLevel
              subSections={[
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
                />,
                <>
                  <p>For best results, your image should be:</p>
                  <ul>
                    <li>High resolution</li>
                    <li>Black and white lineart</li>
                  </ul>
                </>
              ]}
            >
            </Section>
            <Section
              id="parameters-section"
              title='Parameters'
              variant='primary'
              topLevel
            >
              <SDFPrecisionModeSelector
                initialPrecisionMode={precisionMode}
                onChange={(newPrecisionMode: SDFPrecisionMode) => {
                  setPrecisionMode(newPrecisionMode)
                }}
              />
              <SDFSignModeSelector
                onChange={() => {}}
              />
              <SDFThresholdInput
                initialThreshold={threshold}
                onChange={(newThreshold: number) => {
                  setThreshold(newThreshold)
                }}
              />
              {/* <SDFRadiusInput
                initialRadiusX={radiusX}
                initialRadiusY={radiusY}
                onChange={(newRadiusX: number, newRadiusY: number) => {
                  setRadiusX(newRadiusX)
                  setRadiusY(newRadiusY)
                }}
              /> */}
              <SDFOverflowModeSelector
                onChange={(newOverflowMode: SDFConverterOverflowMode) => {
                  setOverflowMode(newOverflowMode)
                }}
              />
              <SDFChannelModeSelector
                onChange={(newChannelMode: SDFChannelMode) => {
                  setChannelMode(newChannelMode)
                }}
              />
            </Section>
            <Section
              id="output-section"
              title={<>
                Distance field texture
                (
                  <a
                    href={SDF_EXTERNAL_LINK}
                    target='_blank'
                  >What's a distance field?</a>
                )
              </>}
              variant='tertiary'
              topLevel
            >
              {/* <div className='align-right'>
                <CopyBtn value="test" />
              </div> */}
              <div className={
                [
                  'align-center',
                  sdfConverterPageStyles.imagePreviewContainer,
                  sdfConverterPageStyles.outputContainer
                ].join(' ')
              }>
                {
                  outputImageURL ? (
                    <>
                      {/* <p><i className='caret-down'></i> Right click &gt; Save as <i className='caret-down'></i></p> */}
                      <div className='align-right'>
                        <DownloadBtn
                          href={outputImageURL}
                          destinationFilename="sdf.png"
                        />
                      </div>
                      <div className='card inline'>
                        <img
                          className={imageStyles.imagePreview}
                          src={outputImageURL}
                          alt="Output image"
                          tabIndex={1}
                        />
                      </div>
                    </>
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