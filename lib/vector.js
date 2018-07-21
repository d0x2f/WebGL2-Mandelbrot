"use strict";

export class Vector {
  /**
   * @param {float} x
   * @param {float} y
   * @param {float} z
   * @param {float} w
   */
  constructor(x, y, z, w) {
    // Initialise with the zeros.
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  /**
   * Computes the dot product with the given vector.
   *
   * @param {Vector} b
   *
   * @return {Vector}
   */
  dot(b) {
    return this.x * b.x + this.y * b.y + this.z * b.z + this.w * b.w;
  }

  /**
   * Multiplies the vector by the given scalar.
   *
   * @param {float} s
   *
   * @return {Vector}
   */
  multiply(s) {
    const a = this;
    return new Vector(a.x * s, a.y * s, a.z * s, a.w * s);
  }
}