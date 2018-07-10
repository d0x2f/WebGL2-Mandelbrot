#version 300 es

precision highp float;

in vec4 position;
out vec4 vertex;

uniform mat4 mvp;

void main() {
  vertex = position;
  gl_Position = position * mvp;
}