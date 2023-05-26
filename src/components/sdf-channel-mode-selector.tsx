'use client'

import * as React from 'react'

import { SDFChannelMode } from '@/sdf/sdf-types'
import RadioSelector from './radio-selector'

export interface SDFChannelModeSelectorProps {
  channelMode: SDFChannelMode
  onChange: (newChannelMode: SDFChannelMode) => void
}

const CHANNEL_MODE_OPTIONS = {
  [SDFChannelMode.MONOCHROME]: 'Monochrome',
  [SDFChannelMode.RGBA]: (
    <>
      <span>RGBA</span>
      <span>(RG = direction,
        B = distance,
        A = traversed)
      </span>
    </>
  ),
}

export default function SDFChannelModeSelector({
  channelMode,
  onChange,
}: SDFChannelModeSelectorProps) {
  return (
    <>
      <fieldset>
        <h3>Channels</h3>
        <RadioSelector
          name='channel-mode'
          options={CHANNEL_MODE_OPTIONS}
          initialOption={SDFChannelMode.MONOCHROME}
          onChange={(newOption: string) => {
            onChange(newOption as SDFChannelMode)
          }}
        />
      </fieldset>
    </>
  )
}