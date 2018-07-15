#version 300 es

precision highp float;

in vec3 position;
out vec4 vertex;

uniform mat4 model;
uniform mat4 view_projection;

void main() {
  vertex = model *  vec4(position, 1.0);
  gl_Position = view_projection * vertex;
}