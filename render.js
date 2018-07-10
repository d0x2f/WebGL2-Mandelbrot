"use strict";

/**
 * Class representing an OpenGL context.
 */
class GL {

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
      top = 1 + (1 / canvas_aspect - 1 / scene_aspect);
      bottom = -1 - (1 / canvas_aspect - 1 / scene_aspect);
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

/**
 * Represents a shader.
 */
class Shader {

  /**
   * @param {WebGL2RenderingContext} gl
   * @param {string} source
   * @param {integer} type
   */
  constructor(gl, source, type) {
    this.shader = gl.createShader(type);
    gl.shaderSource(this.shader, source);
    gl.compileShader(this.shader);
    if (!gl.getShaderParameter(this.shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(this.shader);
      throw 'unable to create shader.';
    }
  }

  /**
   * @return {WebGLShader}
   */
  ref() {
    return this.shader;
  }
}

/**
 * Convenience class representing a vertex shader.
 */
class VertexShader extends Shader {
  constructor(gl, source) {
    super(gl, source, gl.VERTEX_SHADER);
  }
}

/**
 * Convenience class representing a fragment shader.
 */
class FragmentShader extends Shader {
  constructor(gl, source) {
    super(gl, source, gl.FRAGMENT_SHADER);
  }
}

/**
 * Represents a linked shader program
 */
class ShaderProgram {

  /**
   * Construct the shader program by linking the given shaders.
   *
   * @param {WebGL2RenderingContext} gl
   * @param {VertexShader} vertex_shader
   * @param {FragmentShader} fragment_shader
   */
  constructor(gl, vertex_shader, fragment_shader) {
    this.gl = gl;
    this.program = gl.createProgram();
    gl.attachShader(this.program, vertex_shader.ref());
    gl.attachShader(this.program, fragment_shader.ref());
    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      gl.deleteProgram(this.program);
      throw 'unable to link shader program.';
    }
  }

  /**
   * Set a 4x4 matrix uniform value.
   *
   * @param {string} name
   * @param {Float32Array} value
   */
  set_uniform_mat4(name, value) {
    const location = this.gl.getUniformLocation(this.program, name);
    this.gl.useProgram(this.program);
    this.gl.uniformMatrix4fv(location, false, value);
  }

  /**
   * @return {WebGLProgram}
   */
  ref() {
    return this.program;
  }
}

/**
 * Represents a renderable quad.
 */
class Quad {
  /**
   * Construct using the given position and size.
   *
   * @param {WebGL2RenderingContext} gl
   * @param {float} x
   * @param {float} y
   * @param {float} width
   * @param {float} height
   */
  constructor(gl, x, y, width, height) {
    this.gl = gl;

    this.buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

    const positions = new Float32Array([
      x, y,
      x, y + height,
      x + width, y,
      x + width, y + height
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    this.recreate();
  }

  /**
   * Recreate the vertex array object.
   * May be necessary when switching shader programs.
   */
  recreate() {
    // Delete an existing vao if one exists.
    if (this.vao !== undefined) {
      this.gl.deleteVertexArray(this.vao)
    }

    this.vao = this.gl.createVertexArray();
    this.gl.bindVertexArray(this.vao);

    // Throw if there's no shader program set.
    const program = this.gl.get_super().get_shader_program();
    if (program === undefined) {
      throw "cannot recreate quad without a shader program loaded";
    }

    // Describe vertex packing.
    const attribute_location = this.gl.getAttribLocation(program.ref(), "position");
    this.gl.enableVertexAttribArray(attribute_location);

    this.gl.vertexAttribPointer(
      attribute_location,
      2, // size
      this.gl.FLOAT, // type
      false, // normalize
      0, // stride
      0 //offset
    );
  }

  /**
   * Render the quad.
   */
  render() {
    this.gl.bindVertexArray(this.vao);

    this.gl.drawArrays(
      this.gl.TRIANGLE_STRIP, // primitive
      0, // offset
      4 // count
    );
  }
}

/**
 * Main entrypoint function that creates resources and performs a render.
 */
async function main() {
  const canvas = document.getElementById("c");
  const gl = new GL(canvas);

  const vertex_shader_source = await fetch('shader.vert').then((res) => res.text());
  const fragment_shader_source = await fetch('shader.frag').then((res) => res.text());

  const fragment_shader = gl.create_fragment_shader(fragment_shader_source);
  const vertex_shader = gl.create_vertex_shader(vertex_shader_source);
  const shader_program = gl.create_shader_program(vertex_shader, fragment_shader);

  gl.set_shader_program(shader_program);

  gl.create_quad(-2, -1, 3, 2);

  gl.render();
}

// run main entrypoint.
main();
