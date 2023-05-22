'use client'

import * as React from 'react'

import sdfConverterPageStyles from '../styles/sdf-converter-page.module.css'
import imageStyles from '../styles/images.module.css'
import { DEFAULT_SDF_GENERATION_OPTIONS, SDF_EXTERNAL_LINK } from '@/sdf/sdf-constants'
import { generateSDF } from '@/sdf/sdf-lib'
import ImageUploader from '@/components/image-uploader'
import Section from '@/components/section'
import DownloadBtn from '@/components/download-btn'
import SiteNav, { PAGES } from '@/components/site-nav'
import { SDFGenerationOptions } from '@/sdf/sdf-types'
import { SDFParameters } from '@/components/sdf-parameters'
import Icon from '@/components/icon'

export interface SDFIfyPageProps { }

interface SDFOutputSectionContentProps {
  isGenerating: boolean
  outputImageURL?: string
}

function SDFOutputSectionContent({
  isGenerating,
  outputImageURL,
}: SDFOutputSectionContentProps) {
  let content: React.ReactNode = null
  if (isGenerating) {
    content = <p>Generating...</p>
  }
  else if (!outputImageURL) {
    content = <p>Input image required</p>
  }
  else {
    content = (
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
    )
  }
  return (
    <div className={
      [
        'align-center',
        sdfConverterPageStyles.imagePreviewContainer,
        sdfConverterPageStyles.outputContainer
      ].join(' ')
    }>
      {content}
    </div>
  )
}

export default function SDFIfyPage({ }: SDFIfyPageProps) {
  const [isGenerating, setIsGenerating] = React.useState<boolean>(false)
  const [inputImage, setInputImage] = React.useState<HTMLImageElement | null>(null)
  const [inputImageURL, setInputImageURL] = React.useState<string | null>(null)
  const [sdfGenerationOptions, setSdfGenerationOptions] = (
    React.useState<SDFGenerationOptions>(
      DEFAULT_SDF_GENERATION_OPTIONS
    )
  )
  const [outputImageURL, setOutputImageURL] = React.useState<string>()

  React.useEffect(() => {
    if (inputImage) {
      setIsGenerating(true)
      generateSDF(
        inputImage,
        sdfGenerationOptions,
      ).then((newOutputImageURL: string) => {
        setOutputImageURL(newOutputImageURL)
        setIsGenerating(false)
      })
    }
    else {
      setOutputImageURL('')
      setIsGenerating(false)
    }
  }, [
    inputImageURL,
    sdfGenerationOptions,
  ])

  return (
    <>
      <SiteNav current={PAGES.SDFGEN} />
      <main>
        <form>
          <div className={sdfConverterPageStyles.sdfConverterGrid}>
            <Section
              id="input-section"
              title={
                <>
                  <i
                    className='file'
                  ></i>
                  Input image
                </>
              }
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
              title={
                <>
                  <i
                    className='parameters'
                  ></i>
                  Parameters
                </>
              }
              variant='primary'
              topLevel
            >
              <SDFParameters
                sdfGenerationOptions={sdfGenerationOptions}
                onChange={(newSdfGenerationOptions: SDFGenerationOptions) => {
                  setSdfGenerationOptions(newSdfGenerationOptions)
                }}
              />
            </Section>
            <Section
              id="output-section"
              title={<>
                <i
                  className='cupcake'
                ></i>
                Output texture
                <span
                  className='small float-right'
                >
                  (
                    <a
                      href={SDF_EXTERNAL_LINK}
                      target='_blank'
                    >Learn more</a>
                  )
                </span>
              </>}
              variant='tertiary'
              topLevel
            >
              <SDFOutputSectionContent
                isGenerating={isGenerating}
                outputImageURL={outputImageURL}
              />
            </Section>
          </div>
        </form>
      </main>
    </>
  )
}