export enum SDFConverterOverflowMode {
  CLIP = 'clip',
  WRAP = 'wrap',
  EXPAND_AS_NECESSARY = 'expand-as-necessary',
}

export enum SDFConverterExpansionMode {
  EXACT_FIT = 'exact-fit',
  CLOSEST_POWER_OF_2 = 'closest-power-of-2',
}

export enum SDFChannelMode {
  MONOCHROME = 'monochrome',
  RGBA = 'rgba',
}

export enum SDFSignMode {
  SIGNED = 'signed',
  UNSIGNED = 'unsigned',
}

export enum SDFPrecisionMode {
  APPROXIMATE = 'approximate',
  EXACT = 'exact',
}

export enum SDFSamplingMode {
  BESTEST = 'bestest',
  BEST = 'best',
  BALANCED = 'balanced',
  FAST = 'fast',
  FASTER = 'faster',
}

export const NUM_SAMPLES_BY_SAMPLING_MODE: Record<SDFSamplingMode, number> = {
  [SDFSamplingMode.BESTEST]: 2,
  [SDFSamplingMode.BEST]: 1,
  [SDFSamplingMode.BALANCED]: 0.5,
  [SDFSamplingMode.FAST]: 1 / 4,
  [SDFSamplingMode.FASTER]: 1 / 8,
}

export interface SDFGenerationOptions {
  radius: number
  threshold: number
  overflowMode: SDFConverterOverflowMode
  precisionMode: SDFPrecisionMode
  samplingMode: SDFSamplingMode
  channelMode: SDFChannelMode
}
