"use strict";

import { GL } from './gl.js';

/**
 * Main entrypoint function that creates resources and performs a render onto the given canvas.
 */
async function mandelbrot(canvas) {
  const gl = new GL(canvas);

  const vertex_shader_source = await fetch('shaders/vertex.glsl').then((res) => res.text());
  const fragment_shader_source = await fetch('shaders/fragment.glsl').then((res) => res.text());

  const fragment_shader = gl.create_fragment_shader(fragment_shader_source);
  const vertex_shader = gl.create_vertex_shader(vertex_shader_source);
  const shader_program = gl.create_shader_program(vertex_shader, fragment_shader);

  gl.set_shader_program(shader_program);

  const quad = gl.create_quad(-5, -3, 10, 6);
  const mesh = gl.create_mesh([quad]);
  gl.add_object_to_scene(mesh);

  gl.set_camera_position(-0.5, 0, 0);

  gl.event_loop();
}

// Start main entrypoint.
const canvas = document.getElementById("c");
mandelbrot(canvas);
