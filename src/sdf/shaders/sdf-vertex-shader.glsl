#version 300 es

in vec2 aPos;
in vec2 aTexCoord;
out vec2 vTexCoord;

void main()
{
  gl_Position = vec4(aPos, 0.0, 1.0);
  vTexCoord = aTexCoord;
}
