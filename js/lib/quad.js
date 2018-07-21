"use strict";

import { Object } from './object.js';

/**
 * Represents a renderable quad.
 */
export class Quad extends Object {
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
    super(gl);
    this.transform = this.transform.scale(width, height, 1);
    this.transform = this.transform.translate(x, y, 1);
    this.primitive = gl.get_super().get_quad_primitive();
  }

  /**
   * Render the quad.
   *
   * @param {Matrix} model Model for this context.
   */
  render(model) {
    this.gl.get_super().upload_model_matrix(
      model.multiply(this.transform)
    );
    this.primitive.render();
  }
}