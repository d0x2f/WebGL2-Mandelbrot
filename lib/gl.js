"use strict"

import { FragmentShader, VertexShader, ShaderProgram } from './shader.js';
import { QuadPrimitive } from './quad-primitive.js';
import { Quad } from './quad.js';
import { Mesh } from './mesh.js';
import { Matrix } from './matrix.js';
import { Vector } from './vector.js';

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

    this.render_hooks = [];

    this.objects = [];

    this.projection_matrix = Matrix.identity();
    this.view_matrix = Matrix.identity();

    this.camera_position = new Vector(0, 0, 0, 1);
  }

  /**
   * @return {WebGL2RenderingContext} a raw reference to the WebGL2 api.
   */
  ref() {
    return this.gl;
  }

  /**
   * Add a callable hook to be run on each render pass.
   *
   * @param {callable} hook
   */
  add_render_hook(hook) {
    this.render_hooks.push(hook);
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
   * Returns a quad primitive so it's sonstituent VBO can be resued.
   *
   * @return {QuadPrimitive}
   */
  get_quad_primitive() {
    if (this.quad_primitive === undefined) {
      this.quad_primitive = new QuadPrimitive(this.ref());
    }
    return this.quad_primitive;
  }

  /**
   * Create a quad with given position and size.
   *
   * @param {float} x
   * @param {float} y
   * @param {float} width
   * @param {float} height
   *
   * @return {Quad}
   */
  create_quad(x, y, width, height) {
    return new Quad(this.ref(), x, y, width, height);
  }

  /**
   * Create a mesh with the given objects.
   *
   * @param {array} objects
   */
  create_mesh(objects) {
    return new Mesh(this.ref(), objects);
  }

  /**
   * Add an object to the scene in order to be rendered.
   *
   * @param {Object} object
   */
  add_object_to_scene(object) {
    this.objects.push(object);
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
   * Sets the position of the camera.
   *
   * @param {float} x
   * @param {float} y
   * @param {float} z
   */
  set_camera_position(x, y, z) {
    this.camera_position = new Vector(x, y, z);
    this.view_matrix = Matrix.identity().translate(-x, -y, -z);
  }

  /**
   * Translates the position of the camera.
   *
   * @param {float} x
   * @param {float} y
   * @param {float} z
   */
  translate_camera_position(x, y, z) {
    this.camera_position = new Vector(
      this.camera_position.x + x,
      this.camera_position.y + y,
      this.camera_position.z + z,
      0
    );
    this.view_matrix = Matrix.identity().translate(
      -this.camera_position.x,
      -this.camera_position.y,
      -this.camera_position.z
    );
  }

  /**
   * Computes world coordinates from given screen coordinates.
   *
   * @param {float} x
   * @param {float} y
   * @param {float} z
   */
  unproject(x, y, z) {
    return this.projection_matrix.inverse().multiply_vector(new Vector(
      ((2 * x) / this.canvas.clientWidth) - 1,
      ((2 * y) / this.canvas.clientHeight) - 1,
      (2 * z) - 1,
      1
    ));
  }

  /**
   * Upload the current model matrix to the gpu.
   */
  upload_model_matrix(model) {
    this.get_shader_program().set_uniform_mat4('model', model.transpose().as_float_array());
  }

  /**
   * Upload the current view and projection matrix to the gpu.
   */
  upload_view_projection_matrix() {
    this.get_shader_program().set_uniform_mat4(
      'view_projection',
      this.projection_matrix.multiply(this.view_matrix).transpose().as_float_array()
    );
  }

  /**
   * Resize the canvas and recalculate the projection to maintain the desired aspect ratio.
   */
  resize() {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    // If the width & height haven't changed, don't bother resizing.
    if (this.canvas.width === width && this.canvas.height === height) {
      return false;
    }

    // Update canvas width and height.
    this.canvas.width = width;
    this.canvas.height = height;

    // Compute apparent aspect ratio.
    const canvas_aspect = width / height;

    // Compute appropriate orthographic projection matrix.
    let left, right, top, bottom;

    if (canvas_aspect > 1) {
      left = -canvas_aspect;
      right = canvas_aspect;
      top = 1;
      bottom = -1;
    } else {
      left = -1;
      right = 1;
      top = 1 / canvas_aspect;
      bottom = -1 / canvas_aspect;
    }

    this.projection_matrix = new Matrix(
      new Vector(2 / (right - left), 0, 0, -(right + left) / (right - left)),
      new Vector(0, 2 / (top - bottom), 0, -(top + bottom) / (top - bottom)),
      new Vector(0, 0, 1, 0),
      new Vector(0, 0, 0, 1)
    );

    return true;
  }

  /**
   * Render the scene.
   */
  render() {
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    this.gl.useProgram(this.get_shader_program().ref());

    this.upload_view_projection_matrix();

    this.objects.forEach((object) => object.render(Matrix.identity()));
  }
  /**
   * The event loop executed for each tick.
   */
  event_loop() {
    // Measure time delta for fps independant physics calculations
    const frame_time = Date.now();
    if (this.last_frame_time === undefined) {
      this.last_frame_time = frame_time;
    }
    const frame_delta = frame_time - this.last_frame_time;
    this.last_frame_time = frame_time;

    // Keep track of changes and only render if necessary.
    let scene_dirty = false;

    scene_dirty |= this.resize();

    this.render_hooks.forEach((hook) => {
      scene_dirty |= hook(frame_delta);
    });

    if (scene_dirty) {
      this.render();
    }

    // Schedule another tick
    requestAnimationFrame(() => this.event_loop());
  }
}
