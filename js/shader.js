"use strict";

/**
 * Represents a shader.
 */
export class Shader {

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
      const log = gl.getShaderInfoLog(this.shader);
      gl.deleteShader(this.shader);
      throw 'unable to create shader. gl said: ' + log;
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
export class VertexShader extends Shader {
  constructor(gl, source) {
    super(gl, source, gl.VERTEX_SHADER);
  }
}

/**
 * Convenience class representing a fragment shader.
 */
export class FragmentShader extends Shader {
  constructor(gl, source) {
    super(gl, source, gl.FRAGMENT_SHADER);
  }
}

/**
 * Represents a linked shader program
 */
export class ShaderProgram {

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
   * Set a 2x1 vector uniform value.
   *
   * @param {string} name
   * @param {Vector} value
   */
  set_uniform_vec2(name, value) {
    const location = this.gl.getUniformLocation(this.program, name);
    this.gl.useProgram(this.program);
    this.gl.uniform2f(location, value.x, value.y);
  }

  /**
   * Set a float uniform value.
   *
   * @param {string} name
   * @param {float} value
   */
  set_uniform_float(name, value) {
    const location = this.gl.getUniformLocation(this.program, name);
    this.gl.useProgram(this.program);
    this.gl.uniform1f(location, value);
  }

  /**
   * @return {WebGLProgram}
   */
  ref() {
    return this.program;
  }
}
