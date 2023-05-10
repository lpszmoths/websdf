'use client'

import * as React from 'react'

import sdfConverterPageStyles from '../styles/sdf-converter-page.module.css'
import boxStyles from '../styles/boxes.module.css'
import imageStyles from '../styles/images.module.css'
import { SDFConverterOverflowMode } from '@/sdf/sdf-constants'
import { generateSDF } from '@/sdf/sdf-lib'
import { APP_NAME } from '@/app-constants'

export interface SDFIfyPageProps { }

export default function SDFIfyPage({ }: SDFIfyPageProps) {
  const [inputImage, setInputImage] = React.useState<Blob | null>()
  const [inputImageURL, setInputImageURL] = React.useState<string>()
  const [radiusX, setRadiusX] = React.useState<number>(64)
  const [radiusY, setRadiusY] = React.useState<number>(64)
  const [overflowMode, setOverflowMode] = React.useState<SDFConverterOverflowMode>(
    SDFConverterOverflowMode.CLIP
  )
  const [outputImageURL, setOutputImageURL] = React.useState<string>()

  const onInputFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length >= 1) {
      const file: File = e.target.files![0]
      const url: string = URL.createObjectURL(file)
      setInputImage(file)
      setInputImageURL(url)
      setOutputImageURL('')
    }
    else {
      setInputImage(null)
      setInputImageURL("")
      setOutputImageURL('')
    }
  }

  React.useEffect(() => {
    if (inputImage) {
      const inputImageData: ImageData = new ImageData(64, 64)
      generateSDF(
        inputImageData,
        {
          radiusX,
          radiusY,
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
    inputImage,
    radiusX,
    radiusY,
    overflowMode
  ])

  return (
    <>
      <nav className='site-nav'>
        <h1>{APP_NAME}</h1>
      </nav>
      <main>
        <form>
          <div className={sdfConverterPageStyles.sdfConverterGrid}>
            <section
              id="input-section"
              className={
                [
                  boxStyles.boxSecondary,
                  boxStyles.topLevel
                ].join(' ')
              }
            >
              <h2 className={boxStyles.boxTitle}>Input image</h2>
              <div className={boxStyles.boxSection}>
                {
                  inputImage ? (
                    <div className='columns centered'>
                      <div className={
                        [
                          'align-center',
                          sdfConverterPageStyles.imagePreviewContainer,
                        ].join(' ')
                      }>
                        <div className='card inline'>
                          <img
                            className={imageStyles.imagePreview}
                            src={inputImageURL}
                            width="100%"
                            alt="Preview of the input image"
                          />
                        </div>
                      </div>
                      <div>
                        <ul className='no-bullets'>
                          <li>
                            1024x2048px
                          </li>
                          <li>
                            RGBA
                          </li>
                        </ul>
                        <p>Nice image!</p>
                      </div>
                    </div>
                  ) : null
                }
                <div>
                  <input
                    type="file"
                    id="input-image-upload"
                    style={{ 'display': 'none' }}
                    onChange={onInputFileChange}
                  />
                  <label
                    className="button large"
                    htmlFor="input-image-upload"
                  >
                    {
                      inputImage ? (
                        'Replace image'
                      ) : (
                        'Paste or upload an image'
                      )
                    }
                  </label>
                </div>
              </div>
            </section>
            <section
              id="parameters-section"
              className={
                [
                  boxStyles.boxPrimary,
                  boxStyles.topLevel
                ].join(' ')
              }
            >
              <h2 className={boxStyles.boxTitle}>Parameters</h2>
              <div className={boxStyles.boxSection}>
                <fieldset>
                  <h3>Radius</h3>
                  <ul className='no-bullets'>
                    <li>
                      <label>
                        <input
                          type='number'
                          value={radiusX}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setRadiusX(parseInt(e.target.value))
                          }}
                        ></input>
                        Horizontal
                      </label>
                    </li>
                    <li>
                      <label>
                        <input
                          type='number'
                          value={radiusY}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setRadiusY(parseInt(e.target.value))
                          }}
                        ></input>
                        Vertical
                      </label>
                    </li>
                  </ul>
                </fieldset>
                <fieldset>
                  <h3>Overflow</h3>
                  <ul className='no-bullets'>
                    <li>
                      <label>
                        <input
                          type="radio"
                          name="texture-overflow-mode"
                          value={SDFConverterOverflowMode.CLIP}
                          checked={
                            overflowMode === SDFConverterOverflowMode.CLIP
                          }
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setOverflowMode(e.target.value as SDFConverterOverflowMode)
                          }}
                        ></input>
                        <span>
                          Clip to image bounds
                        </span>
                      </label>
                    </li>
                    <li>
                      <label>
                        <input
                          type="radio"
                          name="texture-overflow-mode"
                          value={SDFConverterOverflowMode.WRAP}
                          checked={
                            overflowMode === SDFConverterOverflowMode.WRAP
                          }
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setOverflowMode(e.target.value as SDFConverterOverflowMode)
                          }}
                        ></input>
                        <span>
                          Wrap around
                        </span>
                      </label>
                    </li>
                    <li>
                      <label>
                        <input
                          type="radio"
                          name="texture-overflow-mode"
                          value={SDFConverterOverflowMode.EXPAND_AS_NECESSARY}
                          checked={
                            overflowMode === SDFConverterOverflowMode.EXPAND_AS_NECESSARY
                          }
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setOverflowMode(e.target.value as SDFConverterOverflowMode)
                          }}
                        ></input>
                        <span>
                          Expand image as necessary
                        </span>
                      </label>
                    </li>
                  </ul>
                </fieldset>
              </div>
            </section>
            <section
              id="output-section"
              className={
                [
                  boxStyles.boxTertiary,
                  boxStyles.topLevel
                ].join(' ')
              }
            >
              <h2 className={boxStyles.boxTitle}>Result</h2>
              <div className={boxStyles.boxSection}>
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
              </div>
            </section>
          </div>
        </form>
      </main>
    </>
  )
}