#version 300 es

precision highp float;

in vec4 vertex;
out vec4 output_colour;
uniform float continuous_cycle;
uniform vec2 julia_constant;

void main() {
  vec2 p = vertex.xy;
  vec2 c;

  if (julia_constant.x == 0.0 && julia_constant.y == 0.0) {
    c = p;
  } else {
    c = julia_constant;
  }

  vec3 color = vec3(0.0, 0.0, 0.0);

  for(int i=0;i<1024;i++){
    p = vec2(
      p.x * p.x - p.y * p.y,
      2.0 * p.x * p.y
    ) + c;

    if (dot(p, p) > 4.0) {
      float regulator = float(i) - continuous_cycle - log(log(dot(p, p)) / log(2.0)) / log(2.0);
      color = vec3(0.95 + .012 * regulator, 1.0, .1 + .4 * (1.0 + sin(.3 * regulator)));
      break;
    }
  }
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 m = abs(fract(color.xxx + K.xyz) * 6.0 - K.www);
  output_colour.rgb = color.z * mix(K.xxx, clamp(m - K.xxx, 0.0, 1.0), color.y);
  output_colour.a=1.0;
}