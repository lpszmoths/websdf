import { SDFChannelMode, SDFConverterOverflowMode, SDFGenerationOptions, SDFPrecisionMode, SDFSamplingMode } from '@/sdf/sdf-types'
import * as React from 'react'
import SDFPrecisionModeSelector from './sdf-precision-selector'
import SDFSignModeSelector from './sdf-sign-mode-selector'
import SDFThresholdInput from './sdf-threshold-input'
import SDFRadiusInput from './sdf-radius-input'
import SDFOverflowModeSelector from './sdf-overflow-mode-selector'
import SDFChannelModeSelector from './sdf-channel-mode-selector'

export interface SDFParametersProps {
  sdfGenerationOptions: SDFGenerationOptions
  onChange: (newOptions: SDFGenerationOptions) => void
}

export function SDFParameters({
  sdfGenerationOptions,
  onChange,
}: SDFParametersProps) {
  return (
    <>
      <SDFPrecisionModeSelector
        precisionMode={sdfGenerationOptions.precisionMode}
        samplingMode={sdfGenerationOptions.samplingMode}
        onChange={
          (
            newPrecisionMode: SDFPrecisionMode,
            newSamplingMode: SDFSamplingMode
          ) => {
            onChange({
              ...sdfGenerationOptions,
              precisionMode: newPrecisionMode,
              samplingMode: newSamplingMode,
            })
          }
        }
      />
      <SDFSignModeSelector
        onChange={
          () => {}
        }
      />
      <SDFThresholdInput
        threshold={sdfGenerationOptions.threshold}
        onChange={
          (
            newThreshold: number
          ) => {
            onChange({
              ...sdfGenerationOptions,
              threshold: newThreshold,
            })
          }
        }
      />
      <SDFRadiusInput
        initialRadiusX={sdfGenerationOptions.radiusX}
        initialRadiusY={sdfGenerationOptions.radiusY}
        onChange={(newRadiusX: number, newRadiusY: number) => {
          onChange({
            ...sdfGenerationOptions,
            radiusX: newRadiusX,
            radiusY: newRadiusY,
          })
        }}
      />
      <SDFOverflowModeSelector
        overflowMode={sdfGenerationOptions.overflowMode}
        onChange={(newOverflowMode: SDFConverterOverflowMode) => {
          onChange({
            ...sdfGenerationOptions,
            overflowMode: newOverflowMode,
          })
        }}
      />
      <SDFChannelModeSelector
        channelMode={sdfGenerationOptions.channelMode}
        onChange={(newChannelMode: SDFChannelMode) => {
          onChange({
            ...sdfGenerationOptions,
            channelMode: newChannelMode,
          })
        }}
      />
    </>
  )
}