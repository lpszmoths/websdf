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
  outColor = vec4(dx, 0.5, dy, 1.0);
}
