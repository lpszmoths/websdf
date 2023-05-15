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
  RGB = 'rgb',
}

export enum SDFSignMode {
  SIGNED = 'signed',
  UNSIGNED = 'unsigned',
}

export enum SDFPrecisionMode {
  APPROXIMATE = 'approximate',
  EXACT = 'exact',
}
