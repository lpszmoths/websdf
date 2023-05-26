#version 300 es
precision highp float;

/* provided by the user */
uniform sampler2D uTexture;
uniform float uThreshold;
uniform float uNumSamples;
uniform int uEnableRGB;
uniform float uRadius;

/* built-in */
uniform vec2 uTexelSize;

/* these change with each pass */
uniform float uProgress; /* [1.0/numPasses, 1.0] */

in vec2 vTexCoord;
out vec4 outColor;

/* default distance value */
const float INFINITE_DISTANCE = 65536.0;



/**
 * Returns 1 if outside the shape, 0 if inside
*/
float getSdfSign(float value) {
  if (value > uThreshold) {
    return 1.0;
  }
  else {
    return 0.0;
  }
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

/**
 * Samples uTexture at a specific uv
 */
float sampleTex(vec2 uv) {
  float value = texture(uTexture, uv).r;
  return value;
}

/**
 * Compares the signed oriented distance at the
 * specified offset, with the current best
 * signed oriented distance. If the new
 * distance is shorter, replaces the current
 * best distance with the new one.
 */
void evaluateSignedOrientedDistance(
  inout vec4 currentSignedOrientedDistance,
  float currentSdfSign,
  vec2 uvOffset
) {
  float dist = length(uvOffset);
  vec4 newSignedOrientedDistance = vec4(
    uvOffset.x * uRadius,
    uvOffset.y * uRadius,
    dist,
    1.0
  );
  vec2 uv = vTexCoord + uvOffset;
  float value = sampleTex(uv);
  float sign = getSdfSign(value);
  float signDiff = abs(currentSdfSign - sign);

  if (newSignedOrientedDistance.z < currentSignedOrientedDistance.z) {
    currentSignedOrientedDistance = (
      (1.0 - signDiff) * currentSignedOrientedDistance +
      signDiff * newSignedOrientedDistance
    );
  }
}

/**
 * Returns the signed direction and distance.
 * The last component (.a) is 1.0 if a
 * distance was found, 0.0 otherwise.
 */
vec4 findSignedDistance() {
  /* query the current texel at max preision */
  float currentValue = sampleTex(vTexCoord);

  /* are we inside or outside? */
  float currentSdfSign = getSdfSign(currentValue);

  if (currentSdfSign < 0.5) {
    return vec4(
      1.0,
      1.0,
      1.0,
      1.0
    );
  }
  
  vec4 bestSignedOrientedDistance = vec4(
    0.0,
    0.0,
    INFINITE_DISTANCE,
    0.0
  );
  vec2 radius = uRadius * uTexelSize * uProgress;
  vec2 increment = uTexelSize / uNumSamples;
  float maxDistance = uRadius * min(uTexelSize.x, uTexelSize.y);

  /* iterate through the top and bottom edge */
  for (
    float i = -radius.x;
    i <= radius.x;
    i += increment.x
  ) {
    vec2 uvOffset = vec2(i, -radius.y);
    float len = length(uvOffset);
    // if (len > maxDistance) {
    //   continue;
    // }

    evaluateSignedOrientedDistance(
      bestSignedOrientedDistance,
      currentSdfSign,
      uvOffset
    );
    uvOffset = vec2(i, radius.y);
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
    vec2 uvOffset = vec2(-radius.x, j);
    float len = length(uvOffset);
    // if (len > maxDistance) {
    //   continue;
    // }

    evaluateSignedOrientedDistance(
      bestSignedOrientedDistance,
      currentSdfSign,
      uvOffset
    );
    uvOffset = vec2(radius.x, j);
    evaluateSignedOrientedDistance(
      bestSignedOrientedDistance,
      currentSdfSign,
      uvOffset
    );
  }


  bestSignedOrientedDistance.x = mapSignedToUnsigned(
    bestSignedOrientedDistance.x
  );
  // bestSignedOrientedDistance.x = mapDistanceToProximity(
  //   bestSignedOrientedDistance.x,
  //   maxDistance
  // );

  bestSignedOrientedDistance.y = mapSignedToUnsigned(
    bestSignedOrientedDistance.y
  );
  // bestSignedOrientedDistance.y = mapDistanceToProximity(
  //   bestSignedOrientedDistance.y,
  //   maxDistance
  // );
  
  bestSignedOrientedDistance.z = mapDistanceToProximity(
    bestSignedOrientedDistance.z,
    maxDistance
  );
  //bestSignedOrientedDistance.z = 1.0 - bestSignedOrientedDistance.z;

  return bestSignedOrientedDistance;
}

void main()
{
  vec4 sdfValue = findSignedDistance();

  if (uEnableRGB != 1) {
    sdfValue = vec4(sdfValue.z, sdfValue.z, sdfValue.z, sdfValue.w);
    //sdfValue.x = uProgress;
    //sdfValue.z = 1.0 - uProgress;
  }

  outColor = vec4(sdfValue.x, sdfValue.y, sdfValue.z, sdfValue.w);
}
