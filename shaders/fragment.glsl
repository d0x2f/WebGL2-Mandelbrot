#version 300 es

precision highp float;

in vec4 vertex;
out vec4 output_colour;

void main() {
  vec2 p = vertex.xy;
  vec2 c = p;

  vec3 color=vec3(0.0,0.0,0.0);

  for(int i=0;i<512;i++){
    p= vec2(p.x*p.x-p.y*p.y,2.0*p.x*p.y)+c;

    if (dot(p,p)>4.0){
      float colorRegulator = float(i-1)-log(((log(dot(p,p)))/log(2.0)))/log(2.0);
      color = vec3(0.95 + .012*colorRegulator , 1.0, .2+.4*(1.0+sin(.3*colorRegulator)));
      break;
    }
  }
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 m = abs(fract(color.xxx + K.xyz) * 6.0 - K.www);
  output_colour.rgb = color.z * mix(K.xxx, clamp(m - K.xxx, 0.0, 1.0), color.y);
  output_colour.a=1.0;
}