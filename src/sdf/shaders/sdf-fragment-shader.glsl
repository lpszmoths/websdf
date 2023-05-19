#version 300 es

precision highp float;

const int NUM_OFFSETS = 8;

const vec2 OFFSET_DIRECTIONS[NUM_OFFSETS] = vec2[](
  vec2(-1.0, -1.0), vec2( 0.0, -1.0), vec2( 1.0, -1.0),
  vec2(-1.0,  0.0),                   vec2( 1.0,  0.0),
  vec2(-1.0,  1.0), vec2( 0.0,  1.0), vec2( 1.0,  1.0)
);

const float SQRT_2 = 1.4142135623730950488016887242097;
const float SQRT_2_INV = 0.70710678118654752440084436210485;

const float DISTANCE_MULTIPLIERS[NUM_OFFSETS] = float[](
  1.0,        SQRT_2_INV, 1.0,
  SQRT_2_INV,             SQRT_2_INV,
  1.0,        SQRT_2_INV, 1.0
);

const float INFINITE_DISTANCE = 65536.0;

uniform sampler2D uTexture;
uniform vec2 uRadius;
uniform vec2 uTexelSize;
uniform float uThreshold;
uniform int uNumSamples;
uniform int uHighPrecision;
uniform int uEnableRGB;
in vec2 vTexCoord;
out vec4 outColor;

float sampleLod(vec2 uv, float lod) {
  float value = textureLod(uTexture, uv, lod).r;
  return value;
}

float sampleLodWithOffset(vec2 uvOffsetAmount, vec2 offsetDirection, float lod) {
  vec2 actualUV = vTexCoord + uvOffsetAmount * offsetDirection;
  float value = sampleLod(
    actualUV,
    lod
  );
  return value;
}

/**
 * Maps a value from [-1.0, 1.0] to [0.0, 1.0]
 */
float mapSignedToUnsigned(float v) {
  return 0.5 + v * 0.5;
}

/**
 * Maps and clamps a value from [0.0, MAX] to [1.0, 0.0]
 */
float mapDistanceToProximity(float dist, float max_dist) {
  float d = clamp(
    max_dist - dist,
    0.0,
    max_dist
  );
  d /= max_dist;
  return d;
}

vec3 findApproximateUnsignedDistanceAtLod(float referenceValue, float sign, float lod) {
  vec2 offsetAmount = uTexelSize * pow(2.0, lod);
  float offsetDistance = length(offsetAmount);
  float minValueFound = 1.0;
  float minDistFound = INFINITE_DISTANCE;
  vec2 minDistanceDirection = vec2(0.0, 0.0);

  for (int neighborIdx = 0; neighborIdx < NUM_OFFSETS; neighborIdx++) {
    vec2 offsetDirection = OFFSET_DIRECTIONS[neighborIdx];
    float value = sampleLodWithOffset(
      offsetAmount,
      offsetDirection,
      lod
    );
    float dist = offsetDistance * DISTANCE_MULTIPLIERS[neighborIdx];
    if (value <  0.5 && value < minValueFound) {
      minValueFound = value;
      minDistFound = dist;
      minDistanceDirection = offsetDirection * DISTANCE_MULTIPLIERS[neighborIdx];
    }
  }

  return vec3(minDistanceDirection.x, minDistanceDirection.y, minDistFound);
}

vec3 findApproximateUnsignedDistance() {
  /* query the current texel at max preision*/
  float currentValue = sampleLod(vTexCoord, 0.0);

  /* are we inside or outside? */
  float sdfSign = 1.0; /* outside */
  if (currentValue <= uThreshold) {
    sdfSign = -1.0; /* inside */

    /* TODO implement inner distance */
    return vec3(
      0.0,
      0.0,
      1.0
    );
  }
  
  /* go up in lods until we find a distance */
  vec3 dist = vec3(INFINITE_DISTANCE, INFINITE_DISTANCE, INFINITE_DISTANCE);
  for (float lod = 0.0; lod <= 6.0; lod += 1.0) {
    dist = findApproximateUnsignedDistanceAtLod(
      currentValue,
      sdfSign,
      lod
    );
    if (dist.z < INFINITE_DISTANCE) {
      dist.z = pow(2.0, lod);
      break;
    }
  }

  dist.x = 1.0 - mapSignedToUnsigned(dist.x);
  dist.y = 1.0 - mapSignedToUnsigned(dist.y);
  //dist.x = mapDistanceToProximity(dist.x, pow(2.0, 6.0));
  //dist.y = mapDistanceToProximity(dist.y, pow(2.0, 6.0));
  dist.z = mapDistanceToProximity(dist.z, pow(2.0, 6.0));

  return dist;
}

/* Returns 1 if outside the shape, 0 if inside */
float getSdfSign(float value) {
  if (value > uThreshold) {
    return 1.0;
  }
  else {
    return 0.0;
  }
}

void evaluateSignedOrientedDistance(
  inout vec3 currentSignedOrientedDistance,
  float currentSdfSign,
  vec2 uvOffset
) {
  float dist = length(uvOffset);
  vec3 newSignedOrientedDistance = vec3(
    uvOffset.x,
    uvOffset.y,
    dist
  );
  vec2 uv = vTexCoord + uvOffset;
  float value = sampleLod(uv, 0.0);
  float sign = getSdfSign(value);
  float signDiff = currentSdfSign - sign;

  if (newSignedOrientedDistance.z < currentSignedOrientedDistance.z) {
    currentSignedOrientedDistance = (
      (1.0 - signDiff) * currentSignedOrientedDistance +
      signDiff * newSignedOrientedDistance
    );
  }
}

vec3 findSignedDistance() {
  /* query the current texel at max preision */
  float currentValue = sampleLod(vTexCoord, 0.0);

  /* are we inside or outside? */
  float currentSdfSign = getSdfSign(currentValue);
  
  /* increase radius until the sign changes */
  vec3 bestSignedOrientedDistance = vec3(
    0.0,
    0.0,
    INFINITE_DISTANCE
  );
  vec2 uvRadius = uRadius * uTexelSize;
  vec2 increment = uTexelSize * 2.0;

  /* iterate from the center outwards */
  for (
    vec2 radius = increment;
    radius.x < uRadius.x;
    radius += increment
  ) {
    
    /* iterate through the top and bottom edge */
    for (
      float i = -radius.x;
      i <= radius.x;
      i += increment.x
    ) {
      vec2 uvOffset = vec2(i, 0.0);
      evaluateSignedOrientedDistance(
        bestSignedOrientedDistance,
        currentSdfSign,
        uvOffset
      );
    }

    /* iterate through the left and right edges */
    for (
      float j = increment.y - radius.y;
      j <= radius.y - increment.y;
      j += increment.y
    ) {
      vec2 uvOffset = vec2(0.0, j);
      evaluateSignedOrientedDistance(
        bestSignedOrientedDistance,
        currentSdfSign,
        uvOffset
      );
    }

    /* stop as soon as distance is non-infinite */
    if (bestSignedOrientedDistance.z < INFINITE_DISTANCE) {
      break;
    }
  }

  bestSignedOrientedDistance.x = mapSignedToUnsigned(bestSignedOrientedDistance.x);
  bestSignedOrientedDistance.y = mapSignedToUnsigned(bestSignedOrientedDistance.y);
  //bestSignedOrientedDistance.x = mapDistanceToProximity(bestSignedOrientedDistance.x, uRadius.x * 2.0);
  //bestSignedOrientedDistance.y = mapDistanceToProximity(bestSignedOrientedDistance.y, uRadius.y * 2.0);
  bestSignedOrientedDistance.z = mapDistanceToProximity(bestSignedOrientedDistance.z, length(uRadius) * 2.0);

  return bestSignedOrientedDistance;
}

void main()
{
  vec3 sdfValue;
  if (uHighPrecision == 1) {
    sdfValue = findSignedDistance();
  } else {
    sdfValue = findApproximateUnsignedDistance();
  }

  if (uEnableRGB != 1) {
    sdfValue = vec3(sdfValue.z, sdfValue.z, sdfValue.z);
  }

  outColor = vec4(sdfValue.x, sdfValue.y, sdfValue.z, 1.0);
}
