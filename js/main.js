"use strict";

import { GL } from './gl.js';

/**
 * Main entrypoint function that creates resources and performs a render.
 */
async function main() {
  const canvas = document.getElementById("c");
  const gl = new GL(canvas);

  const vertex_shader_source = await fetch('shaders/vertex.glsl').then((res) => res.text());
  const fragment_shader_source = await fetch('shaders/fragment.glsl').then((res) => res.text());

  const fragment_shader = gl.create_fragment_shader(fragment_shader_source);
  const vertex_shader = gl.create_vertex_shader(vertex_shader_source);
  const shader_program = gl.create_shader_program(vertex_shader, fragment_shader);

  gl.set_shader_program(shader_program);

  gl.create_quad(-2, -1, 3, 2);

  gl.render();
}

// run main entrypoint.
main();
