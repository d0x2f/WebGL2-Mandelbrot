"use strict";

/**
 * Represents a quad primitive which can be reused by quad objects
 * to avoid a new VAO for each quad.
 */
export class QuadPrimitive {
  /**
   * @param {WebGL2RenderingContext} gl
   */
  constructor(gl) {
    this.gl = gl;

    this.buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

    const positions = new Float32Array([
      0, 0,
      0, 1,
      1, 0,
      1, 1,
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
      this.gl.deleteVertexArray(this.vao);
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