import {
  SDFChannelMode,
  SDFConverterExpansionMode,
  SDFConverterOverflowMode,
  SDFGenerationOptions,
  SDFPrecisionMode,
  SDFSamplingMode,
  SDFSignMode
} from './sdf-types'

export const DEFAULT_OVERFLOW_MODE = SDFConverterOverflowMode.CLIP

export const DEFAULT_EXPANSION_MODE = SDFConverterExpansionMode.CLOSEST_POWER_OF_2

export const DEFAULT_CHANNEL_MODE = SDFChannelMode.RGBA

export const DEFAULT_SIGN_MODE = SDFSignMode.UNSIGNED

export const DEFAULT_PRECISION_MODE = SDFPrecisionMode.APPROXIMATE

export const DEFAULT_SAMPLING_MODE = SDFSamplingMode.FAST

export const NUM_SAMPLES_BY_SAMPLING_MODE: Record<SDFSamplingMode, number> = {
  [SDFSamplingMode.BESTEST]: 2,
  [SDFSamplingMode.BEST]: 1,
  [SDFSamplingMode.BALANCED]: 0.5,
  [SDFSamplingMode.FAST]: 1 / 4,
  [SDFSamplingMode.FASTER]: 1 / 8,
}

export const SDF_EXTERNAL_LINK = 'https://en.wikipedia.org/wiki/Signed_distance_function'

export const DEFAULT_SDF_GENERATION_OPTIONS: SDFGenerationOptions = {
  radius: 32,
  threshold: 0.5,
  overflowMode: SDFConverterOverflowMode.CLIP,
  precisionMode: SDFPrecisionMode.EXACT,
  samplingMode: SDFSamplingMode.FAST,
  channelMode: SDFChannelMode.RGBA,
}
