"use strict";

import { Matrix } from './matrix.js';

/**
 * Represents a renderable object.
 */
export class Object {
  constructor(gl) {
    this.gl = gl;
    this.transform = Matrix.identity();
  }

  /**
   * Apply a transform to this object.
   *
   * @param {Matrix} matrix Transformation matrix.
   */
  transform(matrix) {
    this.transform = this.transform.multiply(matrix);
  }

  /**
   * Render the object.
   */
  render() {
    throw 'render method not implemented on object.'
  }
}