"use strict";

import { FragmentShader, VertexShader, ShaderProgram } from './shader.js';
import { Quad } from './quad.js';

/**
 * Class representing an OpenGL context.
 */
export class GL {
  /**
   * Construct from the GL context of the given canvas.
   *
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext("webgl2");
    this.gl.get_super = () => this;
    this.quads = [];

    window.addEventListener('resize', () => {
      this.render();
    });
  }

  /**
   * @return {WebGL2RenderingContext} a raw reference to the WebGL2 api.
   */
  ref() {
    return this.gl;
  }


  /**
   * Create a vertex shader from the given source.
   *
   * @param {string} source
   *
   * @return {VertexShader}
   */
  create_vertex_shader(source) {
    return new VertexShader(this.ref(), source);
  }

  /**
   * Create a fragment shader from the given source.
   *
   * @param {string} source
   *
   * @return {FragmentShader}
   */
  create_fragment_shader(source) {
    return new FragmentShader(this.ref(), source);
  }

  /**
   * Create a shader program by linking the given shaders.
   *
   * @param {VertexShader} vertex_shader
   * @param {FragmentShader} fragment_shader
   */
  create_shader_program(vertex_shader, fragment_shader) {
    return new ShaderProgram(this.ref(), vertex_shader, fragment_shader);
  }

  /**
   * Create a quad with given position and size.
   *
   * @param {float} x
   * @param {gloat} y
   * @param {float} width
   * @param {float} height
   *
   * @return {Quad}
   */
  create_quad(x, y, width, height) {
    const quad = new Quad(this.ref(), x, y, width, height);
    this.quads.push(quad);
    return quad;
  }

  /**
   * Set the shader program to use when rendering.
   *
   * @param {ShaderProgram} shader_program
   */
  set_shader_program(shader_program) {
    this.shader_program = shader_program;
  }

  /**
   * Fetch the currently active shader program.
   *
   * @return {ShaderProgram}
   */
  get_shader_program() {
    return this.shader_program;
  }

  /**
   * Set the current model, view and projection matrix.
   *
   * @param {Float32Array} mvp
   */
  set_mvp(mvp) {
    this.get_shader_program().set_uniform_mat4('mvp', mvp);
  }

  /**
   * Resize the canvas and recalculate the projection to maintain the desired aspect ratio.
   */
  resize() {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    // If the width & height haven't changed, don't bother resizing.
    if (this.canvas.width === width && this.canvas.height === height) {
      return;
    }

    // Update canvas width and height.
    this.canvas.width = width;
    this.canvas.height = height;

    // Compute apparent aspect ratio.
    const canvas_aspect = width / height;
    const scene_aspect = 3 / 2;

    // Compute appropriate orthographic projection matrix.
    let left, right, top, bottom;

    if (canvas_aspect > scene_aspect) {
      left = -2 - (canvas_aspect - scene_aspect);
      right = 1 + (canvas_aspect - scene_aspect);
      top = 1;
      bottom = -1;
    } else {
      left = -2;
      right = 1;
      top = 1 + ((1 / canvas_aspect) - (1 / scene_aspect));
      bottom = -1 - ((1 / canvas_aspect) - (1 / scene_aspect));
    }

    const mvp = new Float32Array([
      2 / (right - left), 0, 0, -(right + left) / (right - left),
      0, 2 / (top - bottom), 0, -(top + bottom) / (top - bottom),
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
    this.set_mvp(mvp);
  }

  /**
   * Render the scene.
   */
  render() {
    this.resize();

    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    this.gl.useProgram(this.get_shader_program().ref());

    this.quads.forEach((quad) => quad.render());
  }
}