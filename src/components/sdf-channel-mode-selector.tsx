'use client'

import * as React from 'react'

import { SDFChannelMode } from '@/sdf/sdf-constants'
import RadioSelector from './radio-selector'

export interface SDFChannelModeSelectorProps {
  onChange: (newChannelMode: SDFChannelMode) => void
}

export default function SDFChannelModeSelector({ onChange }: SDFChannelModeSelectorProps) {
  const [channelMode, setChannelMode] = React.useState<SDFChannelMode>(
    SDFChannelMode.MONOCHROME
  )

  const options = {
    [SDFChannelMode.MONOCHROME]: 'Monochrome',
    [SDFChannelMode.RGB]: 'RGB (RG = direction, B = distance)',
  }

  React.useEffect(() => {
    onChange(channelMode)
  }, [
    channelMode
  ])

  return (
    <>
      <fieldset>
        <h3>Channels</h3>
        <RadioSelector
          name='channel-mode'
          options={options}
          initialOption={SDFChannelMode.MONOCHROME}
          onChange={(newOption: string) => {
            setChannelMode(newOption as SDFChannelMode)
          }}
          compact
        />
      </fieldset>
    </>
  )
}