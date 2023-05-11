'use client'

import * as React from 'react'

import imageStyles from '../styles/images.module.css'

export interface ImageUploaderProps {
  onChange: (image: HTMLImageElement | null, imageURL: string | null) => void
}

export default function ImageUploader({ onChange }: ImageUploaderProps) {
  const [inputImageURL, setInputImageURL] = React.useState<string>()
  const [imageMetadata, setImageMetadata] = React.useState<string>()

  const onInputFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length >= 1) {
      const file: File = e.target.files![0]
      const url: string = URL.createObjectURL(file)
      const img: HTMLImageElement = new Image()
      img.addEventListener('load', () => {
        setImageMetadata(
          `${img.width}x${img.height}px`
        )
        onChange(img, url)
      })
      img.addEventListener('error', () => {
        onChange(null, null)
      })
      img.src = url
      setInputImageURL(url)
    }
    else {
      setInputImageURL('')
      setImageMetadata('')
      onChange(null, null)
    }
  }

  return (
    <>
      {
        inputImageURL ? (
          <div className='columns centered'>
            <div className={
              [
                'align-center',
                imageStyles.imagePreviewContainer,
              ].join(' ')
            }>
              <div className='card inline'>
                <img
                  className={
                    [
                      imageStyles.imagePreview,
                      imageStyles.small,
                    ].join(' ')
                  }
                  src={inputImageURL}
                  width="100%"
                  alt="Preview of the input image"
                />
              </div>
            </div>
            <div>
              {
                imageMetadata ? (
                  <>
                    <p>{imageMetadata}</p>
                    <p>Nice image!</p>
                  </>
                ) : null
              }
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
            inputImageURL ? (
              'Replace image'
            ) : (
              'Paste or upload an image'
            )
          }
        </label>
      </div>
    </>
  )
}