#version 300 es

precision highp float;

const int NUM_OFFSETS = 8;

const vec2 OFFSET_DIRECTIONS[NUM_OFFSETS] = vec2[](
  vec2(-1.0, -1.0), vec2( 0.0, -1.0), vec2( 1.0, -1.0),
  vec2(-1.0,  0.0),                   vec2( 1.0,  0.0),
  vec2(-1.0,  1.0), vec2( 0.0,  1.0), vec2( 1.0,  1.0)
);

const float DISTANCE_MULTIPLIERS[NUM_OFFSETS] = float[](
  1.41421356237, 1.0, 1.41421356237,
  1.0,                1.0,
  1.41421356237, 1.0, 1.41421356237
);

const float INFINITE_DISTANCE = 65536.0;

uniform sampler2D uTexture;
uniform vec2 uRadius;
uniform vec2 uTexelSize;
uniform float uThreshold;
in vec2 vTexCoord;
out vec4 outColor;

float sampleLod(vec2 uv, float lod) {
  float value = textureLod(uTexture, uv, lod).r;
  return value;
}

float sampleLodOffset(vec2 uv, vec2 uvOffsetAmount, vec2 offsetDirection, float lod) {
  vec2 actualUV = uv + uvOffsetAmount * offsetDirection;
  float value = textureLod(
    uTexture,
    uv,
    lod
  ).r;
  return value;
}

vec3 findSignedDistance() {
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
  
  /* add up the gradient at each lod */
  vec3 gradient = vec3(0.0, 0.0, 0.0);
  for (int i = 4; i >= 0; i--) {
    float dist = sampleLod(vTexCoord, float(i));
    float dx = dFdx(dist);
    float dy = dFdy(dist);
    float d = fwidth(dist);
    float multiplier = pow(2.0, float(i));
    //multiplier = 1.0;]
    gradient += vec3(dx, dy, d) * multiplier;
  }

  gradient /= 4.0;
  gradient = clamp(
    gradient,
    vec3(-1.0, -1.0, -1.0),
    vec3( 1.0,  1.0,  1.0)
  );
  gradient /= 2.0;
  gradient += vec3(0.5, 0.5, 0.5);

  return gradient;
}

void main()
{
  vec3 sdfValue = findSignedDistance();
  outColor = vec4(sdfValue.x, sdfValue.y, sdfValue.z, 1.0);
}
