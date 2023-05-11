#version 300 es

precision highp float;

uniform sampler2D uTexture;
uniform float aRadiusX;
uniform float aRadiusY;
in vec2 vTexCoord;
out vec4 outColor;

void main()
{
  float h = texture(uTexture, vTexCoord).r;
  float dx = dFdx(h);
  float dy = dFdy(h);
  float fw = fwidth(h);

  dx = clamp(dx * 16.0, 0.0, 1.0);
  outColor = vec4(dx, fw, dy, 1.0);
}
